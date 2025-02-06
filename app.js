
const express = require('express');
const mongoose = require('mongoose');
const timeLog = require('./src/middleware/timelog.js')
const HelloWRouter = require('./src/routes/helloworld/helloworld.js')
const productRouter = require('./src/routes/products/productRoutes.js');
const userRouter = require('./src/routes/user/userRoutes.js');
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
const allowedOrigins = ['https://cmadmindashboard.vercel.app'];

app.use(cors({
	origin: allowedOrigins
  }));
app.use(express.static('public'))
app.use(express.json()); 

app.use(timeLog);
app.use(requestMethod);
app.use(requestUrl);

app.use('/helloworld', HelloWRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);

app.listen(port, () => {
    console.log('this app listen on port ', port);
})