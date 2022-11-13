const express = require( 'express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const util = require('util');
const path = require('path');
const unlinkFile = util.promisify(fs.unlink); //similar to bluebird?


const { uploadFile, deleteFile, getObjectSignedUrl } = require('../helper/s3');

//get database collections
const {posts} = require("../config/mongoCollections.js");



//middleware
const app = express()
app.use(cors());



//the middleware stores videos in "uploads/" and run filter
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb)
  }
 })

const checkFileType = (file, cb) =>{
  const filetypes = /mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname) return cb(null, true); //let file pass throw filter
  cb('filetype'); //error message
}

//Only takes file with name="video"
const uploadMiddleware = (req,res,next) => {
  const uploadFunction = upload.single('video'); 
  uploadFunction(req, res, function(err){
    if(err){ //TODO - it does res status 400- in developer console. Better display?
      if (err == 'filetype') return res.status(400).send('video files only');
      return res.sendStatus(500); //default error
    }
    next();
  })
}

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')



router
  .route('/')
  .get(async (req, res) => {
    const postCollection = await posts();
    const postsArray = await postCollection.find({}).toArray();
  
    for (let post of postsArray) {
      post.imageUrl = await getObjectSignedUrl(post.imageName)
    }
    res.send(postsArray)
  })
  .post(uploadMiddleware, async (req, res) => {
    const file = req.file
    const caption = req.body.caption
    const imageName = generateFileName()
  
    console.log(file)
    
    const fileStream = fs.createReadStream(file.path)
  
    await uploadFile(fileStream, imageName, file.mimetype)
    await unlinkFile(file.path)
    let data =  {
      imageName : imageName,
      caption : caption
    }
  
    const postCollection = await posts();
    const insertInfo = await postCollection.insertOne(data);
  
    
    res.redirect('/');
  })


router
  .route('/:id')
  .delete( async (req, res) => {
  const id = +req.params.id

  const postCollection = await posts();
  const deletionInfo = await postCollection.deleteOne({_id: ObjectId(id)});

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete movie with id of ${id}`;
  }

  res.send("deleted")
  })

module.exports = router;

// app.listen(8080, () => console.log("listening on port 8080"))