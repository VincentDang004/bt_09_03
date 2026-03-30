var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://127.0.0.1:27017/NNPTUD-C2')
.then(() => {
  console.log(" Connected MongoDB");
})
.catch(err => {
  console.log(" MongoDB error:", err);
});


var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/products', productsRouter);

app.get('/', (req, res) => {
  res.send("Server đang chạy OK ");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server Error");
});

module.exports = app;