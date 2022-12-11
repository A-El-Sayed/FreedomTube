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
let s3 = require("../helper/s3");

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
      if (err == "filetype") return res.status(400).send("video files only");
      return res.sendStatus(500); //default error
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
    const videoTitle = req.body.videoTitle;
    const s3Name = generateFileName();

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

    res.redirect("/videoFeedRoutes/upload");
  });

router.route("/changeName").post(async (req, res) => {
  const s3Name = req.body.s3Name;
  const videoTitle = req.body.videoTitle;
  // s3Name = "acd5b0265ee7331f6466771ef2fedfd0599fc0b50cbbb626bd6311324945e5ec"
  postData.renamePost(s3Name, videoTitle);
  res.redirect("/videoFeedRoutes/upload");
});

router.route("/delete").delete(async (req, res) => {
  const s3Name = req.body.s3Name;
  // s3Name = "acd5b0265ee7331f6466771ef2fedfd0599fc0b50cbbb626bd6311324945e5ec"
  userData.deleteVideoByS3Name(req.session.user.username, s3Name);
  postData.deleteVideoByS3Name(s3Name);
  await s3.deleteFile(s3Name);
  res.redirect("/videoFeedRoutes/upload");
});

router.route("/searchvideo").post(async (req, res) => {
  let errors = [];
  let videos = req.body;
  console.log(videos.searchVideoName)
  if (!videos.searchVideoName || videos.searchVideoName.length === 0) {
    errors.push("Please enter a name to search for.");
  }
  if (errors.length > 0) {
    res.render("./error", {
      class: "error",
      errors: errors,
      title: "Empty Input Error",
    });
  } else {
    try {
      let vids = await postData.searchVideobyName(videos.searchVideoName);
      vids.forEach(video => {
        video._id = video._id.toString();
      });
      // // let userObj = await userData.getChannelByS3Name("0e45d170b6b5c14f7acaf7fe57ae6d2d7b9a448c81ecefa97390292a7a7f7dea");
      // vids = await Promise.all(vids.map(async (element) => {
      //   let returnObj = element;
      //   let userObj = await userData.getChannelByS3Name(returnObj.s3Name)
      //   returnObj.username = userObj.username
      //   return returnObj
      // }));
      console.log(vids);
      res.render("./protected/videosFoundbyName", {
        title: "Videos found",
        videos: vids,
        searchVideoName: videos.searchVideoName,
      });
    } catch (e) {
      res.render("./protected/videosNotFound", {
        title: "Videos not Found",
        searchVideoName: videos.searchVideoName,
      });
    }
  }
});

module.exports = router;

// app.listen(8080, () => console.log("listening on port 8080"))
