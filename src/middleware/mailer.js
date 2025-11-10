const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

transport.verify((err, success) => {
  if (err) {
    console.error("Mailtrap API error:", err);
  } else {
    console.log("Mailtrap API prêt ✅");
  }
});

module.exports = { transporter: transport };