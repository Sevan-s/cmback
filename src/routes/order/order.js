const express = require("express");
const router = express.Router();
const { transporter } = require("../../middleware/mailer");
const { cleanObject } = require("../../utils/cleanObject");

const ADMIN_EMAILS = [
    "contact@cousumouche.fr",
    "perrine.donfut@gmail.com",
];



router.post("/confirm", async (req, res) => {
    try {
        const raw = req.body || {};
        const data = cleanObject(raw);
        const dateCommande = new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
        const {
            sessionId,
            customerEmail,
            customer = {},
            adresse,
            items = [],
            total: totalFromClient,
        } = data;

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

        const LABELS = {
            name: "Nom du produit",
            price: "Prix (€)",
            quantity: "Quantité",
            //   subTotal: "Sous-total (€)",
            dimension: "Taille / Dimension",
            bearEar: "Oreilles d’ours",
            fabricSelected: "Tissus sélectionnés",
            embroidery: "Texte brodé",
            message: "Message",
            who: "Pour qui",
            lot: "Lot",
            label: "Étiquette",
            strap: "Sangle",
        };
        console.log("customerEmail : ", customerEmail)

        const IGNORED_KEYS = [
            "product",
            "id",
            "addedAt",
            "selectedStrap",
            "selectedLabel",
            "giftCardData",
            "montant",
            "gift",
            "subTotal"
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
                return `<ul>${val.map((v) => `<li>${formatValue(v)}</li>`).join("")}</ul>`;
            }

            if (typeof val === "object") {
                return `<ul>${Object.entries(val)
                    .map(
                        ([k, v]) =>
                            `<li><strong>${LABELS[k] || k}</strong> : ${formatValue(v, k)}</li>`
                    )
                    .join("")}</ul>`;
            }

            return decodeFrench(String(val));
        };

        const itemsHtml = items
            .map((it, idx) => {
                const isSortieDeBain =
                    it.name?.toLowerCase().includes("sortie de bain");

                const lignes = Object.entries(it)
                    .filter(
                        ([key]) =>
                            !IGNORED_KEYS.includes(key) &&
                            (key !== "bearEar" || isSortieDeBain)
                    )
                    .map(([key, val]) => {
                        const label = LABELS[key] || key;
                        return `<li><strong>${label}</strong> : ${formatValue(val, key)}</li>`;
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
      ${[customer.firstName, customer.lastName].filter(Boolean).join(" ") || ""}
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

        const html = `
      <h2>Confirmation de commande</h2>
      <p>Merci pour votre commande.</p>
      <p><strong>Date de commande :</strong> ${dateCommande}</p>


      ${customerHtml}
      ${adresseHtml}

      <h3>Détails des articles:</h3>
      ${itemsHtml}

      <p><strong>Total :</strong> ${total.toFixed(2)} €</p>
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
            text: `Merci pour votre commande sur Cousu Mouche. Total : ${total.toFixed(2)} €`, html,
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