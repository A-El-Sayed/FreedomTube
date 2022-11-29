//Require express and express router as shown in lecture code and worked in previous labs
const express = require('express');
const router = express.Router();
const axios = require('axios');
// const data = require('../data'); //the folder refers to the index.js
// const peopleData = data.people;
const path = require('path');
const data = require('../data');
const channelData = data.users

router.route("/upload").get(async (req, res) => {
  //code here for GET
    let allPosts = await axios.get("http://localhost:3000/api/posts");
    let result = await channelData.getChannelByUsername(req.session.user.username.toLowerCase());
    let channelPosts = allPosts.data.filter(post => {return result.videosID.includes(post.s3Name)})
    res.render('./protected/upload', {
        username: result.username,
        subscriber: result.subscribers.toString(),
        totalviews: result.totalViews.toString(),
        subscribedChannels: result.subscribedChannels,
        channelPosts: channelPosts,
    });
});

router.route("/").get(async (req,res) => {
    let result = await axios.get("http://localhost:3000/api/posts");
    res.render('./protected/home', {
        title: "Home",
        video: result.data
    })

})

module.exports = router;