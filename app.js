const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const fs = require('fs')

const { oauth2_handler } = require('./google-api');
var apiRouter = require('./routes/api');

const app = express();

app.use(logger('common', {stream: fs.createWriteStream('./logs/access.log', {flags: 'a'})}))
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

oauth2_handler(app, express);

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log("Global Error : " + err);
});

module.exports = app;
