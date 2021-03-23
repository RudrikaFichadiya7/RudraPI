const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");
const checkAuth = require("../middleware/check-auth");
//const multer = require("multer");
//const upload = multer({dest: './uploads'});

// Registration Route
router.post("/register",(req, res, next) => {
  
  if(req.body.email === undefined || req.body.email == " "){
    res.status(200).json({error: "Please enter email id"});   
  }
  else if(req.body.name === undefined || req.body.name == " "){
    res.status(200).json({error: "Please enter user name"});
  }
  else if(req.body.password === undefined || req.body.password == " "){
    res.status(200).json({error: "Please enter password"});  
  }
  else {
    User.find({ email: req.body.email })
    .then(user => {
      if (user.length >= 1) {
        return User.find({ email: req.body.email })
        .then(user => {
          if (user.length >= 1) {
            return res.status(409).json({
              message: "user with this mail already exists"
            });
          } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                return res.status(500).json({
                  error: err
                });
              } else {
                const user = new User({
                  _id: new mongoose.Types.ObjectId(),
                  email: req.body.email,
                  name: req.body.name,
                  password: hash,
                  profileImage: req.body.profileImage,
                  birthdate: new Date(req.body.birthdate)
                });
                user
                  .save()
                  .then(result => {
                    res.status(201).json({
                      message: "User registered successfully!"
                    });
                  })
                  .catch(err => {

                    res.status(500).json({
                      error: err.toString()
                    });
                  });
              }
            });
          }
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err.toString() // Will show the error which is occuring during hashing process of our password
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
                  email: req.body.email,
                  name: req.body.name,
                  password: hash,
                  profileImage: req.body.profileImage,
                  birthdate: new Date(req.body.birthdate)
            });
            user
              .save()
              .then(result => {
                res.status(201).json({
                  message: "User registered successfully!"
                });
              })
              .catch(err => {
                res.status(500).json({
                  error: err.toString()
                });
              });
          }
        });
        
      }
    });
  }
});

// Login Route
router.post('/login',(req, res, next) => {
  User.find({email: req.body.email})
  .then(user => {
    if(user.length < 1) {
      return res.status(401).json({
        message: "Authorization failed"
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if(err){
        return res.status(401).json({
          message: "Authorization failed"
        });
      }
      if(result){
        const token = jwt.sign({
          email: user[0].email,
          userId: user[0]._id
        }, //payload
        config.testing.JWTKey, //private key
        {
          expiresIn: "1h" // One hour
        })
        return res.status(200).json({
          message: "Authorization successful",
          token: token
        });
      }
      res.status(401).json({
        message: "Authorization failed"
      });
    });
  })
  .catch({});
});



// View Profile with authentication and birthday message without using any package
router.get("/viewProfile", checkAuth, (req, res, next) => {

  User.findOne({email: req.userData.email})
    .select("email name birthdate")
    .exec()
    .then(profileData => {
    
      Date.prototype.addDays = function (days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      }
      let currentDay = new Date();
      let targetDate = currentDay.addDays(7);

      if(profileData.birthdate.getDate() <= targetDate.getDate()){
        if(profileData.birthdate.getMonth() == targetDate.getMonth()){

          if(currentDay.getDate() > profileData.birthdate.getDate()){
          
            return res.status(200).json({
              name: profileData.name,
              email: profileData.email,
              birthdate: currentDay.getDate() - profileData.birthdate.getDate()+" days ago"
            });
          }
          else if(currentDay.getDate() < profileData.birthdate.getDate()){
            
            return res.status(200).json({
              name: profileData.name,
              email: profileData.email,
              birthdate: profileData.birthdate.getDate() - currentDay.getDate() +" days to go"
            });
          }
          else{
            
            return res.status(200).json({
              name: profileData.name,
              email: profileData.email,
              birthdate: "It's your birthday today"
            });
          }
        } else
        {
          return res.status(200).json({
            name: profileData.name,
            email: profileData.email,
            birthdate: profileData.birthdate
          });
        }
      } else
      {
        return res.status(200).json({
          name: profileData.name,
          email: profileData.email,
          birthdate: profileData.birthdate
        });
      }
      
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
