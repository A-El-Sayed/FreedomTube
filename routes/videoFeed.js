//Require express and express router as shown in lecture code and worked in previous labs
const express = require('express');
const router = express.Router();
const axios = require('axios');
// const data = require('../data'); //the folder refers to the index.js
// const peopleData = data.people;
const path = require('path');
const data = require('../data');
const helpers = require('../helper/validation');
const xss = require('xss');
const channelData = data.users
const postData = data.posts;

router.route("/upload").get(async (req, res) => {
  //code here for GET
    let allPosts = await axios.get("http://localhost:3000/api/posts");
    let result = await channelData.getChannelByUsername(req.session.user.username.toLowerCase());
    let channelPosts = allPosts.data.filter(post => {return result.videosID.includes(post.s3Name)})
    res.render('./protected/upload', {
        title: "Video Uploader",
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

router.route('/popularVideos').get(async (req, res) => {

    try {
        let popularVideos = await postData.getPopularVideos()
        if (popularVideos.length == 0) {
            return res.status(404).render('error', {title: "error", error: "No popular videos now",
            title: "No Found Error",
            class: "error"})
        } else {
            res.render('./protected/popularVideos', {
                videos: popularVideos,
                title: "Popular Videos"
            })
        }
    } catch(e) {
        return res.status(500).render('error', {title: 'error', error: e})
    }  
})

router.route('/history').get(async (req, res) => {

    try {
        let user = await channelData.getChannelByUsername(req.session.user.username)
        let historyS3Array = user.history
        let history = await Promise.all(historyS3Array.map( async(s3Name) => {
            try{
                return await postData.getVideoByS3Name(s3Name)
            }catch(e){
                if(e === "No post with that s3name"){
                    return null
                }else{
                    throw e
                }
            }
        }))
        history = history.reverse()
        if (history.length == 0) {
            return res.status(404).render('error', {error: "No videos in history",
            title: "No History Error",
            class: "error"})
        } else {
            res.render('./protected/history', {
                videos: history,
                title: "History"
            })
        }
    } catch(e) {
        return res.status(500).render('error', {title: 'error', error: e})
    }  
})

router.route('/setting').get(async (req, res) => {

    res.render('./protected/setting', {title:"setting"})
})

module.exports = router;