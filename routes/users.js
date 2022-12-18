//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const data = require('../data'); //the folder refers to the index.js
const userData = data.users;
const commentData = data.comments;
const postData = data.posts;
let helpers = require("../helper/validation");
let {ObjectId} = require('mongodb');

router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    if(req.session.user){
      //user is authenticated
      return res.redirect('/protected');
    }else{
      return res.render('./unprotected/userLogin');
    }
  })

router
  .route('/register')
  .get(async (req, res) => {
    //code here for GET
    if(req.session.user){
      //user is authenticated
      return res.redirect('/protected');
    }else{
        return res.render('./unprotected/userRegister')
    }
  })
  .post(async (req, res) => {
    //code here for POST
    let { usernameInput, passwordInput} = req.body;
    try {
      helpers.validateString("username", usernameInput, String.raw`^[A-Za-z0-9]{4,}$`, "Only alphanumeric characters and should be atleast 4 characters long")
      helpers.validateString("password", passwordInput, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "No spaces but can be any characters including special characters and should be atleast 6 characters long")
      if(!(new RegExp(String.raw`[A-Z]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 uppercase letter ")
      }
      if(!(new RegExp(String.raw`[0-9]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 digit ")
      }
      if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 special character ")
      }
      let result = await userData.createUser(usernameInput, passwordInput);
      
      if (helpers.shallowCompare(result, {insertedUser: true})){
        return res.redirect('/');
      }  else {

        return res.status(500).json({error: "Internal Server Error"});
      }
    } catch( e){
      return res.status(400).render('./unprotected/userRegister', {error: e});

    }


  })
 
router
  .route('/login')
  .post(async (req, res) => {
    //code here for POST
    let { usernameInput, passwordInput} = req.body;
    try {
      helpers.validateString("username", usernameInput, String.raw`^[A-Za-z0-9]{4,}$`, "Only alphanumeric characters and should be atleast 4 characters long")
      helpers.validateString("password", passwordInput, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "No spaces but can be any characters including special characters and should be atleast 6 characters long")
      if(!(new RegExp(String.raw`[A-Z]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 uppercase letter ")
      }
      if(!(new RegExp(String.raw`[0-9]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 digit ")
      }
      if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(passwordInput)){
        throw("Password: Needs to be atleast 1 special character ")
      }
      let result = await userData.checkUser(usernameInput, passwordInput);
      if (helpers.shallowCompare(result, {authenticatedUser: true}) ){
        req.session.user = {username: usernameInput};
        return res.redirect('/protected');
      }  else {
        //correct format for login but username and password not correct. 
        return res.status(400).render('./unprotected/userLogin', {error: "invalid username and/or password"});
      }    
    } catch (e){
      //error- from bad format of login. Activate from DB's throw
      return res.status(400).render('./unprotected/userLogin', {error: e});

    }
  
  })

router
  .route('/protected')
  .get(async (req, res) => {
    //code here for GET

    const now = new Date().toUTCString();

    //express-session then gets/sets the data associated with that session ID through middleware and in routes so it must be passed
    res.redirect('/videoFeedRoutes/')
  })

router
  .route('/logout')
  .get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    res.render('./protected/logout');
  
  })

router
  .route('/setting')
  .post(async (req, res) => {
    //code here for POST
    let { username } = req.body;
    try {
      helpers.validateString("username", username, String.raw`^[A-Za-z0-9]{4,}$`, "Only alphanumeric characters and should be atleast 4 characters long")
      username = username.toLowerCase();
      userId = (await userData.getChannelByUsername(req.session.user.username))._id.toString()
      await userData.updateUsername(userId, username)
      await commentData.updateUsername(userId, username)
      req.session.user = {username: username};
      return res.redirect('/');
    }catch(e){
      return res.status(400).render('error', {title: "Setting error", class: "error", error: e} )
    }
  
  })

router.route('/subscribedChannel').get(async (req, res) => {
  try {
    let user = await userData.getChannelByUsername(req.session.user.username)
    let subscribedChannels = user.subscribedChannels

    if (subscribedChannels.length == 0) {
      return res.render('error', {title: "No subsribed channel", class: "error", error: "You don't have any subscribed channel!"})
    }

    for (var i = 0; i < subscribedChannels.length; i++) {
      let oneChannel = subscribedChannels[i];
      oneChannel['videoInfo'] = [];
      // create a property to hold detailed video info
     
      for (var j = 0; j < (oneChannel.videosID).length; j++) {
        oneChannel.videoInfo.push(await postData.getVideoByS3Name(oneChannel.videosID[j])); 
      }
      subscribedChannels[i] = oneChannel;
    }

    return res.render('protected/subscribedChannels', {title:"Subscribed Channel", channels: subscribedChannels});
  }catch(e){
    return res.status(500).render('error', {title: "sever error", class: "error", error: e} )
  }
})

// add new subscribedChannel
router.route('/subscribedChannel/:channelId').get(async (req, res) => {
  let channelId = req.params.channelId;
  try {
    await helpers.checkIsProperString(channelId)
    if (!ObjectId.isValid(channelId)) throw "invalid object id";
  } catch(e) {
    return res.status(400).renderrender('protected/SubscribeInfo', {title: "Subscribe Error", Info: "Error", error: e})
  }

  try {
    let userId = (await userData.getChannelByUsername(req.session.user.username))._id.toString()
    if (userId == channelId) {
      throw `Can't subscribe to your own channel`
    }
    await userData.addSubscribedChannel(userId, channelId);
    return res.render('protected/SubscribeInfo', {title: "Subscribe Successfully", Info: "Successfully!"});
  } catch(e) {
    if (e == `Can't subscribe to your own channel`) {
      return res.status(400).render('protected/SubscribeInfo', {title: "Subscribe Error", Info: "Error", error: e})
    }
    if (e == `You have already subscribed this channel!`) {
      return res.status(400).render('protected/SubscribeInfo',{title: "Subscribe Error", Info: "Error", error: e})
    }
    if (e == 'No subscribedChannel with that id') {
      return res.status(404).render('protected/SubscribeInfo', {title: "Not Found Error", Info: "Error", error: e} )
    } else {
      return res.status(500).render('error', {title: "sever error", class: "error", error: e} )
    }
  }
})

module.exports = router;
