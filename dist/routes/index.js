"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const https = require("https");
const mongo = require("mongodb");
const fs = require('fs');
const card = require('./card.js');
const request = require('request');
const reaction = require('./reaction.js');
var url = "mongodb+srv://admin:Password123@chemistryagainsthumanity-5zhct.mongodb.net";
var passport = require('passport');
var saml = require('passport-saml');
var user = "Not Logged In";
var samlStrategy = new saml.Strategy({
    callbackUrl: '/plogin/callback',
    entryPoint: 'https://sso.unc.edu/idp/profile/SAML2/Redirect/SSO',
    issuer: '/passport',
    cert: fs.readFileSync('sso-signing.pem', 'utf8')
}, function(profile, done){
    return done(null, profile);
});
passport.use(samlStrategy);

class IndexRoute extends route_1.BaseRoute {
    static create(router) {
        console.log("[IndexRoute::create] Creating index route.");
        router.get("/", (req, res, next) => {
            new IndexRoute().index(req, res, next);
        });
        router.post("/", (req, res, next) => {
            new IndexRoute().index(req, res, next);
        });
        router.post("/admin", (req, res, next) => {
            new IndexRoute().admin(req, res, next);
        });
        router.get("/admin", (req, res, next) => {
            res.send("You either do not have permission to access this page, or you are trying to access it directly.  If you are an admin, please authenticate and try again.");
        });
        router.post("/getImage", (req, res, next) => {
            new IndexRoute().getImage(req, res, next);
        });
        router.get("/passport", (req, res, next) => {
            new IndexRoute().passport(req, res, next);
        });
        router.get("/login", (req, res, next) =>{
            new IndexRoute().login(req, res, next);
        });
        router.get("/shibtest", (req, res, next) =>{
            new IndexRoute().plogin(req, res, next);
        });
        router.post("/plogin/callback", (req, res, next) =>{
            new IndexRoute().callback(req, res, next);
        });
        router.post("/game", (req, res, next) => {
            new IndexRoute().login(req, res, next);
        });
        router.get("/game", (req, res, next) => {
            new IndexRoute().game(req, res, next);
        });
        router.get("/practiceGame", (req, res, next) => {
            new IndexRoute().practiceGame(req, res, next);
        });
        router.post("/addReaction", (req, res, next) => {
            new IndexRoute().addReaction(req, res, next);
        });
        router.post("/generateCards", (req, res, next) => {
            new IndexRoute().generateCards(req, res, next);
        });
        router.post("/generateSolutions", (req, res, next) => {
            new IndexRoute().generateSolutions(req, res, next);
        });

        router.get("/exportPoints", (req, res, next) => {
            new IndexRoute().exportPoints(req, res, next);
        });
        router.get("/resetPoints", (req, res, next) => {
            new IndexRoute().resetPoints(req, res, next);
        });
        router.get("/getLeaderboard", (req, res, next) => {
            new IndexRoute().getLeaderboard(req, res, next);
        });
        router.post("/updateLeaderboard", (req, res, next) => {
            new IndexRoute().updateLeaderboard(req, res, next);
        });
        router.post("/toggleReaction", (req, res, next) => {
            new IndexRoute().toggleReaction(req, res, next);
        });
    }

    constructor() {
        super();
    }

    index(req, res, next) {
        var onyen = req.get('uid');
        user = onyen;
        var isAdmin = false;
        var admins = ["mlal123", "kerandby", "pozefsky", "moy"];
        this.title = "Home | Chemistry Against Humanity";
        let options = {
           "message": "Welcome to Chemistry Against Humanity",
           "user": onyen
        };
        if (admins.includes(onyen)){
                isAdmin = true;
                options.isAdmin = true;
        }else{
                options.isAdmin = false;
        }

        mongo.MongoClient.connect(url, function (err, db) {
                if (err)
                    throw err;
                var dbo = db.db("chemistryagainsthumanity");
                var user_entry = {
                    onyen: onyen,
                    points: 0,
                    isAdmin: isAdmin
                };
                dbo.collection("users").update({ "onyen": onyen }, { "$setOnInsert": user_entry }, { upsert: true }, function (err, res) {
                        if (err)
                                throw err;
                        else
                                console.log("new user");

                });
            });
        this.render(req, res, "index", options);
    }

    passport(req, res, next){
        request('https://sso.unc.edu/idp', function(error, response, resultData){
            if (!error && response.statusCode == 200) {
                // do your stuff here..
                console.log(response.statusCode);
            }else{
                console.log("problem!");
            }
        });
    }

