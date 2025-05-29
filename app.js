
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
const sendConfirmationRoute = require('./src/routes/contact/confirmation.js');
const requestMethod = require('./src/middleware/requestType.js');
const requestUrl = require('./src/middleware/requestUrl.js');
var cors = require('cors')

require('dotenv').config();

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;

mongoose.connect(uri, 
	{})
.then(()=>{
	console.log('connected');
	})
.catch((e)=>{
	console.log("Something went wrong", e);
	})
const port = 8000;
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:5173',
  'https://cmadmindashboard.vercel.app'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));
  
app.use(express.static('public'))
app.use(express.json()); 

app.use(timeLog);
app.use(requestMethod);
app.use(requestUrl);

app.use('/helloworld', HelloWRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use("/upload", uploadRouter);
app.use('/checkout', checkoutRoutes);
app.use('/', contactRoute);
app.use('/', sendConfirmationRoute);
app.use('/colors', colorRouter);


app.listen(port, () => {
    console.log('this app listen on port ', port);
})