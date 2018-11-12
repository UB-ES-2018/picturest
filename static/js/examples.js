'use strict'

const basePath = 'http://localhost:3000'

let token = ''

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
    
    if(formId=='login'){
      document.cookie = setCookie("token",token,1);
      window.location = "Perfil.html"
    }
    document.querySelector('#' + formId + '-log').value = JSON.stringify(res.body)
    
  })
  .catch(function(e) {
    console.error(e)
    document.querySelector('#' + formId + '-log').value = JSON.stringify(e)
  })
}

function upload() {
  let file = document.querySelector('#image-uploader').files[0]
  let token = getCookie("token")
  //let text = document.querySelector('#image-description')

  console.log("hola")

  superagent
  .post('http://localhost:3000/image')
  .set('x-access-token', token)
  .field('token', token)
  .attach('image', file, file.name)
  .then(function(res) {
    let source = getImage(res.body.url)

    //let resTag = getTag(res.body.url, text)

    document.querySelector('#upload-demo').setAttribute('src', source)
    var i = document.createElement("img")
    i.src= source;
    document.querySelector('#columnaimagen').appendChild(i);

  })
}

function getTag(id, text){
  let token = getCookie("token")
  data = {
      imageId : id,
      desc : text
  }
  console.log("hola")
  console.log(data)

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
//
