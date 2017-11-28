var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../model/campgroundSchema');
var Comment = require('../model/commentSchema');
var miiddlewareObj = require('../middleware/index');
// ======================
//     Comments Routes
// ======================

//Comment new
router.get('/new', miiddlewareObj.loginCheck, function (req, res) {
    console.log(req.params.id);
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err)
            console.log(err);
        else {
            res.render('comments/new', {campground: foundCampground});
        }
    })
});

//Comment post
router.post('/', miiddlewareObj.loginCheck, function (req, res) {
    //lookup campground using id
    // create new comment
    //connect new comment to campground
    // redirect to campground:id comment
    var campgroundID = req.params.id;
    Campground.findById(campgroundID, function (err, foundCampground) {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            console.log(req.body.comment);
            //Comment.create({);
            var comment = req.body.comment;
            Comment.create(comment, function (err, newComment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment, then save
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    res.redirect('/campgrounds/' + foundCampground._id);
                }
            });
        }
    })
});

//Comment edit
router.get('/:comment_id/edit', miiddlewareObj.checkCommentPermission, function (req, res) {
    Campground.findById(req.params.id, function (err,foundCampground) {
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        }else {
            Comment.findById(req.params.comment_id, function (err, foundComment) {
                if(err){
                    console.log(err);
                    res.redirect('back');
                }else {
                    res.render('comments/edit', {campground: foundCampground, comment: foundComment});
                }
            })
        }
    });

});

//Comment update
router.put('/:comment_id', miiddlewareObj.checkCommentPermission, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//Comment delete
router.delete('/:comment_id', miiddlewareObj.checkCommentPermission, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if(err){
            console.log(err);
            res.redirect('back');
        }else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});
module.exports = router;
