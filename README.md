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
