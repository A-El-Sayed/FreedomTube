const express = require('express');
const router = express.Router();
const data = require('../data');
const helpers = require('../helper/validation');
const commentData = data.comments;
const statsData = data.stats;
let {ObjectId} = require('mongodb')


// get stats for a video
router.route('/:videoId')
.get(async(req,res) => {
    const videoId = req.params.videoId.trim();

    try {
        await statsData.getStatByVideoId(videoId);
    } catch(e) {
        if (e === 'No stats with that videoId') {
            return res.status(404).render('protected/statsNotFound');
        }
        res.status(400).render('error', {title: 'error', error: e});
    }

    try {
        const stats = await statsData.getStatByVideoId(videoId);
        res.render('protected/statsPage',  {videoTitle: stats.Title,
                                            videoId: stats.video_id,
                                            views: stats.Views,
                                            likes: stats.Like,
                                            dislikes: stats.Dislike,
                                            commentsid: stats.Comment});
    } catch(e){
        console.log(e)
    }
}) 


module.exports = router;