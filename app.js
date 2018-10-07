require('dotenv').config()

let express = require('express')
let bodyParser = require('body-parser')
let cors = require('cors')

var app = express()

var mongoose = require('mongoose')

app.use(cors())

// Connect to mongoDB.
mongoose.Promise = require('q').Promise
mongoose.connect(process.env.DB_HOST).then((db) => {


  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }))

  // parse requests of content-type - application/json
  app.use(bodyParser.json())

  // CORS.
  useCors(app)

  // Routes for Associates API.
  require('./server/routes/user.js')(app)

    app.disable('etag')
    app.get('*', function (req, res, next) {
      res.setHeader('Last-Modified', (new Date()).toUTCString())
      next()
    })
    server = app.listen(process.env.PORT, function () {
      console.log('Server and listening on port ' + process.env.PORT)
    })
}).catch(err => { // mongoose connection error will be handled here
  console.error('App starting error:', err.stack)
  process.exit(1)
})

/* 
// Use Cors.
function useCors (app) {
  // Cors
  var originsWhitelist = [
    'http://localhost',
    'http://localhost:4200'
  ]
  var corsOptions = {
    origin: function (origin, callback) {
      var isWhitelisted = originsWhitelist.indexOf(origin) !== -1
      callback(null, isWhitelisted)
    },
    credentials: true
  }

  // Here is the magic
  app.use(cors(corsOptions))
}*/