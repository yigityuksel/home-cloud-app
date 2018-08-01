var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
      success: true,
      message: 'Hi guys bro!! Welcome to our shiny api.'
  });
});

module.exports = router;
