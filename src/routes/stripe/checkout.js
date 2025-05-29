const express = require('express');
require('dotenv').config();
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amount,
            product_data: {
              name: 'Total :',
              description: 'Paiement de la commande',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: 'https://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}',
    });

    res.send({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Erreur création session Stripe :", err);
    res.status(500).json({ error: "Erreur création session Stripe" });
  }
});

router.get('/session-status', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID manquant" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return res.json({
      status: session.status,
      customer_email: session.customer_details?.email || '',
    });
  } catch (err) {
    console.error("Erreur récupération session Stripe :", err);
    return res.status(500).json({ error: "Impossible de récupérer le statut de la session" });
  }
});

module.exports = router;