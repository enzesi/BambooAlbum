		var express = require('express');
		var router = express.Router();
		var mongo = require('mongo');
		var MongoClient = require('mongodb').MongoClient;
		var url = 'mongodb://localhost/data';
		var session  = require('express-session');
		var bodyParser = require('body-parser');
		var multer = require('multer');
		var upload = multer(); 
		var axios = require('axios');
		var path = require('path');

		//variables for calling microsoft API
		var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";
		var subscriptionKey = "e59470407d82483288140d96cecb8ef0";
		
		// Store to MongoDB Atlas
		var connectionString = "mongodb+srv://admin:admin@test-zokjp.mongodb.net/test";

		router.use(upload.array());
		router.use(bodyParser.json());
		router.use(bodyParser.urlencoded({ extended: true })); 

router.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

	/* GET users listing. */
	router.get('/', function(req, res, next) {
	  res.sendFile(path.join(__dirname, '../','add.html'));
	});

	router.post('/upload',function(req,res,next){
	var photoUrl = req.body.url;
	console.log(photoUrl);
	axios({
	  method: 'post',
	  url: uriBase,
	  headers: {
	        "Content-Type" : "application/json",
	        "Ocp-Apim-Subscription-Key" : subscriptionKey
	    },
	  params : {
	        "visualFeatures": "Description",
	            "details": "",
	            "language": "en"
	        },
	    data : {"url" : photoUrl}   
	})
	.then(function(response) {
	MongoClient.connect(connectionString,function(err,client){
		if (err) res.send("error");
		var dbo = client.db("userImage");
		req.body["tags"] = response.data.description.tags;
		dbo.collection(req.body.userId).insertOne(req.body,function(err,response){
		if (err) throw res.send("error");
		else res.send("success");
		client.close();			
	});
	});
	}).catch((error) => {
res.send("error");
}); 
	});

	router.post('/delete',function(req,res,next){
		MongoClient.connect(url,function(err,db){
		var dbo = db.db("userdb");
	    dbo.collection(req.body.userId).deleteOne(req.body,function(err,obj){
	    	if (err) throw err;
	    	else res.send("deleted")
	    	db.close();
	    });
	});
	});



/*
	router.post('/test',function(req,res,next){
	MongoClient.connect(connectionString,function(err,client){
		if (err) res.send("error");
		console.log(err);
		console.log(client);
		var dbo = client.db("test");
		dbo.collection("please").insertOne("123",function(err,response){
		if (err) throw res.send("error");
		else res.send("success");
		client.close();			
	});
	});
});

*/
	module.exports = router;
