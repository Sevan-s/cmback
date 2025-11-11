
const express = require('express');
const mongoose = require('mongoose');
const timeLog = require('./src/middleware/timelog.js')
const HelloWRouter = require('./src/routes/helloworld/helloworld.js')
const productRouter = require('./src/routes/products/productRoutes.js');
const userRouter = require('./src/routes/user/userRoutes.js');
const uploadRouter = require('./src/routes/upload/upload.js');
const checkoutRoutes = require('./src/routes/stripe/checkout.js');
const contactRoute = require('./src/routes/contact/contact.js');
const colorRouter = require('./src/routes/colors/colorRoutes.js');
const giftCardRouter = require('./src/routes/products/giftCardRoutes.js');
const sendConfirmationRoute = require('./src/routes/contact/confirmation.js');
const OpionRouter = require('./src/routes/opinion/opinionRoutes.js')
const ordersRouter = require("./src/routes/order/order.js");
const requestMethod = require('./src/middleware/requestType.js');
const requestUrl = require('./src/middleware/requestUrl.js');
var cors = require('cors')

require('dotenv').config();

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:5173',
  'https://cmadmindashboard.vercel.app',
  'https://cousu-mouche.vercel.app',
  'https://www.cousumouche.fr/'
];
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

mongoose.connect(uri,
  {})
  .then(() => {
    console.log('connected');
  })
  .catch((e) => {
    console.log("Something went wrong", e);
  })
const port = process.env.PORT || 8000;
const app = express();


app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.static('public'))
app.use(express.json());

app.use(timeLog);
app.use(requestMethod);
app.use(requestUrl);

app.use('/helloworld', HelloWRouter);
app.use('/products', productRouter);
app.use('/giftcards', giftCardRouter);
app.use('/users', userRouter);
app.use("/upload", uploadRouter);
app.use('/checkout', checkoutRoutes);
app.use('/', contactRoute);
app.use('/', sendConfirmationRoute);
app.use('/colors', colorRouter);
app.use('/opinion', OpionRouter)
app.use("/api/orders", ordersRouter);

app.listen(port, () => {
  console.log('this app listen on port ', port);
})