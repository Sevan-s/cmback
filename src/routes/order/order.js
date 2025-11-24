const express = require("express");
const router = express.Router();
const { transporter } = require("../../middleware/mailer");
const { cleanObject } = require("../../utils/cleanObject");
const Product = require("../../models/product");
const Stripe = require("stripe");
const giftCard = require("../../models/giftCard");
const stripe = new Stripe(process.env.STRIPE_LIVE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

const ADMIN_EMAILS = [
    "contact@cousumouche.fr",
    "perrine.donfut@gmail.com",
];

function generateGiftCardCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 15) {
            code += "-";
        }
    }
    return code;
}

function addOneYear(date) {
    const d = new Date(date);
    d.setUTCFullYear(d.getUTCFullYear() + 1);
    return d;
}

async function refundPartialForSession(sessionId, refundAmountCents) {
    if (!sessionId) {
        console.warn("Aucun sessionId fourni pour le remboursement Stripe");
        return;
    }
    if (!refundAmountCents || refundAmountCents <= 0) {
        console.warn("Montant de remboursement invalide :", refundAmountCents);
        return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.payment_intent) {
        console.warn("Pas de payment_intent associé à la session", sessionId);
        return;
    }

    const refund = await stripe.refunds.create({
        payment_intent: session.payment_intent,
        amount: Math.round(refundAmountCents),
        reason: "requested_by_customer",
    });

    console.log(
        `💸 Remboursement partiel Stripe lancé pour la session ${sessionId} : ${refundAmountCents} cents`
    );
    return refund;
}

