var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
var http = require('http').Server(app);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require("body-parser");
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/accounts", {native_parser:true});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req,res,next){
	req.db = db;
	res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	next();
});

app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);

// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/login', function(req, res) {
  res.sendfile('public/login.html');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  })
);

app.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});

app.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    db.collection('accounts').findOne({
      'login': username, 
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

//--------HTTP REQUESTS-------------

app.get('/account',function(req,res){
	res.sendFile(path.join(__dirname + '/public/account.html'));
});

app.get('/registration',function(req,res){
	res.sendFile(path.join(__dirname + '/public/registration.html'));
});

app.post('/registration',function(req,res){
	var username = req.body.username;
	var password = req.body.password;

	if(!!username && !!password){
		db.collection('accounts').insert({login:username , password: password}, function(err, result) {
			if(!!err){
				console.log("Some error");
			}else{
				console.log("Registration succesfull!");
			}
		});
	}
	else {
		console.log("Please provide all required data");
	}
});

app.get('/accounts',function(req,res){
	var data = {
		"Data":""
	};
	var db = req.db;
	db.collection('accounts').find().toArray(function (err, items) {
	if(!!err){
		data["Books"] = "Error fetching data";
		res.json(data);
	}else{
		if(!!items && items.length != 0){
			data["error"] = 0;
			data["Books"] = items;
			res.json(data);
		}else{
			data["error"] = 1;
			data["Books"] = 'No books Found..';
			res.json(data);
		}
	}
	});
});

app.get('/book',function(req,res){
	var data = {
		"Data":""
	};
	var db = req.db;
	db.collection('books').find().toArray(function (err, items) {
	if(!!err){
		data["Books"] = "Error fetching data";
		res.json(data);
	}else{
		if(!!items && items.length != 0){
			data["error"] = 0;
			data["Books"] = items;
			res.json(data);
		}else{
			data["error"] = 1;
			data["Books"] = 'No books Found..';
			res.json(data);
		}
	}
	});
});

app.post('/book',function(req,res){
	var Bookname = req.body.bookname;
	var Authorname = req.body.authorname;
	var Price = req.body.price;
	var data = {
		"error":1,
		"Books":""
	};
	if(!!Bookname && !!Authorname && !!Price){
		db.collection('books').insert({bookname:Bookname , authorname: Authorname, price:Price}, function(err, result) {
			if(!!err){
				data["Books"] = "Error Adding data";
			}else{
				data["error"] = 0;
				data["Books"] = "Book Added Successfully";
			}
			res.json(data);
		});
	}else{
		data["Books"] = "Please provide all required data (i.e : Bookname, Authorname, Price)";
		res.json(data);
	}
});

app.put('/book',function(req,res){
	var Id = req.body.id;
	var Bookname = req.body.bookname;
	var Authorname = req.body.authorname;
	var Price = req.body.price;
	var data = {
		"error":1,
		"Books":""
	};
	if(!!Bookname && !!Authorname && !!Price){
		db.collection('books').update({_id:mongo.helper.toObjectID(Id)}, {$set:{bookname:Bookname,authorname:Authorname,price:Price}}, function(err) {
			if(!!err){
				data["Books"] = "Error Updating data";
				console.log("second");
			}else{
				data["error"] = 0;
				data["Books"] = "Updated Book Successfully";
			}
			res.json(data);
		});
	}else{
		data["Books"] = "Please provide all required data (i.e : Bookname, Authorname, Price)";
		res.json(data);
	}
});

app.delete('/book/:bookname',function(req,res){
	var BookName = req.params.bookname;
	var data = {
		"error":1,
		"Books":""
	};
	if(!!BookName){
		db.collection('books').remove({bookname:BookName}, function(err, result) {
			if(!!err){
				data["Books"] = "Error deleting data";
			}else{
				data["error"] = 0;
				data["Books"] = "Delete Book Successfully";
			}
			res.json(data);
		});
	}else{
		data["Books"] = "Please provide all required data (i.e : bookname )";
		res.json(data);
	}
});




// Fire it up!
app.listen(3000);
console.log('Listening on port 3000');

