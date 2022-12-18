const mongoCollections = require("../config/mongoCollections");
let posts = mongoCollections.posts;
const userData = require('./users')
let { ObjectId } = require("mongodb");
let helpers = require("../helper/validation");

//Axios call to get all data
const getAllPosts = async () => {
  const postCollection = await posts();
  const postsArray = await postCollection.find({}).toArray();
  return postsArray;
};

const getVideosByUser = async (username) => {
  helpers.validateString("Username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
  const postCollection = await posts();
  const postsArray = await postCollection
    .find({ username: username.toLowerCase() })
    .toArray();
  return postsArray;
};

const insertPost = async (s3Name, videoTitle) => {
  await helpers.validateString("s3Name", s3Name, String.raw`^[a-z0-9]*$`, "Must be lowercase and numbers");
  await helpers.checkIsProperString(s3Name, "s3Name");
  await helpers.checkIsProperString(videoTitle, "videoTitle");
  let data = {
    s3Name: s3Name,
    videoTitle: videoTitle,
    Views: 0,
    Like: [],
    Dislike: [],
  };
  await helpers.checkIsProperString(videoTitle);

  const postCollection = await posts();
  const insertInfo = await postCollection.insertOne(data);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  throw 'Could not add post';
};

const renamePost = async (s3Name, videoTitle) => {
  await helpers.validateString("s3Name", s3Name, String.raw`^[a-z0-9]*$`, "Must be lowercase and numbers");
  await helpers.checkIsProperString(s3Name, "s3Name");
  await helpers.checkIsProperString(videoTitle, "videoTitle");
  const postCollection = await posts();
  const user = await postCollection.findOne({ s3Name: s3Name });
  if (user === null) throw "No user with that id";

  const updatedInfo = await postCollection.updateOne(
    { s3Name: s3Name },
    {
      $set: {
        //The overallRating field is same. Reviews array is unchanged- do we need manual copying? The $set keeps them retained?
        videoTitle: videoTitle, //channel name
      },
    }
  );

  if (updatedInfo.modifiedCount === 0) {
    throw "could not update channel successfully";
  }
};

//Function to list person matching the id
const deleteVideoByS3Name = async (s3Name) => {
  await helpers.validateString("s3Name", s3Name, String.raw`^[a-z0-9]*$`, "Must be lowercase and numbers");
  await helpers.checkIsProperString(s3Name, "s3Name");
  const postCollection = await posts();
  const deletionInfo = await postCollection.deleteOne({ s3Name: s3Name });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete movie with id of ${s3Name}`;
  }
};

const getVideoByS3Name = async (s3Name) => {
    // check arg
    await helpers.checkIsProperString(s3Name, "s3Name");
    
    const postCollection = await posts();
    const post = await postCollection.findOne({ s3Name: s3Name })
    if (post === null) throw 'No post with that s3name';
    return post;

  };

const getVideoByVideoID = async (videoId) => {
    // check arg
    await helpers.checkIsProperString(videoId, "videoId");
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: ObjectId(videoId) })
    if (post === null) throw 'No post with that videoID';
    return post;

  };
  

const searchVideobyName = async (vidTitle) => {
    let posts = await getAllPosts();
    // posts.forEach(item => {
    //   item.videoTitle = item.videoTitle.toLowerCase();
    // });
    var result = posts.filter(item => item.videoTitle.toLowerCase().includes(vidTitle.toLowerCase()));

    return result;
  
};

const getPopularVideos = async () => {
  const postsCollection = await posts();
  let popularVideossArr = await postsCollection.find().sort({Views:-1}).limit(10).toArray();
  return popularVideossArr;
}


// set middleware when get watch handlebar. Add a view each time. Views only increase?
const addViews = async(videoId) => { 
    // check Input
    await helpers.checkIsProperString(videoId);
    if (!ObjectId.isValid(videoId)) throw "invalid object id";
    videoId = videoId.trim();

    // get the video
    let video = await getVideoByVideoID(videoId);
    if (!video) {
        throw `No this video with this videoId`
    }

    // update the stats(add one view)
    const postCollection = await posts();
    const updatedInfo = await postCollection.updateOne(
        {_id: ObjectId(videoId)},
        {$set: 
        {
            Views: video.Views + 1
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'could not update stats successfully'; 
    }

    return await getVideoByVideoID(videoId);   
}

// like = true or false
const updateLikes = async(userId, videoId, like, dislike) => {
  // check Input
  if(typeof like !=='boolean') throw 'like must be a boolean'

  if(typeof dislike !== 'boolean') throw 'dislike must be a boolean'
  
  if(like && dislike) throw "both like and dislike cannot be toggled at the same time"
  
  await helpers.checkIsProperString(videoId);
  if (!ObjectId.isValid(videoId)) throw "invalid object id";
  videoId = videoId.trim();

  // get the video
  let video = await getVideoByVideoID(videoId);
  if (!video) throw `No video for this videoId`
  

  await helpers.checkIsProperString(userId);
  if (!ObjectId.isValid(userId)) throw "invalid object id";
  userId = userId.trim();

  // get the channel
  let channel = await userData.getChannelById(userId);
  if (!channel) throw `No channel for this userId`
  
      
  // update the stats(change likes)
  const postCollection = await posts();
  if(like && !dislike){
    const updatedInfo = await postCollection.updateOne(
      {_id: ObjectId(videoId)},
      {$push: {
        Like:userId
        },
      $pull: {
        Dislike:userId
        }
      }
    );

    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update post successfully'; 
    }
  }
  if(!like&&!dislike){
    const updatedInfo = await postCollection.updateOne(
      {_id: ObjectId(videoId)},
      {$pull: {
        Like:userId,
        Dislike:userId
        }
      }
    );

    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update post successfully'; 
    }
  }
  if(dislike && !like){
    const updatedInfo = await postCollection.updateOne(
      {_id: ObjectId(videoId)},
      {$push: {
         Dislike:userId
        },
        $pull: {
         Like:userId
        }
      }
    );

    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update post successfully';  
    }
  }
  let updatedVideo = await getVideoByVideoID(videoId)
  return { numLikes: updatedVideo.Like.length, numDislikes: updatedVideo.Dislike.length}
}


module.exports = {
  getAllPosts,
  insertPost,
  deleteVideoByS3Name,
  getVideosByUser,
  renamePost,
  searchVideobyName,
  getVideoByS3Name,
  getVideoByVideoID,
  getPopularVideos,
  addViews,
  updateLikes
};
