var mongoose = require('mongoose')

var ImageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: Buffer,
        required: true
    },

    tag: {
        type: [String],
        required: false
    }
})

module.exports = mongoose.model('Image', ImageSchema)