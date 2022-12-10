const mongoCollections = require("../config/mongoCollections");
let posts = mongoCollections.posts;
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
  };

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

const searchVideobyName = async (videoTitle) => {
  const postCollection = await posts();
  const videos = await postCollection
    .find({ $text: { $search: videoTitle } })
    .limit(20)
    .toArray();
  return videos;
  
};
module.exports = {
  getAllPosts,
  insertPost,
  deleteVideoByS3Name,
  getVideosByUser,
  renamePost,
  searchVideobyName,
};
