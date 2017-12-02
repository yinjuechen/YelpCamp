var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/userSchema');
var Campground = require('../model/campgroundSchema');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('landing');
});

//==========
//AUTH ROUTES
//Show register form
router.get('/register', function (req, res) {
    res.render('register/register');
});
router.post('/register', function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar ? req.body.avatar : User.avatar,
        email: req.body.email
    });
    if(req.body.adminCode === process.env.AdminCode){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, function () {
            req.flash("success", "Welcome, " + user.username);
            res.redirect('/campgrounds');
        });
    });
});
//Login Routes
router.get('/login', function (req, res) {
    res.render('login');
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    successFlash:'Welcome back!' ,
    failureFlash: true
}), function (req, res) {
    req.flash('success', 'Welcome back, ' + req.user.username);
});

//Logout Route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "You have been logged out.");
    res.redirect('/campgrounds');
});

//User Profiles
router.get('/users/:id', function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
       if(err){
           req.flash('err', err.message);
           res.redirect('back');
       }else {
           Campground.find().where('author.id').equals(foundUser._id).exec(function (err, campgrounds) {
               if(err) {
                   req.flash('err', err.message);
                   res.redirect('back');
               }else{
                   res.render("users/show", {user: foundUser, campgrounds: campgrounds});
               }
           });
       }
    });
});

//Forget password
router.get('/forgot', function (req, res) {
    res.render('forgot');
});

router.post('/forgot', function (req, res) {

});
module.exports = router;