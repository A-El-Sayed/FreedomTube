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
    await helpers.checkIsOnlyNum(like);
    await helpers.checkIsOnlyNum(dislike);
    like = helpers.isNumber(like);
    like = helpers.validateInt("like Num", like, 0, 1);
    dislike = helpers.isNumber(dislike);
    dislike = helpers.validateInt("dislike Num", dislike, 0, 1);

    await helpers.checkIsProperString(videoId, "videoId");

    if (!ObjectId.isValid(videoId)) throw "invalid object id";

    // find the user with this videoId
    const user = await userData.getChannelByVideoId(videoId);

    // create a new comment
    const commentsCollection = await comments();
    let nowDate = new Date();
    let formatDate = (nowDate.getMonth() + 1) + "/" + nowDate.getDate() + "/" + nowDate.getFullYear();
    
    let comment = {
      channel_id: user._id,
      video_id: ObjectId(videoId),
      content: content,
      Like: like,
      Dislike: dislike,
      commentDate: formatDate,
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

const getAllCommentsById = async(videoId) => {
  
  // check Input
  videoId = videoId.trim();
  await helpers.checkIsProperString(videoId);
  if (!ObjectId.isValid(videoId)) throw "invalid object id";

  // find all comments
  const commentsCollection = await comments();
  const comments = await commentsCollection.find({channel_id: ObjectId(videoId)}).toArray();
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

const updateCommentById = async(content, like, dislike, commentId) => {

  // input check
  await helpers.checkIsProperString(content, "content");
  await helpers.checkIsProperString(like, "like");
  await helpers.checkIsProperString(dislike, "dislike");
  await helpers.checkIsOnlyNum(like);
  await helpers.checkIsOnlyNum(dislike);
  like = helpers.isNumber(like);
  like = helpers.validateInt("like Num", like, 0, 1);
  dislike = helpers.isNumber(dislike);
  dislike = helpers.validateInt("dislike Num", dislike, 0, 1);
  await helpers.checkIsProperString(commentId, "commentId");
  if (!ObjectId.isValid(commentId)) throw "invalid object id";

  // check the comment exist
  const commentsCollection = await comments();
  const returnComment = await commentsCollection.findOne({_id: ObjectId(commentId)});
  if (!returnComment) {
    throw "This comment doesn't exist";
  }

  // update the comment
  let nowDate = new Date();
  let formatDate = (nowDate.getMonth() + 1) + "/" + nowDate.getDate() + "/" + nowDate.getFullYear();
  const updatedInfo = await commentsCollection.updateOne(
    {_id: ObjectId(commentId)},
    {$set: 
      {//content, like, dislike. Keep other fields the same
        content: content, 
        Like: like,
        Dislike: dislike,
        CommentDate: formatDate
      }
    }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update comments successfully'; 
  }

  return await getCommentById(commentId); 
}

const deleteCommentById = async(commentId) => {
  // check arg
  await helpers.checkIsProperString(commentId, "commentId");
  if (!ObjectId.isValid(commentId)) throw "invalid object id";

  // check the comment exist
  const commentsCollection = await comments();
  const returnComment = await commentsCollection.findOne({_id: ObjectId(commentId)});
  if (!returnComment) {
    throw "This comment doesn't exist";
  }

  // delete comment
  const deletionInfo = await commentsCollection.deleteOne({_id: ObjectId(commentId)});
  
  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete omment with id of ${commentId}`;
  }

  return `Comment has been successfully deleted!`;
}

const addReplyToComment = async(content, like, dislike, commentId) => {
  // check arg
  await helpers.checkIsProperString(content, "content");
  await helpers.checkIsProperString(like, "like");
  await helpers.checkIsProperString(dislike, "dislike");
  await helpers.checkIsOnlyNum(like);
  await helpers.checkIsOnlyNum(dislike);
  like = helpers.isNumber(like);
  like = helpers.validateInt("like Num", like, 0, 1);
  dislike = helpers.isNumber(dislike);
  dislike = helpers.validateInt("dislike Num", dislike, 0, 1);
  await helpers.checkIsProperString(commentId, "commentId");
  if (!ObjectId.isValid(commentId)) throw "invalid object id";

  // check the comment exist
  const commentsCollection = await comments();
  const returnComment = await commentsCollection.findOne({_id: ObjectId(commentId)});

  if (!returnComment) {
    throw "This comment doesn't exist";
  }
  
  // create the the new Reply
  let nowDate = new Date();
  let formatDate = (nowDate.getMonth() + 1) + "/" + nowDate.getDate() + "/" + nowDate.getFullYear();
  const _id  = new ObjectId();
  const reply = {
    _id: _id,
    channel_id: returnComment.channel_id,
    Content: content,
    Like: like,
    Dislike: dislike,
    CommentDate: formatDate
  }

  // insert into database
  const updatedInfo = await commentsCollection.updateOne(
    {_id: ObjectId(commentId)},
    {$push: {
      Replies:reply
      }
    }
  )

  if (updatedInfo.modifiedCount === 0) {
    throw 'could not add comment reply successfully';
  }

  // return the comment object
  return await getCommentById(_id.toString());
}

const getAllRelies = async(commentId) => {
  // check arg
  await helpers.checkIsProperString(commentId, "commentId");
  if (!ObjectId.isValid(commentId)) throw "invalid object id";

  // chech the comment exist
  const commentsCollection = await comments();
  const returnComment = await commentsCollection.findOne({_id: ObjectId(commentId)});

  // get all replies of this comment
  const comment = await getCommentById(commentId);
  let replies = comment.Replies

  // set ObjectId to string Id.
  for (var i = 0; i < replies.length; i++) {
    replies._id = replies._id.toStrng();
    replies.channel_id = replies.channel_id.toString();
  }

  // return the replies array
  return replies;
}

const getReply = async(replyId) => {
  // check arg
  replyId = replyId.trim();
  await helpers.checkIsProperString(replyId, "replyId");
  if (!ObjectId.isValid(replyId)) throw "invalid object id";

  // find the comment with this reply id
  const commentsCollection = await comments();
  const commentWithReply = await commentsCollection.findOne({'Replies._id': ObjectId(replyId)});

  if (!commentWithReply) {
    throw `No comment with that reply`
  }

  let commentId = commentWithReply._id;
  let allReplies = await getAllRelies(commentId.toString());

  for (var i = 0; i < allReplies.length; i++) {
    if (allReplies[i]._id == replyId) {
      return allReplies[i];
    }
  }
}

const deleteReply = async(replyId) => {
  
  // check arg
  replyId = replyId.trim();
  await helpers.checkIsProperString(replyId, "replyId");
  if (!ObjectId.isValid(replyId)) throw "invalid object id";

  // get original reply
  let oldReply = await getReply(replyId);
  

  // find the comment with this reply id
  const commentsCollection = await comments();
  const commentWithReply = await commentsCollection.findOne({'Replies._id': ObjectId(replyId)});
  if (!commentWithReply) {
    throw `No comment with that reply`;
  }
  let commentWithReplyObjectId = movieWithReview._id;

  // delete the reply from this comment
  const updatedInfo = await commentsCollection.updateOne(
    {_id: movieWithReviewObjectId},
    {
      $pull: {Replies:{ _id: ObjectId(replyId)}}
    }
  );

  if (updatedInfo.modifiedCount === 0) {
    throw 'could not remove reply successfully';
  }

  // return the new comment
  return await getCommentById(commentWithReplyObjectId.toString());
}

module.exports = {
  createComment,
  getAllCommentsById,
  getCommentById,
  updateCommentById,
  deleteCommentById,
  addReplyToComment,
  getAllRelies,
  getReply,
  deleteReply
}