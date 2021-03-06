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

- Add profile description: ```PUT /addDesc```
Request body:
```
{
    "desc": <String>,
    "token": "Token provided on login"
}
```
Response
```
{
    "success": true,
    "desc": Description
}
```

- Pin picture: ```PUT /user/pin/:imageId```
Request body:
```
{
    "token": "Token provided on login"
}
```
Response
```
{
    "success": true,
 }
```
- Download pinned images: ```GET /user/downloadPinned```
Request headers (example):

```
x-access-token: 435f4w3f...43t423g234
```
Response
```
{
    "success": true,
    "pins: [
        imageId,
        imageId2,
        ...
    ]
 }
```

- Add interest user: ```PUT /user/addInterest```
Request body:
```
{
    "interests": "interest1 interest2 separated by space",
    "token": "Token provided on login"
}
```
Response
```
{
    "success": true,
    "user_interests": interests ID
}
```

- Download an interest of user: ```GET /user/downloadInterest```
```
x-access-token: 435f4w3f...43t423g234
```
Response
```
{
    "success": true,
    "interests": ['interest1, interest2']
}
```

- Add a collection in a user: ```POST /user/addCollection```
Request body:
```
{
    "name": "best collection ever",
    "images": "imageID1 imageID2 imageID3 separatedID byID spaceID",
    "description": "description of collection",
    "token": "Token provided on login"
}
```
Response
```
{
    "success": true,
    "id": collection ID
}
```

- Download all collections of a user: ```GET /user/downloadCollections```
```
x-access-token: 435f4w3f...43t423g234
```
Response
```
[
    {
        "name": collect.name,
        "images": imageID1 imageID2 imageID3 separatedID byID spaceID,
        "description": "collection description",
        "followedBy": []
    }
]
```

- Follow collection: ```PUT /user/followCollection```
Request headers (example):

```
x-access-token: 435f4w3f...43t423g234
```
Body:
```
{
    "collId": <Collection ID>
}
```
Response
```
{
    "success": true,
    "collection": "5bf98b83e3ba9e32bb2c61c1",
    "user": "5bf984d713e5a92d45198acc"
}
    OR (if already added)
{
    "success": true    
}
```
- Follow user: ```PUT /user/follow/:username```

Body:
```
{
    "token": 435f4w3f...43t423g234

}
```
Response
```
{
    "success": true,
    "follow": ["a", "b", ...]
}
```
- Unfollow user: ```PUT /user/unfollow/:username```

Body:
```
{
    "token": 435f4w3f...43t423g234

}
```
Response
```
{
    "success": true,
    "follow": ["a", ...]
}
```

- Get user images: ``` GET/user/images```
Return user owned images, pinned images and images based on interests

Request headers (example):

```
x-access-token: 435f4w3f...43t423g234
```
Response
```
{
    "success": true,
    "msg": [
        "5c0c1a7200495c45218ca61c"
    ]
}
```

- Get user timeline: ``` GET/user/timelineInfo```
Returns a timeline with the new photos of the users that I follow, of the collections that I follow and the photos that are within my interests

Request headers (example):

```
x-access-token: 435f4w3f...43t423g234
```
Response
```
{
    "success": true,
    "imgs": [
        "5c0c1a7200495c45218ca61c",
        "...."
    ]
}
```

## Frontend

### How to use

- Para iniciar el uso de la pagina:

-Una vez has iniciado el servidor, te diriges al servidor y te diriges a: 
```localhost:3000/static/signup.html```

-Una vez tienes tu cuenta utilizando el link bajo el signup o te diriges a:
```localhost:3000/static/login.html```

-Una vez dentro, la unica funcionalidad posible por ahora es la de subir la imagen con el boton localizado abajo a la derecha.