    callback(req, res, next){
        passport.authenticate('saml', {failureREdirect: '/', failureFlash: true}), function(req, res){
            console.log(res);
            res.redirect('/');
        }
    }
    shibtest(req, res, next){
      console.log("we in here");
    }

    login(req, res, next) {
        let options = {};
        /*
        request("https://smartacids.chem.unc.edu/", function(error, response, body){
                if (!error && response.statusCode == 200){
                        console.log(response.headers);
                }
                if (error){
                        console.log("error: " + error);
                }
        });
        https.get('https://smartacids.chem.unc.edu/', (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers['Remote-User']);

                res.on('data', (d) => {
                        console.log(d);
                 });

        }).on('error', (e) => {
                console.error(e);
        });*/
        //console.log(res);
        this.title = "Login";
        let options = {};
        if (req.body.status === "pass") {
            options.status = "pass";
            options.user = req.body.onyen;
            var isAdmin = false;
            if (req.body.onyen == "qianqian"
                || req.body.onyen == "youngjt"
                || req.body.onyen == "renfro18"
                || req.body.onyen == "csv17"
                || req.body.onyen == "cmoy"
                || req.body.onyen == "pozefsky"
                || req.body.onyen == "mlal123"
                || req.body.onyen == "kerandby") {
                isAdmin = true;
                options.isAdmin = true;
            }
            else {
                options.isAdmin = false;
            }

            mongo.MongoClient.connect(url, function (err, db) {
                if (err)
                    throw err;
                var dbo = db.db("chemistryagainsthumanity");
                var user_entry = {
                    onyen: req.body.onyen,
                    points: 0,
                    isAdmin: isAdmin
                };
                dbo.collection("users").update({ "onyen": req.body.onyen }, { "$setOnInsert": user_entry }, { upsert: true }, function (err, res) {
                    if (err)
                        throw err;
                });
            });
        }
        else {
            options.status = "fail";
        }
        this.render(req, res, "game", options);
    }

    admin(req, res, next) {

      // This DB connection updates the points.csv, in case the user downloads it.
      mongo.MongoClient.connect(url, function (err, db) {
          if (err)
              throw err;
          var dbo = db.db("chemistryagainsthumanity");
          dbo.collection("users").find({}).toArray(function (err, docs) {
              var path = 'dist/public/points.csv';
              var data = new Array();
              data.push([" "]);
              data.push(["onyen", "points\n"]);
              for (var i = 0; i < docs.length; i++) {
                  data.push([docs[i]['onyen'], docs[i]['points'] + '\n']);
              }
              fs.writeFile(path, data, function (err, res2) {
                  if (err)
                      throw err;
              db.close();
              });
          });
      });

      // This DB connection updates the reactions.csv, in case the user downloads it.
      mongo.MongoClient.connect(url, function (err, db) {
          if (err)
              throw err;
          var dbo = db.db("chemistryagainsthumanity");
          dbo.collection("reactions").find({}).toArray(function (err, docs) {
              var path = 'dist/public/reactions.csv';
              var data = new Array();
              data.push([" "]);
              data.push(["id", "reactant", "reagent", "product\n"]);
              for (var i = 0; i < docs.length; i++) {
                  data.push([docs[i]['_id'], docs[i]['reactant'], docs[i]['reagent'], docs[i]['product'] + '\n']);
              }

              fs.writeFile(path, data, function (err, res2) {
                  if (err)
                      throw err;
              db.close();
              });
            });
          });


      var responseArray = new Array();
      mongo.MongoClient.connect(url, function (err, db) {
          if (err)
              throw err;
          var dbo = db.db("chemistryagainsthumanity");
          dbo.collection("reactions").find({ } , { _id: 0, reactant: 1, reagent: 1, product: 1, active: 0 }).toArray(function (err, res2) {
              if (err) { throw err; }

              responseArray = res2;

              db.close();
              res.render("admin", {responseArray: responseArray});

            })
          })
    }
    getImage(req, res, next) {
        var json_obj = {};
        Object.keys(req.body).map(function (key) {
            var chem = req.body[key]['name'];
            var isActive = req.body[key]['active'];
            var img_src;
            if (typeof req.body[key]['depiction'] == 'undefined') {
                var encoded = encodeURIComponent(chem);
                img_src = "http://opsin.ch.cam.ac.uk/opsin/" + encoded + ".png";
            }
            else {
                img_src = req.body[key]['depiction'];
            }
            json_obj[key] = {
                name: chem,
                depiction: img_src,
                active: isActive
            };
        });
        var response = JSON.stringify(json_obj);

        res.send(response);
    }

