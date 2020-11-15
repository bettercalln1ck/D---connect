var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var router = express.Router();
var passport=require('passport');
var authenticate=require('../authenticate');
const cors = require('./cors');


const followRouter = express.Router();

followRouter.use(bodyParser.json());





module.exports = followRouter;