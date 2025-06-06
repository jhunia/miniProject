import express from 'express';
const router = express.Router();
import axios from 'axios';

router.post('/initialize', async (req, res) => {
  const { email, amount } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100 // Paystack uses Pesewas (so ₵10 = 1000)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    res.status(200).json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

export default router;

//the route name is /paystack/initialize
//this route initializes a payment transaction with Paystack
//it expects an email and amount in the request body