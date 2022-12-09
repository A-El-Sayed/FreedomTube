const mongoCollections = require("../config/mongoCollections");
let comments = mongoCollections.comments
let {ObjectId} = require('mongodb');
let helpers = require("../helper/validation");
const userData = require('./users')
const postData = require('./posts')


const createComment = async(content, like, dislike, videoId) => { 
    // like == 1 means like && like == 0 means no like/ dislike == 1 means dislike && dislike == 0 means no dislike
    // like and dislike can both equal to 0 but cannot both equal to 1;
    
    // check input
    await helpers.checkIsProperString(content, "content");
    await helpers.checkIsProperString(like, "like");
    await helpers.checkIsProperString(dislike, "dislike");
    await helpers.checkIsProperString(videoId, "videoId");

    if (!ObjectId.isValid(videoId)) throw "invalid object id";

    // find the user with this videoId
    const user = await userData.getChannelByVideoId(videoId);

    // create a new comment
    const commentsCollection = await comments();
    const date = new Date();
    
    let comment = {
      channel_id: user._id,
      video_id: ObjectId(videoId),
      content: content,
      Like: like,
      Dislike: dislike,
      commentDate: date,
      Replies:[]
    }
    const insertInfo = await commentsCollection.insertOne(comment);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add new comments';

    // return newComment with regular Id.
    comment._id = comment._id.toString();
    comment.channel_id =  comment.channel_id.toString();
    comment.video_id = comment.video_id.toString();
    return comment;
};

const getAllCommentsByChannelId = async(channelId) => {
  
  // check Input
  const channelId = channelId.trim();
  await helpers.checkIsProperString(channelId);
  if (!ObjectId.isValid(videoId)) throw "invalid object id";

  // find all comments
  const commentsCollection = await comments();
  const comments = await commentsCollection.find({channel_id: ObjectId(channelId)}).toArray();
  if (comments === null) throw 'No comments with that channelId';

  // return comments with regular id
  for (var i = 0; i < comments.length(); i++) {
    comments[i]._id = comments[i]._id.toString();
    comments[i].channel_id =  comments[i].channel_id.toStri0ng();
    comments[i].video_id = comments[i].video_id.toString();
  }

  return comments
}

const getCommentById = async(commentId) => {
  // check Input
  await helpers.checkIsProperString(commentId);
  if (!ObjectId.isValid(videoId)) throw "invalid object id";

  // find comment with that id
  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({_id: ObjectId(commentId)});

  if (!comment) {
    throw 'No comment with that commentId';
  }

  // return the comment
  comment._id = comment._id.toString();
  comment.channel_id =  comment.channel_id.toString();
  comment.video_id = comment.video_id.toString();

  return comment;
}

const updateCommentById = async(content, like, dislike, videoId) => {
  // input check
  await helpers.checkIsProperString(content, "content");
  await helpers.checkIsProperString(like, "like");
  await helpers.checkIsProperString(dislike, "dislike");
  await helpers.checkIsProperString(videoId, "videoId");
  if (!ObjectId.isValid(videoId)) throw "invalid object id";

  // 
}
