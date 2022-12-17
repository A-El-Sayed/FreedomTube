const mongoCollections = require("../config/mongoCollections");
let statDb = mongoCollections.videoStat
let {ObjectId} = require('mongodb');
let helpers = require("../helper/validation");
const userData = require('./users')
const postData = require('./posts')
const commentData = require('./comments')

const createStat = async(videoId) => {
    // check Input
    await helpers.checkIsProperString(videoId);
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // get the video object
    let video = await postData.getVideoByVideoID(videoId);
    if (!video) {
        throw `The video doesn't exist`;
    }

    // get the videos's user
    // let user = await userData.getChannelByVideoId(videoId);
    // if (!user) {
    //     throw `The user doesn't exist`;
    // }

    // create a new comment
    const statCollection = await statDb();

    let newStat = {
        video_id: ObjectId(videoId),
        Title : video.videoTitle,
        Views: 0,
        Like: 0,
        Dislike: 0,
        Comment: []
      }

    const insertInfo = await statCollection.insertOne(newStat);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw 'Could not add new videoStat';

    // return newStat with regular Id.
    return {insertedStat: true};
}

const getStatByVideoId = async(videoId) => {
    // check Input
    await helpers.checkIsProperString(videoId);
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // find the stat
    // find stats with that id
    const statCollection = await statDb();
    const stats = await statCollection.findOne({video_id : ObjectId(videoId)});

    if (!stats) {
        throw 'No stats with that videoId';
    }

    // return the stats with regular id
    stats._id = stats._id.toString();
    stats.video_id = stats.video_id.toString();
    let comments = stats.Comment
    for (var i = 0; i < comments.length; i++) {
        stats.Comment[i] = comments[i].toString();
    }

    return stats;
}

const getStatById = async(statId) => {
    // check Input
    await helpers.checkIsProperString(statId);
    if (!ObjectId.isValid(statId)) throw "invalid object id";
    statId = statId.trim();

    // find the stat
    // find stats with that id
    const statCollection = await statDb();
    const stats = await statCollection.findOne({_id : ObjectId(statId)});

    if (!stats) {
        throw 'No comment with that Id';
    }

    // return the stats with regular id
    stats._id = stats._id.toString();
    stats.video_id = stats.video_id.toString();
    let comments = stats.Comment;
    for (var i = 0; i < comments.length; i++) {
        stats.Comment[i] = comments[i].toString();
    }

    return stats;
}


// set middleware when get watch handlebar. Add a view each time. Views only increase?
const addViews = async(videoId) => { 
    // check Input
    await helpers.checkIsProperString(videoId);
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // get the video
    let video = await postData.getVideoByVideoID(videoId);
    if (!video) {
        throw `No this video with this videoId`
    }

    // get the stats of the video
    let stats = await getStatByVideoId(videoId);
    if (!stats) {
        throw `No stats for this videoId`
    }

    // get the StatId
    let statId = stats._id.trim();

    // update the stats(add one view)
    const statCollection = await statDb();
    const updatedInfo = await statCollection.updateOne(
        {_id: ObjectId(statId)},
        {$set: 
        {
            Views: stats.Views + 1
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'could not update stats successfully'; 
    }

    return await getStatByVideoId(videoId);   
}

// likeChange = 1 || -1
const updateLikes = async(videoId, likeChange) => {
    // check Input
    await helpers.checkIsProperString(videoId);
    await helpers.checkIsProperString(likeChange);
    likeChange = helpers.isNumber(likeChange);
    if (likeChange !== 1 && likeChange !== -1) {
        throw `LikeChange should be 1 or -1`
    }
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // get the stats of the video
    let stats = await getStatByVideoId(videoId);
    if (!stats) {
        throw `No stats for this videoId`
    }

    // get the Id of stat
    let statsId = stats._id.trim()

    // update the stats(change likes)
    const statCollection = await statDb();
    const updatedInfo = await statCollection.updateOne(
        {_id: ObjectId(statsId)},
        {$set: 
        {
            Like: stats.Like + likeChange
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw "could not update stats' like successfully"; 
    }

    return await getStatByVideoId(videoId);   
}


// dislikeChange = 1 || -1
const updateDislikes = async(videoId, dislikeChange) => {
    // check Input
    await helpers.checkIsProperString(videoId);
    await helpers.checkIsProperString(dislikeChange);
    dislikeChange = helpers.isNumber(dislikeChange);
    if (dislikeChange !== 1 && dislikeChange !== -1) {
        throw `dislikeChange should be 1 or -1`
    }
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // get the stats of the video
    let stats = await getStatByVideoId(videoId);
    if (!stats) {
        throw `No stats for this videoId`
    }

    // get the Id of stat
    let statsId = stats._id.trim()

    // update the stats(change likes)
    const statCollection = await statDb();
    const updatedInfo = await statCollection.updateOne(
        {_id: ObjectId(statsId)},
        {$set: 
        {//content, like, dislike. Keep other fields the same
            Dislike: stats.Dislike + dislikeChange
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw "could not update stats' dislike successfully"; 
    }
    return await getStatByVideoId(videoId);
}

// get all comments of this video so we can update
const updateComment = async(videoId) => {
    // check Input
    await helpers.checkIsProperString(videoId);
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // check the stat exist
    let stats = await getStatByVideoId(videoId);
    if (!stats) {
        throw `No stats for this videoId`
    }
    let statsId = stats._id.trim();
    // get all comments of this video right now
    let allComments = await commentData.getAllCommentsById(videoId);
    if (!allComments) {
        throw `The comment part doesn't exist`;
    }
    

    // get all comment Object Id (not Object Id, the getAllCommentsById return regular Id)
    let allCommentObjectIds = [];
    for (var i = 0; i < allComments.length; i++) {
        allCommentObjectIds[i] = ObjectId(allComments[i]._id.trim())
    }

    // update comment in the stat
    const statCollection = await statDb();
    const updatedInfo = await statCollection.updateOne(
        {_id: ObjectId(statsId)},
        {$set: 
        {//content, like, dislike. Keep other fields the same
            Comment: allCommentObjectIds
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw "could not update stats' comment successfully"; 
    }
    return await getStatByVideoId(videoId);
}

module.exports = {
    createStat,
    getStatByVideoId,
    getStatById,
    addViews,
    updateLikes,
    updateDislikes,
    updateComment
  }