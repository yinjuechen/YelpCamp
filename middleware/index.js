var Campground = require('../model/campgroundSchema');
var Comment = require('../model/commentSchema');
var middlewareObj = {
    checkCampgroundPermission: function (req, res, next) {
        if (req.isAuthenticated()) {
            // does user own the campground
            Campground.findById(req.params.id, function (err, foundCampground) {
                if (err) {
                    console.log(err);
                    req.flash('error', ' Campground not found.');
                    res.redirect('back');
                } else {
                    if (!foundCampground) {
                        req.flash('error', "Campground not found");
                        return res.status(400).send("Item not found.");
                    }
                    if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                        next();
                    }
                    else {
                        req.flash('error', "You don't have permission to do that.");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash('error', 'You need to be logged in to do that.');
            res.redirect('/login');
        }
    },
    checkCommentPermission: function (req, res, next) {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function (err, foundComment) {
                if (err) {
                    console.log(err);
                    req.flash("error", "Comment not found.");
                    res.redirect('back');
                } else {
                    if (!foundComment)
                        return res.status(400).send("Item not found.")
                    if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                        next();
                    } else {
                        req.flash("error", "You don't have permission to do that.");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash('error', "You need to be logged in to do that.");
            res.redirect('back');
        }
    },
    loginCheck: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "You need to be logged in to do that.");
        res.redirect('/login');
    }
}

module.exports = middlewareObj;