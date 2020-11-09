const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
var Posts=require('../models/posts');
var path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, `${req.user.username}_${Date.now()}_${file.originalname}`)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const postFileRouter = express.Router();

postFileRouter.use(bodyParser.json());

postFileRouter.route('/:postId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /posts/fileUpload/:postId');
})
.post(cors.corsWithOptions,authenticate.verifyUser,upload.single('imageFile'), (req, res) => {
    Posts.findByIdAndUpdate(req.params.postId, {       
        file: 'public/images/'+req.file.filename
    },(err,post)=>
    {
        if(err){
            console.log(err)
        }else{
            console.log(post)
          //  console.log(req.file.filename)
        }
    })
    .catch((err) => next(err));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    console.log(req.file)
    res.json(req.file);
})
.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /posts/fileUpload/:postId');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /posts/fileUpload/:postId');
});

module.exports = postFileRouter;