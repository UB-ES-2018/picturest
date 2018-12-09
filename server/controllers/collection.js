var Collection = require('../models/collection')
var jwt = require('jsonwebtoken')


exports.getCollectionImages = function(_id) {
    Collection.findById({id: _id}).then((collection, err) => {
        if (collection) {
            return collection.images
        }
        if (err) {
            return undefined
        }
    })
}