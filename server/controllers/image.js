var Image = require('../models/image')
var multer = require('multer')

// Destination of our image
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'static/')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

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

    // New Image
    let image = new Image ({
        user: req.body.user,
        name: req.body.name,
        image: req.file.path
    });

    // Save the image to the DB
    image.save(function (err, saved) {
            if (err) throw err
            if (saved) {
                // if OK sends true
                res.json({
                    success: true,
                    message: "Image uploaded successfully",
                    uploadedImage: {
                        name: image.name,
                        request: {
                            type: 'GET',
                            url: "http://localhost:3000/" + image.image
                        }
                    }
                })
            }
        })
}

// GET download all images
exports.download = function (req, res) {
    Image.find()
        .select("user name image")
        .exec()
        .then(docs => {
            const response = {
                success: true,
                count: docs.length,
                images: docs.map(doc => {
                    return {
                        user: doc.user,
                        name: doc.name,
                        image: doc.image,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/" + doc.image
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}