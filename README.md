# Picturest

## Server

### Requiremets

- Nodejs
- Npm
- Git
- Mongo

### Start server:
In order to start the server we need to setup our mongodb and all required node modules:

- Create a folder and a subfolfer in the root directory of the project named: ```data/db```
- Start mongo using ```mongod --dbpath ./data/db```
- ```npm i```
- ```node app.js```

### Using server

Using Postman:

Host: http://localhost:3000
Body: x-www-form-urlencoded

- Create user: ```POST /signup``` 
Request body:
```
{
    "email": String, 
    "password": String, 
    "age": Number 
} 
```
Response
```
{
    success: true,
    id: user._id
}
```
- Login: ```POST /login```
Request body:
```
{
    "email": String, 
    "password": String
} 
```
Response
```
{
    success: true,
    id: user._id,
    token: token
}
```
- Upload image: ```POST /image```
Request: [Using Postman choose form-data]
Body:
```
{
    "image": {{IMAGE}},
    "token": token
}
```
Response:
```
{
    "url": {{Uploaded image URL}}
}
```
- Download an image: ```GET /image/:imageId```
- Download all images: ```GET /image/```

- Add tag: ```PUT /image/tag```
Request body:
```
{
    "imageId": _id (Mongo ObjectId, ex: 5bcc544565532640a4712172),
    "desc": "Im an #example of #tags"
}
```
Response
```
{
    "url": (Image URL)
}
```

- Find tag: ```POST /image/tag```
Request body:
```
{
    "tags": ["example1", "example2"]
}
```
Response
```
{
    success: true,
    images: [img1._id, img2._id, img3._id]
}
```

- Add profile Picture: ```PUT /image/:username```
Request body:
```
{
    "imageId": _id (Mongo ObjectId, ex: 5bcc544565532640a4712172),
    "token": "Token provided on login"
}
```
Response
```
{
    "success": true,
    "imageId": _id
}
```
