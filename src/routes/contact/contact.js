const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/contact", async (req, res) => {
  const { subject, email, message } = req.body;

  try {
    const resp1 = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.FROM_EMAIL, name: "Formulaire CousuMouche" },
        to: [{ email: "contact@cousumouche.fr" }],
        subject: `Message du site - ${subject}`,
        htmlContent: `
          <p><strong>De :</strong> ${email}</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <p>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Brevo -> contact :", resp1.status, resp1.data);

    const resp2 = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.FROM_EMAIL, name: "CousuMouche" },
        to: [{ email }],
        subject: `Votre message a bien été reçu – CousuMouche`,
        htmlContent: `
          <p>Bonjour,</p>
          <p>Nous avons bien reçu votre message concernant : <strong>${subject}</strong>.</p>
          <p>Voici une copie de votre message :</p>
          <blockquote>${message}</blockquote>
          <p>Nous reviendrons vers vous dans un délai de 72h.</p>
          <br />
          <p>Merci pour votre confiance,<br /> CousuMouche 🌿</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Brevo -> client :", resp2.status, resp2.data);

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur d'envoi via Brevo :", error.response?.data || error.message);
    res.status(500).json({ error: "Échec de l'envoi de l'e-mail" });
  }
});

module.exports = router;