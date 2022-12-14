const express = require('express');
const router = express.Router();
const data = require('../data');
const helpers = require('../helper/validation');
const xss = require('xss');
const commentData = data.comments;
const userData = data.users;
let {ObjectId} = require('mongodb');

// get all comments
router
.route('/:videoId')
.get(async(req,res) => {
    let videoId = req.params.videoId;

    try {
        videoId = helpers.validateID(videoId)
    }catch(e){
        return res.status(400).render('error', {title: 'error', error: e});
    }
    try {
        let allComment = await commentData.getAllCommentsById(videoId);
    } catch(e) {
        if (e === 'No comments with that channelId') {
            return res.status(404).render('protected/videoNotFound', {videoNameOrId: videoId});
        }
        return res.status(500).render('error', {title: 'error', error: e});
    }
})
// post new comment
.post(async(req,res) => {
    let content = xss(req.body.content);
    let videoId = req.params.videoId.trim();

    try {
        await helpers.validateString(content, "content" );
        videoId = helpers.validateID(videoId)
    }catch(e) {
        return res.status(400).render('error', {error: e})
    }
    try{
        const newComment = await commentData.createComment(content, videoId, req.session.user.username);
        console.log(newComment);
        return res.render('./protected/partials/comments',  {
            AddReply: false,
            OpenReplies: false,
            layout: null, 
            ...newComment}); // change render
    } catch(e) {
        if (e === 'Could not add new comments') {
            return res.status(500).render('error', {title: 'error', error: e});
        }
        return res.status(404).render('error', {title: 'error', error: e});
    }
})


router
.route('/comments/:commentId')
// add reply to the comment
.post(async(req,res) => {
    // const input = req.body;  // content,like, dislike
    // const content = input.content;
    let content = xss(req.body.content);
    let commentId = req.params.commentId.trim();

    try{
        helpers.validateString(content, 'content')
        commentId = helpers.validateID(commentId);
    }catch(e){
        return res.status(400).render('error', {error: e})
    }
    try {
        helpers.validateString(content, 'content')
        commentId = helpers.validateID(commentId);
        const returnComment = await commentData.addReplyToComment(content, commentId, req.session.user.username);
        console.log(returnComment);
        return res.render('./protected/partials/replies',  {
            layout: null, 
            Replies : returnComment.Replies  }); // change render
    } catch(e) {
        if (e === "This comment doesn't exist") {
            return res.status(404).render('error', {title: 'error', error: e});
        } else if (e === 'could not add comment reply successfully')
        return res.status(500).render('error', {title: 'error', error: e});
        else {
            return res.status(400).render('error', {title: 'error', error: e});
        }
    }
})
// get reply to the comment
.get(async(req,res) => {
    let commentId = req.params.commentId.trim();

    try{
        commentId = helpers.validateID(commentId);
    }catch(e) {
        return res.status(400).render('error', {error: e})
    }
    try {
        const comment = await commentData.getCommentById(commentId);
        console.log(comment);
        return res.render('./protected/partials/replies',  {
            layout: null,
            Replies : comment.Replies  
            });
    } catch(e) {
        if (e === "This comment doesn't exist") {
            return res.status(404).render('error', {title: 'error', error: e});
        } else if (e === 'could not add comment reply successfully')
        return res.status(500).render('error', {title: 'error', error: e});
        else {
            return res.status(400).render('error', {title: 'error', error: e});
        }
    }
})

router
//get the reply form
.route('/replyForm/:commentId')
.get(async(req,res) => {
    let commentId = req.params.commentId.trim();
    
    try{
        commentId = helpers.validateID(commentId);
    }catch(e) {
        return res.status(400).render('error', {error: e})
    }
    try {
        const comment = await commentData.getCommentById(commentId);
    
        return res.render('./protected/partials/replyForm',  {
            layout: null});
    } catch(e) {
        if (e === 'No comment with that commentId') {
            return res.status(404).render('error', {title: 'error', error: e});
        } else if (e === 'could not add comment reply successfully')
            return res.status(500).render('error', {title: 'error', error: e});
        else {
            return res.status(400).render('error', {title: 'error', error: e});
        }
    }
})

//likeUpdate
router
.route('/likeUpdate/:commentId')
.post(async(req,res) => {
    let commentId = req.params.commentId.trim();
    const like = req.body.like;
    const dislike = req.body.dislike;
    
    try {
        if(typeof like !=='boolean') throw 'like must be a boolean'

        if(typeof dislike !== 'boolean') throw 'dislike must be a boolean'
        
        if(like && dislike) throw "both like and dislike cannot be toggled at the same time"
        
        await helpers.checkIsProperString(commentId);
        if (!ObjectId.isValid(commentId)) throw "invalid object id";
        commentId = commentId.trim();

        // get the comment
        let comment = await commentData.getCommentById(commentId);
        if (!comment) throw `No comment for this commentId`
        
        let userId = (await userData.getChannelByUsername(req.session.user.username))._id.toString()
      
        let updatedCounter = (await commentData.updateLikes(userId, commentId, like, dislike))
        return res.json(updatedCounter)    
    } catch(e) {
        if (e === "both like and dislike cannot be toggled at the same time") {
            return res.status(400).render('error', {title: 'error', error: e});
        }
    }
    
})

module.exports = router;