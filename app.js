//Here is where you'll set up your server as shown in lecture code
const express = require('express');
const app = express();

const configRoutes = require('./routes');

const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const static = express.static(__dirname + '/public');
app.use('/public', static);


const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
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
    let updatedData = req.body;
    if (req.method == 'POST' && updatedData._method){
      req.method = updatedData._method
    }
    next();
  });

  app.use('/api/posts/delete', (req, res, next) => {
    let updatedData = req.body;
    if (req.method == 'POST' && updatedData._method){
      req.method = updatedData._method
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





  configRoutes(app);

  app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });
  