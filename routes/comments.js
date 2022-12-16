const express = require('express');
const router = express.Router();
const data = require('../data');
const helpers = require('../helper/validation');
const commentData = data.comments;
let {ObjectId} = require('mongodb');

// get all comments
router
.route('/:videoId')
.get(async(req,res) => {
    const videoId = req.params.videoId.trim();

    try {
        await commentData.getAllCommentsById(videoId);
    } catch(e) {
        if (e === 'No comments with that channelId') {
            return res.status(404).render('protected/videoNotFound', {videoNameOrId: videoId});
        }
        res.status(400).render('error', {error: e});
    }

    try {
        const allComment = await commentData.getAllCommentsById(videoId);
        // res.render('comments',  {layout: null, ...updatedData}); // change render
    } catch(e){
        console.log(e)
    }
})
// post new comment
.post(async(req,res) => {
    const input = req.body;  // content,like, dislike
    const content = input.content;
    const like = input.like;
    const dislike = input.dislike;
    const videoId = req.params.videoId.trim();

    try {
        const newComment = await commentData.createComment(content, like, dislike, videoId, req.session.user.username);
        console.log(newComment);
        return res.render('./protected/partials/comments',  {
            AddReply: false,
            OpenReplies: false,
            layout: null, 
            ...newComment}); // change render
    } catch(e) {
        if (e === 'Could not add new comments') {
            return res.status(500).render('error', {error: e});
        }
        return res.status(400).render('error', {error: e});
    }
})


router
.route('/comments/:commentId')
// add reply to the comment
.post(async(req,res) => {
    const input = req.body;  // content,like, dislike
    const content = input.content;
    const commentId = req.params.commentId.trim();

    try {
        const returnComment = await commentData.addReplyToComment(content, commentId, req.session.user.username);
        console.log(returnComment);
        return res.render('./protected/partials/replies',  {
            layout: null, 
            Replies : returnComment.Replies  }); // change render
    } catch(e) {
        if (e === "This comment doesn't exist") {
            return res.status(404).render('error', {error: e});
        } else if (e === 'could not add comment reply successfully')
        return res.status(500).render('error', {error: e});
        else {
            return res.status(400).render('error', {error: e});
        }
    }
})
// get reply to the comment
.get(async(req,res) => {
    const commentId = req.params.commentId.trim();

    try {
        const comment = await commentData.getCommentById(commentId);
        console.log(comment);
        return res.render('./protected/partials/replies',  {
            layout: null,
            Replies : comment.Replies  
            });
    } catch(e) {
        if (e === "This comment doesn't exist") {
            return res.status(404).render('error', {error: e});
        } else if (e === 'could not add comment reply successfully')
        return res.status(500).render('error', {error: e});
        else {
            return res.status(400).render('error', {error: e});
        }
    }
})

router
//get the reply form
.route('/replyForm/:commentId')
.get(async(req,res) => {
    const commentId = req.params.commentId.trim();
    
    const comment = await commentData.getCommentById(commentId);
    
    try {
        return res.render('./protected/partials/replyForm',  {
            layout: null});
    } catch(e) {
        if (e === "This comment doesn't exist") {
            return res.status(404).render('error', {error: e});
        } else if (e === 'could not add comment reply successfully')
        return res.status(500).render('error', {error: e});
        else {
            return res.status(400).render('error', {error: e});
        }
    }
})


module.exports = router;