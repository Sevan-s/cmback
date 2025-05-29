const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

router.post("/send-confirmation", async (req, res) => {
  const { cartItems, clientEmail } = req.body;
  const itemsHtml = cartItems.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.color}</td>
      <td>${item.motif}</td>
      <td>${item.price} €</td>
    </tr>
  `).join("");

  const html = `
    <h2>Confirmation de commande</h2>
    <p>Merci pour votre commande sur CousuMouche ! Voici le récapitulatif :</p>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>#</th><th>Nom</th><th>Couleur</th><th>Motif</th><th>Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p>Nous vous contacterons bientôt pour la livraison 📦</p>
  `;

  try {
    await transporter.sendMail({
      from: `"CousuMouche" <${process.env.MAIL_USER}>`,
      to: [clientEmail, "perrine.donfut@gmail.com"],
      subject: "Confirmation de commande",
      html,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur email :", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;