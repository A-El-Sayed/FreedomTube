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
const helpers = require('../helper/validation');
const xss = require('xss');
const userData = data.users;
let helpers = require("../helper/validation");
let {ObjectId} = require('mongodb');

router.get('/:watchVideoID', async(req, res) => {
    //s3?
    const watchVideoID = req.params.watchVideoID.trim();
    try{
        helpers.checkIsProperString(watchVideoID, 'watchVideoID')
    }catch (e){
        return res.status(400).render('error', {title: 'error', error: e});
    }

    try{
        let post = await postData.getVideoByS3Name(watchVideoID);
        let username = (await userData.getChannelByS3Name(watchVideoID)).username;
        let urlMaps = (await axios.get("http://localhost:3000/api/posts")).data;


        const imageUrl = (urlMaps.find(({ s3Name }) => s3Name === post.s3Name)).imageUrl;
        let postID = post._id.toString()
        let commentArray = await commentData.getAllCommentsById(postID);
        let userId = (await channelData.getChannelByUsername(req.session.user.username))._id.toString()
        
        //includes inital vToggleLike, vToggleDislike, vNumLikes, and vNumDislikes for video
        if(post.Like.includes(userId)){
            post.vToggleLike = ( "toggle" )
        }
        if(post.Dislike.includes(userId)){
            post.vToggleDislike = ( "toggle" )
        }

        post.vNumLikes = post.Like.length
        post.vNumDislikes = post.Dislike.length

        //includes inital toggleLike, toggleDislike, numLikes, and numDislikes for comments
        commentArray.forEach(comment => {
            if(comment.Like.includes(userId)){
                comment.toggleLike = ( "toggle" )
            }
            if(comment.Dislike.includes(userId)){
                comment.toggleDislike = ( "toggle" )
            }

            comment.numLikes = comment.Like.length
            comment.numDislikes = comment.Dislike.length
        });
        //sort the comment by most liked top. Does not care about the dislikes
        commentArray.sort(function(a, b) {
            return b.numLikes - a.numLikes;
        });
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
    }catch(e){
        if(e=== 'No post with that s3name' || e === 'No user with that video' || e==='No comments with that videoId' || e==='No user with that id'){
            return res.status(404).render('error', {title: 'error', error: e});
        }
        return res.status(500).render('error', {title: 'error', error: e});
    }
})




module.exports = router;