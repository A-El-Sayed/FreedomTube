const express = require('express');
const router = express.Router();
const data = require('../data');
const helpers = require('../helper/validation');
const commentData = data.comments;
let {ObjectId} = require('mongodb');

// change render if we do AJAX?

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
.route('comment/:commentId')
// delete comment
.delete(async(req,res) => {
    const commentId = req.params.commentId.trim();
    let videoId;
    try {
        await helpers.checkIsProperString(commentId, "commentId");
        if (!ObjectId.isValid(commentId)) throw `Error: request ID invalid object ID`;
    } catch(e) {
        return res.status(400).render('error', {error: e});
    }

    // check the comment exist
    try {
        let comment = await commentData.getCommentById(commentId);
        videoId = comment.video_id;
    } catch(e) {
        return res.status(404).render('error', {error: e});
    }

    // delete the comment
    try {
        await commentData.deleteCommentById(commentId); 
        return res.redirect('videos/' + videoId.toString());
    }
    catch(e) {
        return res.status(500).render('error', {error: e})
    }
})

// add reply to the comment
.post(async(req,res) => {
    const input = req.body;  // content,like, dislike
    const content = input.content;
    const like = input.Like;
    const dislike = input.Dislike;
    const commentId = req.params.commentId.trim();

    try {
        const returnComment = await commentData.addReplyToComment(content, like, dislike, commentId);
        return res.redirect('videos/' + returnComment._id.toString());
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

router.route('comment/reply/:replyId').delete(async(req,res) => {
    const replyId = req.params.commentId.trim();
    try {
        await helpers.checkIsProperString(replyId, "replyId");
        if (!ObjectId.isValid(replyId)) throw `Error: request ID invalid object ID`;
    } catch(e) {
        return res.status(400).render('error', {error: e});
    }

    // check the reply exist
    try {
        await commentData.getReply(replyId);
    } catch(e) {
        return res.status(404).render('error', {error: e});
    }

    // delete the reply
    try {
        // delete the reply
        let commentAfterDeleteReply = await commentDate.deleteReply(replyId);
        return res.redirect('videos/' + commentAfterDeleteReply.video_id.toString());
    }
    catch(e) {
        return res.status(500).render('error', {error: e})
    }

})

module.exports = router;