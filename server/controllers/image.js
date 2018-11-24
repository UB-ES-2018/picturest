var Image = require('../models/image')
var multer = require('multer')
var jwt = require('jsonwebtoken')

// Destination of our image
const storage = multer.memoryStorage()

// Reject a file unless it is a jpeg or png
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

// Upload our image
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})
exports.uploadImage = upload.single('image')

// POST upload an image
exports.upload = function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)

    console.log(token)
    let dbImage = new Image({
        user : decodedToken.email,
        name : req.file.originalname,
        content : req.file.buffer
    })

    dbImage.save().then(function(dbRes) {
        console.log('Image uploaded to db with id:', dbRes._id)
        res.json({url : 'http://localhost:3000/image/' + dbRes._id, imageId: dbRes._id})
    })
}

// GET download all images
exports.downloadAll = function (req, res) {
    Image.find().then(function(results) {
        let final = []
        results.forEach(function(img) {
            final.push({
                url : 'http://localhost:3000/download/' + img._id,
                user : img.user,
                name : img.name,
                description : img.description,
                tag: img.tag
            })
        })
        res.json(final)
    })
}

exports.downloadOne = function(req, res) {
    let imageId = req.params.imageId
    console.log('requesting image:', imageId)
    Image.findOne({_id : imageId}).then(function(img) {
        let buffer = img.content
        res.write(buffer, 'binary');
        res.end(null, 'binary')
    })
    .catch(console.error)
}

// Add a tag
exports.addTag = function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let imageId = req.body.imageId
    let desc = req.body.desc
    let tags = []

    tags = findHashtags(desc)
    
    console.debug(desc)
    console.log(tags)

    Image.findOne({_id : imageId}).then(function(img) {
        img.description = desc
        img.tag = tags
        img.save().then(function (dbRes) {
            console.log('Image updated to db with id:', dbRes._id)
            res.json({url: 'http://localhost:3000/image/' + dbRes._id, imageId: dbRes._id})
        })
    })
    .catch(console.error)
}

// Finds hashtags
function findHashtags(searchText) {
    var regexp = /\B\#\w\w+\b/g
    result = searchText.match(regexp);
    if (result) {
        a = []
        result.forEach((tag) => {
            a.push(tag.substring(1, tag.length))
        })
        return a
    } else {
        return []
    }
}

// Returns the image ids if an image contains a given hashtag
exports.findByTag = function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)

    let tags = JSON.parse(req.body.tags)
    let searchResult = []

    Image.find().then((result) => {
        result.forEach((image) => {
            image.tag.forEach((tag) => {
                tags.forEach((_tag) => {
                    if (tag === _tag) {
                        if (!searchResult.includes(image._id)) {
                            searchResult.push(image._id)
                        }
                        
                    }
                })
            })
        })
        res.json({
            success: true,
            images: searchResult
        })
    }).catch(console.error)
}