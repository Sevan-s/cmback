const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

router.post("/contact", async (req, res) => {
  const { subject, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Formulaire CousuMouche" <${process.env.MAIL_USER}>`,
      to: "perrine.donfut@gmail.com",
      subject: `Message du site - ${subject}`,
      html: `
        <p><strong>De :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p>${message}</p>
      `,
    });

    await transporter.sendMail({
      from: `"CousuMouche" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Votre message a bien été reçu – CousuMouche`,
      html: `
        <p>Bonjour,</p>
        <p>Nous avons bien reçu votre message concernant : <strong>${subject}</strong>.</p>
        <p>Voici une copie de votre message :</p>
        <blockquote>${message}</blockquote>
        <p>Nous reviendrons vers vous dans un délai de 72h.</p>
        <br />
        <p>Merci pour votre confiance,<br /> CousuMouche 🌿</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    res.status(500).json({ error: "Échec de l'envoi de l'e-mail" });
  }
});

module.exports = router;