router.post("/confirm", async (req, res) => {
    console.log("➡️ /api/orders/confirm hit");
    try {
        const raw = req.body || {};
        console.log("raw body:", raw);
        const data = cleanObject(raw);

        const {
            sessionId,
            customerEmail,
            customer = {},
            adresse,
            items = [],
            total: totalFromClient,
            reduction = 0,
            giftCardCode,
            giftCardAmount,
        } = data;

        console.log("items reçus:", JSON.stringify(items, null, 2));

        const effectiveReduction =
            typeof giftCardAmount === "number" && giftCardAmount > 0
                ? giftCardAmount
                : (typeof reduction === "number" ? reduction : 0);

        const dateCommande = new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        const total =
            typeof totalFromClient === "number"
                ? totalFromClient
                : items.reduce(
                    (sum, it) =>
                        sum +
                        (Number(it.subTotal) ||
                            Number(it.price) * Number(it.quantity) ||
                            0),
                    0
                );

        if (!customerEmail || !items.length) {
            return res.status(400).json({
                error: "customerEmail et items sont requis",
            });
        }

        const enhancedItems = [];
        for (const it of items) {
            const name = (it.name || "").toLowerCase();
            const isGiftCard =
                name.includes("carte cadeau") ||
                it.type === "gift_card" ||
                it.isGiftCard === true;

            if (isGiftCard) {
                const frontGift = it.giftCardData || {};

                const amount =
                    typeof frontGift.montant === "number"
                        ? frontGift.montant
                        : typeof it.subTotal === "number"
                            ? it.subTotal
                            : typeof it.price === "number"
                                ? it.price
                                : 0;

                let code;
                let existing;
                do {
                    code = generateGiftCardCode();
                    existing = await giftCard.findOne({ code });
                } while (existing);

                const now = new Date();
                const expiresAt = addOneYear(now);

                const newGiftCard = await giftCard.create({
                    price: amount,
                    code,
                    expiresAt,
                });

                console.log("🎁 Gift card créée:", newGiftCard);

                enhancedItems.push({
                    ...it,
                    giftCardData: {
                        pour: frontGift.pour || "",
                        deLaPartDe: frontGift.deLaPartDe || frontGift.delaPartDe || "",
                        message: frontGift.message || "",
                        montant: amount,
                        code: newGiftCard.code,
                        date: now.toLocaleDateString("fr-FR"),
                        expirationDate: newGiftCard.expiresAt,
                    },
                });
            } else {
                enhancedItems.push(it);
            }
        }

        if (giftCardCode) {
            try {
                const code = String(giftCardCode).toUpperCase().trim();
                const card = await giftCard.findOne({ code });

                if (!card) {
                    console.warn("Gift card code not found at confirm:", code);
                } else {
                    const now = new Date();
                    if (card.expiresAt <= now) {
                        console.warn("Gift card expired at confirm:", code);
                    } else if (card.redeemed) {
                        console.warn("Gift card already redeemed at confirm:", code);
                    } else {
                        card.redeemed = true;
                        card.redeemedAt = now;
                        await card.save();
                        console.log("🎟️ Gift card redeemed at confirm:", code);
                    }
                }
            } catch (e) {
                console.error("Error while redeeming gift card at confirm:", e);
            }
        }

        const finalItems = [];
        let refundAmountCents = 0;
        const refundedLines = [];

        for (const it of enhancedItems) {
            const name = (it.name || "").toLowerCase();
            const isGiftCard =
                name.includes("carte cadeau") ||
                it.type === "gift_card" ||
                it.isGiftCard === true;

            if (isGiftCard) {
                finalItems.push(it);
                continue;
            }
            const productId =
                it.product?._id || it.productId || it.id || null;
            const productSlug = it.slug || it.productSlug || null;

            let productFilter = null;
            if (productId) {
                productFilter = { _id: productId };
            } else if (productSlug) {
                productFilter = { slug: productSlug };
            } else {
                console.warn("Impossible de déterminer le produit pour l'item :", it);
                finalItems.push(it);
                continue;
            }

            const productDoc = await Product.findOne(productFilter);
            if (!productDoc) {
                console.warn("Produit introuvable en base pour l'item :", productFilter);
                finalItems.push(it);
                continue;
            }

            const quantity = Number(it.quantity) || 1;
            if (productDoc.category !== "Stock") {
                finalItems.push(it);
                continue;
            }
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productDoc._id, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                console.error(
                    `Stock insuffisant pour le produit STOCK ${productDoc.slug} (stock actuel : ${productDoc.stock}, qty demandée: ${quantity})`
                );
                const lineTotal =
                    Number(it.subTotal) ||
                    (Number(it.price) || 0) * quantity ||
                    0;
                if (lineTotal > 0) {
                    const lineCents = Math.round(lineTotal * 100);
                    refundAmountCents += lineCents;
                    refundedLines.push({
                        name: it.name,
                        slug: productDoc.slug,
                        amountCents: lineCents,
                    });
                }
                continue;
            }

            console.log(
                `✅ Stock décrémenté pour ${updatedProduct.slug} : nouveau stock = ${updatedProduct.stock}`
            );
            finalItems.push(it);
        }

        let refundedTotal = 0;
        if (refundAmountCents > 0 && sessionId) {
            try {
                if (finalItems.length === 0) {
                    const session = await stripe.checkout.sessions.retrieve(sessionId);

                    if (!session.payment_intent) {
                        console.warn("Pas de payment_intent pour la session", sessionId);
                    } else {
                        await stripe.refunds.create({
                            payment_intent: session.payment_intent,
                            reason: "requested_by_customer",
                        });
                        console.log(
                            `💸 Remboursement TOTAL Stripe lancé pour la session ${sessionId}`
                        );
                        refundedTotal = total;
                    }
                } else {
                    await refundPartialForSession(sessionId, refundAmountCents);
                    console.log(
                        "Lignes remboursées (produits Stock épuisés) :",
                        refundedLines
                    );
                    refundedTotal = refundAmountCents / 100;
                }
            } catch (refundErr) {
                console.error(
                    "Erreur lors du remboursement Stripe pour produits Stock épuisés :",
                    refundErr
                );
            }
        }
        const itemsForEmail = finalItems;
        const effectiveTotal = Math.max(0, total - refundedTotal);
        const LABELS = {
            name: "Nom du produit",
            price: "Prix (€)",
            quantity: "Quantité",
            dimension: "Taille / Dimension",
            bearEar: "Oreilles d’ours",
            fabricSelected: "Tissus sélectionnés",
            embroidery: "Texte brodé",
            message: "Message",
            who: "Pour qui",
            lot: "Lot",
            label: "Étiquette",
            strap: "Sangle",
            code: "Code de la carte cadeau",
            montant: "Montant",
            value: "Valeur",
            giftCardSended: "Mode d’envoi",
            deLaPartDe: "De la part de",
            pour: "Pour",
        };

        const IGNORED_KEYS = [
            "product",
            "id",
            "addedAt",
            "selectedStrap",
            "selectedLabel",
            "gift",
            "giftCardData",
            "subTotal",
        ];

        const cleanFilename = (str) => {
            if (!str) return "";
            const parts = str.split("/");
            const file = parts[parts.length - 1];
            const afterDash = file.includes("-") ? file.split("-").pop() : file;
            return afterDash.replace(/\.[^/.]+$/, "").trim();
        };

        const decodeFrench = (text) => {
            if (typeof text !== "string") return text;
            return text
                .replace(/Ã©/g, "é")
                .replace(/Ã¨/g, "è")
                .replace(/Ã /g, "à")
                .replace(/Ã¢/g, "â")
                .replace(/Ãª/g, "ê")
                .replace(/Ã«/g, "ë")
                .replace(/Ã´/g, "ô")
                .replace(/Ã»/g, "û")
                .replace(/Ã¹/g, "ù")
                .replace(/Ã§/g, "ç")
                .replace(/Ã€/g, "À")
                .replace(/Ã‰/g, "É");
        };

        const formatValue = (val, key) => {
            if (val === null || val === undefined || val === "") return "—";

            if (key === "fabricSelected" && Array.isArray(val)) {
                const list = val
                    .map((v) => {
                        const name = typeof v === "object" ? v.name || v.url : v;
                        return `<li>${decodeFrench(cleanFilename(name))}</li>`;
                    })
                    .join("");
                return `<ul>${list}</ul>`;
            }

            if (["label", "strap"].includes(key) && typeof val === "string") {
                return decodeFrench(cleanFilename(val));
            }

            if (Array.isArray(val)) {
                return `<ul>${val
                    .map((v) => `<li>${formatValue(v)}</li>`)
                    .join("")}</ul>`;
            }

            if (typeof val === "object") {
                return `<ul>${Object.entries(val)
                    .map(
                        ([k, v]) =>
                            `<li><strong>${LABELS[k] || k}</strong> : ${formatValue(
                                v,
                                k
                            )}</li>`
                    )
                    .join("")}</ul>`;
            }

            return decodeFrench(String(val));
        };

        const itemsHtml = itemsForEmail
            .map((it, idx) => {
                const isSortieDeBain =
                    it.name?.toLowerCase().includes("sortie de bain");
                const isGiftCard =
                    (it.name || "").toLowerCase().includes("carte cadeau") ||
                    it.type === "gift_card" ||
                    it.isGiftCard === true;

                if (isGiftCard) {
                    const giftData = it.giftCardData || {};

                    const code = giftData.code || "—";
                    const montant =
                        typeof giftData.montant === "number"
                            ? `${giftData.montant.toFixed(2)} €`
                            : "—";
                    const date = giftData.date || dateCommande;
                    const expiration = giftData.expirationDate
                        ? new Date(giftData.expirationDate).toLocaleDateString("fr-FR")
                        : "—";

                    const pour = giftData.pour || "—";
                    const deLaPartDe =
                        giftData.deLaPartDe || giftData.delaPartDe || "—";
                    const message =
                        giftData.message && giftData.message.trim()
                            ? giftData.message
                            : "—";

                    const modeEnvoi = it.giftCardSended || "—";

                    return `
                        <div style="margin-bottom: 20px;">
                        <h4>Carte cadeau</h4>
                        <ul>
                            <li><strong>Code de la carte cadeau</strong> : ${code}</li>
                            <li><strong>Montant</strong> : ${montant}</li>
                            <li><strong>Date d’émission</strong> : ${date}</li>
                            <li><strong>Date d’expiration</strong> : ${expiration}</li>
                            <li><strong>De la part de</strong> : ${deLaPartDe}</li>
                            <li><strong>Pour</strong> : ${pour}</li>
                            <li><strong>Message</strong> : ${message}</li>
                            <li><strong>Mode d’envoi</strong> : ${modeEnvoi}</li>
                        </ul>
                        </div>
                    `;
                }

                const lignes = Object.entries(it)
                    .filter(
                        ([key]) =>
                            !IGNORED_KEYS.includes(key) &&
                            (key !== "bearEar" || isSortieDeBain)
                    )
                    .map(([key, val]) => {
                        const label = LABELS[key] || key;
                        return `<li><strong>${label}</strong> : ${formatValue(
                            val,
                            key
                        )}</li>`;
                    })
                    .join("");

                return `
          <div style="margin-bottom: 20px;">
            <h4>Article ${idx + 1}</h4>
            <ul>${lignes}</ul>
          </div>
        `;
            })
            .join("<hr/>");

        const customerHtml = `
      <p><strong>Client :</strong><br/>
      ${[customer.firstName, customer.lastName]
                .filter(Boolean)
                .join(" ") || ""}
      <br/>
      ${customer.address || ""}
      <br/>
      ${customer.phone ? "📞 " + customer.phone : ""}</p>
    `;

        const adresseHtml = adresse
            ? `
      <p><strong>Point relais :</strong><br/>
      ${adresse.Nom || ""}<br/>
      ${adresse.Adresse1 || ""}<br/>
      ${[adresse.CP, adresse.Ville].filter(Boolean).join(" ")}</p>
    `
            : "";

        let discountHtml = "";

        if (giftCardCode && effectiveReduction > 0) {
            discountHtml = `
    <p><strong>Code cadeau utilisé :</strong> ${giftCardCode}</p>
    <p><strong>Montant de la réduction :</strong> -${effectiveReduction.toFixed(2)} €</p>
  `;
        } else if (effectiveReduction > 0) {
            discountHtml = `
    <p><strong>Réduction appliquée :</strong> -${effectiveReduction.toFixed(2)} €</p>
  `;
        }
        const html = `
            <h2>Confirmation de commande</h2>
            <p>Merci pour votre commande.</p>
            <p><strong>Date de commande :</strong> ${dateCommande}</p>

            ${customerHtml}
            ${adresseHtml}

            <h3>Détails des articles</h3>
            ${itemsHtml}

            ${discountHtml}
            ${refundedTotal > 0
                ? `<p><strong>Remboursement pour produit(s) en Stock épuisé(s) :</strong> -${refundedTotal.toFixed(
                    2
                )} €</p>`
                : ""
            }
            <p><strong>Total final :</strong> ${effectiveTotal.toFixed(2)} €</p>
            <p><small>Session Stripe : ${sessionId || "N/A"}</small></p>
            `;

        const to = [customerEmail];
        const ccList = ADMIN_EMAILS.filter(
            (email) => email && email !== customerEmail
        );

        const mailOptions = {
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            ...(ccList.length ? { cc: ccList } : {}),
            subject: `Confirmation de commande - ${sessionId || ""}`,
            text: `Merci pour votre commande sur Cousu Mouche. Total : ${total.toFixed(
                2
            )} €`,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email confirmation envoyé:", info);

        return res.json({ success: true });
    } catch (err) {
        console.error("Erreur envoi email confirmation :", err);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
});

module.exports = router;