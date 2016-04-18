var express = require('express');
var router = express.Router();

var bodyParser = require("body-parser");

var session = require('client-sessions');

router.use(session({
  cookieName: 'session',
  secret: '1234567890',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// Connection with database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/accounts", {native_parser:true});
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(function(req,res,next){
	req.db = db;
	res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	next();
});

function requireLogin (req, res, next) {
	console.log(req.session.user);
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/index');
});

router.get('/index', function(req, res) {
	  res.render('pages/index');
	});

/* GET "search" page. */
router.get('/search', requireLogin, function(req, res) {
  res.render('pages/search');
});

/* GET "about" page. */
router.get('/about', function(req, res) {
  res.render('pages/about');
});

/* GET contact page. */
router.get('/contact', function(req, res) {
  res.render('pages/contact');
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('pages/login');
});


router.post('/login', function(req, res) {
  db.collection('accounts').findOne({
      'login': req.body.username, 
    }, function(err, user) {
    if (!user) {
      res.render('loginFailure', { error: 'Invalid username or password.' });
    } else {
      if (req.body.password === user.password) {
        // sets a cookie with the user's info
        req.session.user = user;
        //res.render('pages/loginSuccess');
	res.redirect('/');
	console.log(req.session.user);
      } else {
        res.render('pages/login', { error: 'Invalid email or password.' });
      }
    }
  });
});

/* GET registration page. */
router.get('/register', function(req, res) {
  res.render('pages/register');
});



module.exports = router;
