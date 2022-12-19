//Here is where you'll set up your server as shown in lecture code
const express = require('express');
const app = express();
const stats = require('./data/videoStat');
const userData = require('./data/users');
const postData = require('./data/posts');
const helpers = require('./helper/validation');
const xss = require('xss');
const configRoutes = require('./routes');

const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const static = express.static(__dirname + '/public');
app.use('/public', static);


const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const { getChannelByUsername } = require('./data/users');

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    }
  },
  partialsDir: ['views/protected/partials/']
});


app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}))

  //Logging middlewae
  app.use(async (req, res, next) => {
    currentTimeStamp = new Date().toUTCString()
    reqMethod = req.method;
    reqRoute = req.originalUrl;
    // console.log(req.session.id);
    if(req.session.user){
        console.log(`[${currentTimeStamp}]: ${reqMethod} ${reqRoute} (Authenticated User)`);
    }else{
        console.log(`[${currentTimeStamp}]: ${reqMethod} ${reqRoute} (Non-Authenticated User)`);

    }
    next();
  });

  // Convert post to delete method
  app.use('/channel/delete', (req, res, next) => {
    let method = req.body._method;

    if (req.method == 'POST' && method){
      req.method = method
    }
    next();
  });

  app.use('/api/posts/delete', (req, res, next) => {
    let method = req.body._method;
    if (req.method == 'POST' && method){
      req.method = method
    }
    next();
  });


//Authentication Middleware - one more safeguard for protected
app.use('/protected', (req, res, next) => {
    if (!req.session.user) {
        //not login
        return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  });

  app.use('/subscribedChannel', (req, res, next) => {
    if (!req.session.user) {
      //not login
      return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  })
  
  app.use('/subscribedChannel/:channelId', (req, res, next) => {
    if (!req.session.user) {
      //not login
      return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  })

  app.use('/videoFeedRoutes', (req, res, next) => {
    if (!req.session.user) {
        //not login
        return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  });

  app.use('/videoFeedRoutes/upload', (req, res, next) => {
    if (!req.session.user) {
        //not login
        return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  });

  app.use('/channel/delete', (req, res, next) => {
    if (!req.session.user) {
        //not login
        return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      next();
    }
  });

  app.use('/watch/:s3Name', async (req, res, next) => {
    if (!req.session.user) {
        //not login
        return res.status(403).render('./unprotected/forbiddenAccess');
    } else {
      const watchS3Name = req.params.s3Name.trim();
      let s3;
      let videoId;
      let userId;

      // input check
      try {
        await helpers.checkIsProperString(watchS3Name);
        s3 = watchS3Name
      } catch(e) {
        return res.status(400).render('error', {title: "Input Error", class: "error", error: e} )
      }
    
      // check the video exist
      try {
        let video = await postData.getVideoByS3Name(s3);
        videoId = video._id;
        videoId = videoId.toString();
      } catch(e) {
        if (e == 'No post with that s3name') {
          return res.status(404).render('./protected/videosNotFound',{searchVideoName: "videoS3Name: " + s3})
        } else {
          return res.status(500).render('error', {title: "Sever Error", class: "sever-error", error: e});
        }
      }
      // check the user
      try{
        userId = (await getChannelByUsername(req.session.user.username))._id.toString()
      } catch(e){
        return res.status(400).render('error', {title: "Cookie username Error", class: "error", error: e} )
      }

      // add view to this video
      await postData.addViews(videoId);
      //add to user history that he watched this video
      await userData.insertVideoToHistory(userId, s3);

      next();
    }
  });





  configRoutes(app);

  app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });
  