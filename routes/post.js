const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const crypto = require("crypto");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const path = require("path");
const unlinkFile = util.promisify(fs.unlink); //similar to bluebird?
const data = require("../data");
const postData = data.posts;
const userData = data.users;
const statsData = data.stats;
const helpers = require('../helper/validation');
const xss = require('xss');
let s3 = require("../helper/s3");
let {ObjectId} = require('mongodb');

const { uploadFile, deleteFile, getObjectSignedUrl } = require("../helper/s3");

//middleware
const app = express();
app.use(cors());

//the middleware stores videos in "uploads/" and run filter
const upload = multer({
  dest: "uploads/",
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const checkFileType = (file, cb) => {
  const filetypes = /mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true); //let file pass throw filter
  cb("filetype"); //error message
};

//Only takes file with name="video"
const uploadMiddleware = (req, res, next) => {
  const uploadFunction = upload.single("video");
  uploadFunction(req, res, function (err) {
    if (err) {
      //TODO - it does res status 400- in developer console. Better display?
      if (err == "filetype") return res.status(400).render('error', {title: 'error', error: "Must be a mp4, mov, or avi"});;
      return res.status(500).render('error', {title: 'error', error: err}); //default error
    }
    next();
  });
};

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

router
  .route("/")
  .get(async (req, res) => {
    let postsArray = await postData.getAllPosts();

    for (let post of postsArray) {
      post.imageUrl = await getObjectSignedUrl(post.s3Name);
    }
    res.send(postsArray);
  })
  .post(uploadMiddleware, async (req, res) => {
    const file = req.file;
    try{
      if(!file) throw "No file uploaded"
    }catch(e){
      return res.status(400).render('error', {title: 'error', error: e});;
    }
    const videoTitle = xss(req.body.videoTitle);
    const s3Name = generateFileName();
    try{
      await helpers.checkIsProperString(videoTitle, "videoTitle");
    }catch(e){
      return res.status(400).render('error', {error: e});
    }



    console.log(file);

    const fileStream = fs.createReadStream(file.path);

    await uploadFile(fileStream, s3Name, file.mimetype);
    await unlinkFile(file.path);

    await postData.insertPost(s3Name, videoTitle);

    
    
    // userData.insert videoId to videoIds array of user_collection
    let user = await userData.getChannelByUsername(
      req.session.user.username.toLowerCase()
    );
    let update = await userData.insertVideoToChannel(user._id, s3Name);

    // add stats
    let video = await postData.getVideoByS3Name(s3Name);
    let videoId = video._id;
    videoId = videoId.toString();
    await statsData.createStat(videoId);


    res.redirect("/videoFeedRoutes/upload");
  });

router.route("/changeName").post(async (req, res) => {
  const s3Name = xss(req.body.s3Name);
  const videoTitle = xss(req.body.renamedTitle);
  try{
    await helpers.validateString("s3Name", s3Name, String.raw`^[a-z0-9]*$`, "Must be lowercase and numbers");
    await helpers.checkIsProperString(s3Name, "s3Name");
    await helpers.checkIsProperString(videoTitle, "videoTitle");
  }catch(e) {
    return res.status(400).render('error', {error: e});
  }
  // s3Name = "acd5b0265ee7331f6466771ef2fedfd0599fc0b50cbbb626bd6311324945e5ec"
  postData.renamePost(s3Name, videoTitle);
  res.redirect("/videoFeedRoutes/upload");
});

router.route("/delete").delete(async (req, res) => {
  s3Name = xss(req.body.s3Name);
  // s3Name = "acd5b0265ee7331f6466771ef2fedfd0599fc0b50cbbb626bd6311324945e5ec"
  try{
    await helpers.validateString("s3Name", s3Name, String.raw`^[a-z0-9]*$`, "Must be lowercase and numbers");
  }catch (e) {
    return res.status(400).render('error', {error: e});
  }
  userData.deleteVideoByS3Name(req.session.user.username, s3Name);
  postData.deleteVideoByS3Name(s3Name);
  // await s3.deleteFile(s3Name);
  res.redirect("/videoFeedRoutes/upload");
});

router.route("/searchvideo").post(async (req, res) => {
  let errors = [];
  let searchVideoName = xss(req.body.searchVideoName);
  // console.log(videos.searchVideoName)
  if  (!searchVideoName || searchVideoName.length === 0){
    errors.push("Please enter a name to search for.");
  }
  if (errors.length > 0) {
    res.status(400).render("./error", {
      class: "error",
      error: errors,
      title: "Empty Input Error",
    });
  } else {
    try {
      let vids = await postData.searchVideobyName(searchVideoName);
      vids.forEach(video => {
        video._id = video._id.toString();
      });
      console.log(vids);
      if(vids.length === 0){
        return res.status(404).render('./protected/videosNotFound', {searchVideoName: "videoTitle: " + videos.searchVideoName})
      
      };
      res.render("./protected/videosFoundbyName", {
        title: "Videos found",
        videos: vids,
        searchVideoName: searchVideoName,
      });
      
    } catch (e) {
      res.status(404).render("./protected/videosNotFound", {
        title: "Videos not Found",
        searchVideoName: searchVideoName,
      });
    }
  }
});


//likeUpdate
router
.route('/likeUpdate/:videoId')
.post(async(req,res) => {
    let videoId = req.params.videoId.trim();
    const like =  req.body.like
    const dislike = req.body.dislike
    
    try {
        if(typeof like !=='boolean') throw 'like must be a boolean'

        if(typeof dislike !== 'boolean') throw 'dislike must be a boolean'
        
        if(like && dislike) throw "both like and dislike cannot be toggled at the same time"
        
        await helpers.checkIsProperString(videoId, "videoId");
        if (!ObjectId.isValid(videoId)) throw "invalid object id";
        videoId = videoId.trim();
    } catch(e) {
      return res.status(400).render('error', {error: e});
    }
    try{
        // get the video
        let video = await postData.getVideoByVideoID(videoId);
        if (!video) throw `No video for this videoId`
        
        let userId = (await userData.getChannelByUsername(req.session.user.username))._id.toString()
      
        let updatedCounter = (await postData.updateLikes(userId, videoId, like, dislike))
        return res.json(updatedCounter)    
    } catch(e) {
        if (e === "both like and dislike cannot be toggled at the same time") {
            return res.status(400).render('error', {title: 'error', error: e});
        }
    }
    
})


module.exports = router;

// app.listen(8080, () => console.log("listening on port 8080"))
