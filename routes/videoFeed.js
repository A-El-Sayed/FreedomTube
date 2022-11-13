//Require express and express router as shown in lecture code and worked in previous labs
const express = require('express');
const router = express.Router();
// const data = require('../data'); //the folder refers to the index.js
// const peopleData = data.people;
const path = require('path');

router.route("/").get(async (req, res) => {
  //code here for GET
  res.sendFile(path.resolve('static/homepage.html'));
});
module.exports = router;