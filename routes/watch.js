//Require express and express router as shown in lecture code and worked in previous labs
const express = require('express');
const router = express.Router();
const axios = require('axios');
// const data = require('../data'); //the folder refers to the index.js
// const peopleData = data.people;
const path = require('path');
const data = require('../data');
const channelData = data.users
const postData = data.posts;
const commentData = data.comments;
const userData = data.users;
let {ObjectId} = require('mongodb');

router.get('/:watchVideoID', async(req, res) => {
    //s3?
    const watchVideoID = req.params.watchVideoID.trim();
    let post = await postData.getVideoByS3Name(watchVideoID);
    let username = (await userData.getChannelByS3Name(watchVideoID)).username;
    let urlMaps = (await axios.get("http://localhost:3000/api/posts")).data;


    const imageUrl = (urlMaps.find(({ s3Name }) => s3Name === post.s3Name)).imageUrl;
    let postID = post._id.toString()
    let commentArray = await commentData.getAllCommentsById(postID);
    let channel = await userData.getChannelByS3Name(watchVideoID);
    let channelId = channel._id.toString();
    res.render('./protected/watch', {
        _id: post._id.toString(),
        ...post,
        imageUrl: imageUrl,
        commentArray: commentArray,
        channelId: channelId,
        username: username
    });
})




module.exports = router;