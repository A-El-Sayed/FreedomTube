//Require express and express router as shown in lecture code and worked in previous labs
const express = require('express');
const router = express.Router();
const axios = require('axios');
// const data = require('../data'); //the folder refers to the index.js
// const peopleData = data.people;
const path = require('path');

router.route("/upload").get(async (req, res) => {
  //code here for GET
    //res.sendFile(path.resolve('static/homepage.html'));
    res.render('./protected/upload',{
    })
});

router.route("/").get(async (req,res) => {
    let result = await axios.get("http://localhost:3000/api/posts");
    res.render('./protected/home', {
        title: "Home",
        video: result.data
    })

})

module.exports = router;