const mongoCollections = require("../config/mongoCollections");
let posts = mongoCollections.posts;
let stats = mongoCollections.videoStat;
let { ObjectId } = require("mongodb");
let helpers = require("../helper/validation");

//Axios call to get all data
const getAllPosts = async () => {
  const postCollection = await posts();
  const postsArray = await postCollection.find({}).toArray();
  return postsArray;
};

const getVideosByUser = async (username) => {
  const postCollection = await posts();
  const postsArray = await postCollection
    .find({ username: username.toLowerCase() })
    .toArray();
  return postsArray;
};

const insertPost = async (s3Name, videoTitle) => {
  let data = {
    s3Name: s3Name,
    videoTitle: videoTitle,
    Views: 0,
    Like: 0,
    Dislike: 0,
  };
  await helpers.checkIsProperString(videoTitle);

  const postCollection = await posts();
  const insertInfo = await postCollection.insertOne(data);
};

const renamePost = async (s3Name, videoTitle) => {
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
  

const searchVideobyName = async (videoTitle) => {
    let posts = await getAllPosts();

    var result = posts.filter(item => item.videoTitle.includes(videoTitle));

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
    let video = await getVideoByVideoID(videoId);
    if (!video) {
        throw `No video for this videoId`
    }

    // update the stats(change likes)
    const postCollection = await posts();
    const updatedInfo = await postCollection.updateOne(
        {_id: ObjectId(videoId)},
        {$set: 
        {
            Like: video.Like + likeChange
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw "could not update stats' like successfully"; 
    }

    return await getVideoByVideoID(videoId);   
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
    let video = await getVideoByVideoID(videoId);
    if (!video) {
        throw `No video for this videoId`
    }

    // update the stats(change likes)
    const postCollection = await posts();
    const updatedInfo = await postCollection.updateOne(
        {_id: ObjectId(videoId)},
        {$set: 
        {
            Dislike: video.Dislike + dislikeChange
        }
        }
    );

    if (updatedInfo.modifiedCount === 0) {
        throw "could not update stats' dislike successfully"; 
    }
    return await getVideoByVideoID(videoId);
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
  updateLikes,
  updateDislikes
};
