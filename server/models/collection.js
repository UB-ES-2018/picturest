var mongoose = require('mongoose')

var CollectionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: false
    },
    followedBy: {
        type: [String],
        required: false
    }
})

module.exports = mongoose.model('Collection', CollectionSchema)