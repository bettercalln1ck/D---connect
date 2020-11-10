const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const { spawn } = require("child_process");

const searchRouter = express.Router()

searchRouter.use(bodyParser.json())

searchRouter.route('/user')
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
    argument=req.body.argument;
    console.log(argument);
        const python = spawn("python", ["./routes/scripts/searchUsers.py", argument]);
        python.stdout.on("data", (data) => {
        console.log("data receiving from python script");
        datatosend = data.toString();
        console.log(`${datatosend}`);
      });
      python.on("close", (code) => {
        console.log(`child process closes with code ${code}`);
  
      console.log(JSON.parse(datatosend));
        user=JSON.parse(datatosend);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,user});
      });
});
module.exports = searchRouter;

searchRouter.route('/post')
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
    argument=req.body.argument;
    console.log(argument);
        const python = spawn("python", ["./routes/scripts/searchPosts.py", argument]);
        python.stdout.on("data", (data) => {
        console.log("data receiving from python script");
        datatosend = data.toString();
        console.log(`${datatosend}`);
      });
      python.on("close", (code) => {
        console.log(`child process closes with code ${code}`);
  
      console.log(JSON.parse(datatosend));
        user=JSON.parse(datatosend);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,user});
      });
});

module.exports = searchRouter;