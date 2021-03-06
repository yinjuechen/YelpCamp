var mongoose = require('mongoose');
var campgroundSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    price: String,
    image: String,
    image_public_id: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt:{
        type:Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});
var Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;