//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const data = require('../data'); //the folder refers to the index.js
const userData = data.users;
const commentData = data.comments;
let helpers = require("../helper/validation");

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
    } catch( error){
      return res.status(400).render('./unprotected/userRegister', {error: error});

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
    } catch (error){
      //error- from bad format of login. Activate from DB's throw
      return res.status(400).render('./unprotected/userLogin', {error: error});

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
      return res.status(400).render('errors', {title: "Setting error", class: "error", errors: e} )
    }
  
  })

module.exports = router;
