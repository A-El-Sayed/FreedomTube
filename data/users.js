const mongoCollections = require("../config/mongoCollections");
let users = mongoCollections.users
let {ObjectId} = require('mongodb');
let helpers = require("../helper/validation");
const bcrypt = require('bcryptjs');
const saltRounds = 16;

const createUser = async (
  username, password
) => { 
  helpers.validateString("Username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
  username = username.toLowerCase(); //make case insensitive

  const userCollection = await users();

  const returnUser = await userCollection.findOne({username: username});
  if (returnUser){
    //duplicate exists
    throw "Username: Already a user with that username"
  }

  helpers.validateString("Password", password, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "Password: No spaces but can be any characters including special characters and should be atleast 6 characters long")
  
  if(!(new RegExp(String.raw`[A-Z]`)).test(password)){
    throw("Password: Needs to be atleast 1 uppercase letter ")
  }
  if(!(new RegExp(String.raw`[0-9]`)).test(password)){
    throw("Password: Needs to be atleast 1 digit ")
  }
  if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(password)){
    throw("Password: Needs to be atleast 1 special character ")
  }

  const hash = await bcrypt.hash(password, saltRounds);
  

  let user = {
    username: username, //channel name
    password: hash,
    subscribers: 0,
    totalViews: 0,
    videosID: [],
    subscribedChannels: [],

  }
  
  const insertInfo = await userCollection.insertOne(user);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add user';

  return {insertedUser: true}
};

const checkUser = async (username, password) => { 

  helpers.validateString("username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
  username = username.toLowerCase(); //make case insensitive
  
  helpers.validateString("password", password, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "Password: No spaces but can be any characters including special characters and should be atleast 6 characters long")
  if(!(new RegExp(String.raw`[A-Z]`)).test(password)){
    throw("Password: Needs to be atleast 1 uppercase letter ")
  }
  if(!(new RegExp(String.raw`[0-9]`)).test(password)){
    throw("Password: Needs to be atleast 1 digit ")
  }
  if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(password)){
    throw("Password: Needs to be atleast 1 special character ")
  }

  const userCollection = await users();

  const returnUser = await userCollection.findOne({username: username});
  if (!returnUser){
    //User does not exists
    throw "Either the username or password is invalid"
  }

  let correctPassword = false;

  try {
    correctPassword = await bcrypt.compare(password, returnUser.password);
  } catch (e) {
    //no op
    throw "bcrypt compare failed"
  }

  if  (correctPassword) {
    return {authenticatedUser: true}
  }else{
    throw "Either the username or password is invalid"
  }

};

const getAllChannels = async () => {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    if (!userList) throw 'Could not get all the users';
    const temp = await Promise.all(userList.map(async (element) => { return await getChannelById(element._id.toString() ) })); //the map returns an array of promises. each promise is a movie -> id -> string. promise.all waits until last promise is done
    return temp;
  };
  
/**
 * Returns the movie given movieID
 * @param {*} id 
 * @returns movie
 */
const getChannelById = async (id) => {
    id = helpers.validateID(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(id)});
    if (user === null) throw 'No user with that id';
    user._id = await user._id.toString(); //Why need await? Call method on a promise. IDK but without await it is equal to the function and not return
    return user;
};

const getChannelByUsername = async (username) => {
  helpers.validateString("username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
  username = username.toLowerCase();
  const userCollection = await users();
  const user = await userCollection.findOne({username: username});    
  if (user === null) throw 'No user with that id';
    user._id = await user._id.toString(); //Why need await? Call method on a promise. IDK but without await it is equal to the function and not return
    return user;
  };

/**
 * Given the username, removes the Channel. Returns a string - could not delete Channel with id of ${id} 
 * @param {*} username 
 * @returns string
 */
 const removeChannel = async (username) => {
  helpers.validateString("username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
  username = username.toLowerCase();
  const userCollection = await users();
  const user = await userCollection.findOne({username: username});    
  const deletionInfo = await userCollection.deleteOne({_id: user._id});
  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete Channel with id of ${id}`;
  }

  
  return `${username} has been successfully deleted!`;
  };

  const insertVideoToChannel = async(
    id,
    s3Name
) => {

    id = helpers.validateID(id);

    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(id)});
    if (user === null) throw 'No user with that id';
  
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(id)},
        {$push: {videosID : s3Name}}
      );
      if (updatedInfo.modifiedCount === 0) {
        throw 'could not update channel successfully'; 
      }
    
      return await getChannelById(id); 
}



const updateChannel = async(
    id,
    username, //channel name
    password,
    subscribers,
    totalViews,
    videosID,
    subscribedChannels
) => {

    id = helpers.validateID(id);

    helpers.validateString("Username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Username: Only alphanumeric characters and should be atleast 4 characters long")
    username = username.toLowerCase(); //make case insensitive

    const returnUser = await userCollection.findOne({username: username});
    if (returnUser){
        //duplicate exists
        throw "Username: Already a user with that username"
    }

    helpers.validateString("Password", password, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "Password: No spaces but can be any characters including special characters and should be atleast 6 characters long")
    
    if(!(new RegExp(String.raw`[A-Z]`)).test(password)){
        throw("Password: Needs to be atleast 1 uppercase letter ")
    }
    if(!(new RegExp(String.raw`[0-9]`)).test(password)){
        throw("Password: Needs to be atleast 1 digit ")
    }
    if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(password)){
        throw("Password: Needs to be atleast 1 special character ")
    }

    const hash = await bcrypt.hash(password, saltRounds);
    
    subscribers = helpers.validateInt("Subscribers", subscribers, 0, 100000000)
    totalViews = helpers.validateInt("Total Views", totalViews, 0, 100000000)
    videosID = helpers.validateIDArray(videosID);
    subscribedChannels = helpers.validateIDArray(subscribedChannels);

    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(id)});
    if (user === null) throw 'No user with that id';
  
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(id)},
        {$set: 
          {
            //The overallRating field is same. Reviews array is unchanged- do we need manual copying? The $set keeps them retained?
            username: username, //channel name
            password: hash,
            subscribers: subscribers,
            totalViews: totalViews,
            videosID: videosID,
            subscribedChannels: subscribedChannels,
          }
        }
    
      );
      if (updatedInfo.modifiedCount === 0) {
        throw 'could not update channel successfully'; 
      }
    
      return await getUserById(id); 
}

const deleteVideoByS3Name = async(
  username,
  s3Name
) => {
  const userCollection = await users();
  const user = await userCollection.findOne({username: username});
  if (user === null) throw 'No user with that id';

  const updatedInfo = await userCollection.updateOne(
      {username: username},
      {$pull: {videosID : s3Name}}
    );
    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update channel successfully'; 
    } 
}



module.exports = {
  createUser,
  checkUser,
  getAllChannels,
  getChannelById,
  removeChannel,
  updateChannel,
  getChannelByUsername,
  insertVideoToChannel,
  deleteVideoByS3Name
};
