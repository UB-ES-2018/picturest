var mongoose = require('mongoose')

var ChatSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    messages: {
        type: []
    }
})

module.exports = mongoose.model('Chat', ChatSchema)