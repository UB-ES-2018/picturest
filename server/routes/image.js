
module.exports = function (app) {
    //var user = require('../controllers/user')
    var image = require('../controllers/image')

    // Calls must be authenticated.
    //user.middleware(app)

    app.get('/images/', image.downloadAll)
    app.get('/image/:imageId', image.downloadOne)
    app.post('/image/tag', image.findByTag)
    app.post('/image/', image.uploadImage, image.upload)
}