'use strict'

const basePath = 'http://localhost:3000'

let token = ''
let aux = ''

function submitForm(formId) {
  let formDom = document.querySelector('#' + formId)

  let encType = formDom.getAttribute('x-enctype')
  let target = formDom.getAttribute('x-target')
  let method = formDom.getAttribute('x-method')

  let data = {}

  if (formId === 'signup'){
    let form = new FormData(formDom)
    
    let email = form.get('email')
    let password = form.get('password')
    let age = form.get('age')
    
    data = {
      email : email,
      password : password,
      age : age
    }
  }

  if (formId === 'login'){
    let form = new FormData(formDom)

    let email = form.get('email')
    let password = form.get('password')
    aux = email.split("@")[0]
    
    data = {
      email : email,
      password : password
    }
  }

  console.log('token', token)
  console.log('encType', encType)
  console.log('target', basePath + target)
  console.log('data', data)

  superagent
  .post(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    if (res.body.token) {
      token = res.body.token
    }
    
    if(formId=='login' && res.body.token){
      document.cookie = setCookie("token",token,1);
      document.cookie = setCookie("username",aux,1);
      window.location = "Perfil.html"
    }
    //document.querySelector('#' + formId + '-log').value = JSON.stringify(res.body)
    console.log(JSON.stringify(res.body))
    
  })
  .catch(function(e) {
    console.error(e)
    //document.querySelector('#' + formId + '-log').value = JSON.stringify(e)
  })
}

function upload() {
  let file = document.querySelector('#image-uploader').files[0]
  let token = getCookie("token")
  let text = document.querySelector('#image-description').value

  superagent
  .post('http://localhost:3000/image')
  .set('x-access-token', token)
  .field('token', token)
  .attach('image', file, file.name)
  .then(function(res) {
    let source = getImage(res.body.url)

    getTag(res.body.imageId, text)//Añadido

    document.querySelector('#upload-demo').setAttribute('src', source)
    //document.querySelector('#upload-log').value = res.body.url
    var i = document.createElement("img")
    i.src= source;
    i.style.cssText = 'width:100%'
    document.querySelector('#columnaimagen').appendChild(i);

  })
}

//Añadido
function getTag(id, text){
  let token = getCookie("token")

  let data = {}

  data = {
      imageId : id,
      desc : text
  }

  superagent
  .put('http://localhost:3000/image/tag')
  .set('x-access-token', token)
  .set('Content-Type','application/x-www-form-urlencoded')
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    console.log('url', res.body.url)
  })
  .catch(function(e) {
    console.error(e)
  })
  
}

function getImage(url) {
  return url + '?token=' + token
}

function download() {
  let url = document.querySelector('#image-downloader').value
  let source = getImage(url)

  document.querySelector('#download-demo').setAttribute('src', source)
  document.querySelector('#download-log').value = source

}

function getImageByTag(){
  let formDom = document.querySelector('#tag')
  let token = getCookie("token")

  let encType = formDom.getAttribute('x-enctype')
  let target = formDom.getAttribute('x-target')
  let method = formDom.getAttribute('x-method')

  let data = {}

  let form = new FormData(formDom)

  let mytags = form.get('search');
  
  mytags = mytags.split('#')
  mytags.shift()
  var myJson = JSON.stringify(mytags)

  data = {
    tags : myJson
  }

  console.log('Tags', data)

  superagent
  .post(basePath + target)
  //.set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    let imgs = res.body.images
    console.log(imgs)
    let ilen= imgs.length

    for (let l=0; l<ilen ; l++){
      let source = basePath +"/image/"+ imgs[l]
      console.log("-------",source)
      
      var d = document.createElement("div");
      d.className = "hover";
      
      var i = document.createElement("img");
      i.src= source;
      i.style.cssText = 'width:100%'
    
      var d2 = document.createElement("div");
      d2.className = "overlay";
    
      var a = document.createElement("a");
      a.className = "btn btn-primary btn-danger"
      a.setAttribute('href','#');
      var idImg= 'pinImage('+ imgs[l] + ')';
      a.setAttribute('onclick',idImg);

      var s = document.createElement("span");
      s.className = "glyphicon glyphicon-pushpin"
    
      var pin = document.createTextNode("Pin");
    
      a.appendChild(s);
      a.appendChild(pin);
      d2.appendChild(a);
      d.appendChild(i);
      d.appendChild(d2);
      
      document.querySelector('#columnaimagen').appendChild(d);
    }
    
  })
  .catch(function(e) {
    console.error(e)
  })
}

function imgUser(){
  let file = document.querySelector('#image-uploader-user').files[0]
  let token = getCookie("token")
  
  superagent
  .post('http://localhost:3000/image')
  .set('x-access-token', token)
  .field('token', token)
  .attach('image', file, file.name)
  .then(function(res) {
    let source = getImage(res.body.url)
    document.querySelector('#upload-demo-user').setAttribute('src', source)
    sendUserPic(res.body.imageId)
  })
}

function sendUserPic(idImg){
  let token = getCookie("token")

  let encType = "application/x-www-form-urlencoded" 
  let target = "/image/"
  let userID = getCookie("username")
  let data = {}
  console.log(token)
  data = {
    imageId : idImg,
    token : token
  }

  superagent
  .put(basePath + target + userID)
  //.set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    alert("se ha subido tu imagen de perfil")
  })
  .catch(function(e) {
    console.error(e)
  })
}

function descUser(){
  let token = getCookie("token")
  let formDom = document.querySelector('#description-user')

  let encType = formDom.getAttribute('x-enctype')
  let target = formDom.getAttribute('x-target')
  let method = formDom.getAttribute('x-method')

  let data = {}

  let form = new FormData(formDom)

  let desc = form.get('desc-user')

  data = {
    desc : desc
  }

  console.log('token', token)
  console.log('encType', encType)
  console.log('target', basePath + target)
  console.log('data', data)

  superagent
  .put(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    alert("se ha subido la descripcion")
    //console.log(JSON.stringify(res.body))
  })
  .catch(function(e) {
    console.error(e)
  })
}

function cargarUser(){


}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Funció per que l'usuari ja loguejat pugui pinejar una imatge. 
function pinImage(url){
  
  //FIXME: GetCookie(token) returning empty token
  let token = getCookie('token');

  
  //let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViZWFlNWNhN2NmYWJlNGM3MjkxODMzYSIsImVtYWlsIjoiMTIzNDVAYS5jb20iLCJpYXQiOjE1NDIxMjEwNTksImV4cCI6MTU0MjIwNzQ1OX0.Kngc28sS7qMLfIOws3UA8QQ9nF1JMzioqWNxBEFP7Wg';
  console.log(token);

  //FIXME: Image id hardcoded because the images in the frontend grid are not stored in the db of the user.
  //let x = '5beae72c7cfabe4c7291833b';
  let src = url;
  let x = document.getElementsByClassName("img-responsive")[0].id;

  //console.log("THIS IS THE ENTERED IMAGE:", src);
  //console.log("THIS IS THE ENTERED IMAGE ID: ", x);

  superagent
  .put(basePath + '/user/pin/' + x)
  .set('x-access-token', token)
  .field('token', token)
  .then(res => {
    window.alert('Image pinned successfully')
    console.log(JSON.stringify(res.body))
  }).catch(e => {
    console.log(e.message)
  });

}


//