    game(req, res, next) {
        let options = {"user": user};
        this.render(req, res, "game", options);
    }

    practiceGame(req, res, next) {
        let options = {};
        this.render(req, res, "game", options);
    }

    toggleReaction(req,res,next) {
      mongo.MongoClient.connect(url, function(err,db) {
        if (err) {throw err}
        var dbo = db.db("chemistryagainsthumanity");
        var reactantPassed = req.body.reactant.front;
        var reagentPassed = req.body.reagent.front;
        var productPassed = req.body.product.front;
        var currentlyActive = req.body.active.active;
        var switchTo;
        if (currentlyActive == "true") {
          switchTo = false;
        } else { console.log("no here" ); switchTo = true;}
            dbo.collection('reactions').update({reactant: reactantPassed, reagent: reagentPassed, product: productPassed },{ "$set": { "active": switchTo } }, function (err, res2) {
            if (err)
                throw err;
            var response = JSON.stringify(res2);
            res.send(response);
          });
      });
    }

    addReaction(req, res, next) {
        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            var reaction_entry = {
                reactant: req.body.reactant.back,
                reagent: req.body.reagent.back,
                product: req.body.product.back,
                active: true
            };
            dbo.collection("reactions").insertOne(reaction_entry, function (err, res) {
                if (err){
                    console.log(err)
                }else{
                        console.log('1 reaction inserted into reactions table');
                    }
            });
            var cards_entry = new Array();
            Object.keys(req.body).map(function (key) {
                var back = req.body[key]['back'];
                var image = req.body[key]['front'];
                var encoded = back.replace(/ +/g, "");
                var img_src = "/SteveenBranch/" + encoded + ".png";
                var img_src_to_file = "dist/public/SteveenBranch/" + encoded + ".png";
                if (image.startsWith("http://opsin")){
                    request.get({url: image, encoding: 'binary'}, function(err, response, body){
                        fs.writeFile(img_src_to_file, body, 'binary', function(err){
                            if (err)
                                console.log(err);
                            else
                                console.log("File was saved");
                        })
                    });
                }else{
                    var base64Data = image.replace(/^data:image\/png;base64,/, "");
                    request.get({url: image, encoding: 'base64'}, function(err, response, body){
                        fs.writeFile(img_src_to_file, base64Data, 'base64', function(err){
                        if (err)
                            console.log(err);
                        else
                            console.log("File was saved");
                        });
                    });
                }
                var card_obj = {
                    front: img_src,
                    back: req.body[key]['back'],
                    active: true
                };

                cards_entry.push(card_obj);
            });
            dbo.collection("cards").insertMany(cards_entry, function (err, res) {
                if (err)
                    throw err;
                console.log('3 cards inserted into cards table');
            });
        });
        var response = { status: "done" };
        res.send(response);
    }

    generateCards(req, res, next) {
        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("cards").find({ active: true }, {_id: 0, front: 1, back: 1, active: 0}).toArray(function (err, res2) {
                if (err)
                    throw err;
                var response = [];
                for (var i = 0; i < res2.length; i++){
                    var r = res2[i];
                    var c = new card.Card(r.back, r.front, r.active);
                    response.push(c);
                }
                //var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }

    generateSolutions(req, res, next) { // Need to filter for active solutions
        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("reactions").find({active: true } , { _id: 0, reactant: 1, reagent: 1, product: 1, active: 0 }).toArray(function (err, res2) {
                if (err)
                    throw err;
                var response = [];
                for (var i = 0; i < res2.length; i++){
                    var r = res2[i];
                    var react = new reaction.Reaction(r.reactant, r.reagent, r.product, r.active);
                    response.push(react);
                }
                res.send(response);

            });
        });
    }

    resetPoints(req, res, next) {
        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").updateMany({ "points": { "$exists": true } }, { "$set": { "points": 0 } }, function (err, res2) {
                if (err)
                    throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }
    getLeaderboard(req, res, next) {
        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").find({}).sort({ "points": -1 }).toArray(function (err, res2) {
                if (err)
                    throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });

    }
    updateLeaderboard(req, res, next) {
        console.log(req.body);
        var onyenToUpdate = req.body['onyen'];
        var points = parseFloat(req.body['points']);

        mongo.MongoClient.connect(url, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("chemistryagainsthumanity");
            dbo.collection("users").update({ "onyen": onyenToUpdate }, { "$set": { "points": points } }, function (err, res2) {
                if (err)
                    throw err;
                var response = JSON.stringify(res2);
                res.send(response);
            });
        });
    }
}


exports.IndexRoute = IndexRoute;