'use strict'

const basePath = 'http://localhost:3000';
const user = 'ejairo@ejairo.com';
let token = '';
let aux = '';

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
    aux = email
    
    data = {
      email : email,
      password : password
    }
  }

  //console.log('token', token)
  //console.log('encType', encType)
  //console.log('target', basePath + target)
  //console.log('data', data)

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
      document.cookie = setCookie('token',token,1);
      document.cookie = setCookie('username',aux,1);
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
      var idImg= 'pinImage("'+ imgs[l] + '")';
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
  let file = document.querySelector('#imageUpload').files[0]
  let token = getCookie("token")
  
  superagent
  .post('http://localhost:3000/image')
  .set('x-access-token', token)
  .field('token', token)
  .attach('image', file, file.name)
  .then(function(res) {
    let source = getImage(res.body.url)
    //document.querySelector('#upload-demo-user').setAttribute('src', source)
    sendUserPic(res.body.imageId)
  })
}

function sendUserPic(idImg){
  let token = getCookie("token")

  let encType = "application/x-www-form-urlencoded" 
  let target = "/addImg/"
  let userID = getCookie("username")
  let data = {}
  
  data = {
    imageId : idImg,
    token : token
  }
  console.log(data)
  superagent
  .put(basePath + target)
  //.set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
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
    desc : desc,
    token : token
  }

  console.log('token', token)
  console.log('encType', encType)
  console.log('target', basePath + target)
  console.log('data', data)

  superagent
  .put(basePath + target)
  //.set('x-access-token', token)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    alert("se ha subido la descripcion")
    console.log(JSON.stringify(res.body))
  })
  .catch(function(e) {
    console.error(e)
  })
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
function pinImage(imageId){
  
  let token = getCookie('token');

  let x = imageId

  console.log("THIS IS THE ENTERED IMAGE ID: ", x);

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

function getImgPin(){
  let token = getCookie("token")

  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/downloadPinned"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  //.set('Accept', 'application/json')
  //.send(data)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    let pins = res.body.pins
    let plen= pins.length
    for (let p=0; p<plen ; p++){
      let source = basePath +"/image/"+ pins[p]
      console.log("-",source)
      
      var i = document.createElement("img");
      i.src= source;
      i.style.cssText = 'width:100%'
      
      document.querySelector('#columnaimagen1').appendChild(i);
    }
  })
  .catch(function(e) {
    console.error(e)
  })
}

function getProfileImg(){
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/profileImg"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  //.set('Accept', 'application/json')
  //.send(data)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    let sImg =  basePath+ "/image/" + res.body.profile_img
    document.querySelector('#profileImage').setAttribute('src',sImg)
     })
  .catch(function(e) {
    console.error(e)
  })
}

function getProfileDesc(){
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/profileDesc"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  //.set('Accept', 'application/json')
  //.send(data)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    let sDesc = res.body.profile_desc
    document.querySelector('#profileDesc').appendChild(document.createTextNode(sDesc))
  })
  .catch(function(e) {
    console.error(e)
  })
}

function getProfileData(){
  getProfileImg()
  getProfileDesc()
}
    
// Add interests when the user logs in for the first time
function sendInterests(checked){

  let token = getCookie('token');
  let interests =  checked;
  console.log(interests);

  let data = {}

  data = {
    interests : interests,
    token : token
  }

  superagent
  .put(basePath + '/user/addInterest')
  .set('x-access-token', token)
  .send(data)
  .then(res => {
    console.log(JSON.stringify(res.body))
    console.log("INTERESOS AFEGITS!")
  }).catch(e => {
    console.log(e.message)
  });
}

// Add user interests from settings
function interestsUser(){
  let token = getCookie("token")
  let formDom = document.querySelector('#interests-user')

  let encType = formDom.getAttribute('x-enctype')
  let target = formDom.getAttribute('x-target')
  let method = formDom.getAttribute('x-method')

  let data = {}

  let form = new FormData(formDom)

  let interests = form.get('int-user')

  data = {
    interests : interests,
    token : token
  }

  console.log('token', token)
  console.log('encType', encType)
  console.log('target', basePath + target)
  console.log('data', data)

  superagent
  .put(basePath + target)
  .set('Content-Type', encType)
  .set('Accept', 'application/json')
  .send(data)
  .then(function(res) {
    alert("INTERESOS PUJATS!")
    console.log(JSON.stringify(res.body))
  })
  .catch(function(e) {
    console.error(e)
  })
}

//cargar la Lista de Chat
function cargarListaChat(){
  let token = getCookie("token")

  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/myFollows"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  //.set('Accept', 'application/json')
  //.send(data)
  .then(function(res) {
    let follows = res.body.mails
    let flen= follows.length

    for (let f=0; f<flen ; f++){
      var d = document.createElement("div");
      d.className = "chat_list";
      
      var d2 = document.createElement("div");
      d2.className= "chat_people";

      var di = document.createElement("div");
      d2.className= "chat_img";

      var i = document.createElement("img")
      i.src= "Images/No-Profile.png";
      i.alt = 'sunil';

      var dc = document.createElement("div");
      dc.className = "chat_ib";

      var a = document.createElement("a");
      var correoDest= 'destinatacioMsg("'+ follows[f] + '")';
      a.setAttribute('onclick',correoDest);

      var h = document.createElement("h5")
      var name = document.createTextNode(follows[f])
      
      h.appendChild(name);
      a.appendChild(h)
      dc.appendChild(a);
      di.appendChild(i);
      d2.appendChild(di);
      d2.appendChild(dc)
      d.appendChild(d2);

      document.querySelector('#inbox-chat').appendChild(d);
    }
  })
  .catch(function(e) {
    console.error(e)
  })
}
//FIN cargar la Lista de Chat

function destinatacioMsg(user){
  console.log("Cambiar destinatario: "+user);
  let formDom = document.querySelector('#bar-msg')
  formDom.action = 'javascript:enviarMsg("'+ user + '")';
  var node = document.querySelector('#historial-msg')
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

//Mensages de CHAT
function enviarMsg(user){
  console.log("Envio mensaje a: " , user)
  let token = getCookie("token")
  var socket = io.connect('http://localhost:3000', {transports: ['websocket'], upgrade: false });

  // Enviar un nuevo mensaje, Ejemplo de mensaje a mí mismo
  socket.emit('new-message',
      {
          token: token,
          to: user,
          message: document.querySelector('#bar-mensaje').value
      });

  //añadimos mensaje enviado
  var d = document.createElement("div");
  d.className = "outgoing_msg";
  
  var d2 = document.createElement("div");
  d2.className= "sent_msg";

  var p = document.createElement("p");
  
  var m = document.createTextNode(document.querySelector('#bar-mensaje').value);

  var s = document.createElement("span");
  s.className = "time_date"
  var fecha = document.createTextNode("ahora")

  var pin = document.createTextNode("Pin");

  p.appendChild(m);
  s.appendChild(fecha);
  d2.appendChild(p);
  d2.appendChild(s);
  d.appendChild(d2);

  document.querySelector('#historial-msg').appendChild(d);
  
  document.querySelector('#bar-mensaje').value = "";
}
//End Mensages de CHAT


function prueba(){

    let follows = ["Usuario1--","Usuario2--"]//res.body.mails
    let flen= follows.length

    for (let f=0; f<flen ; f++){
      var d = document.createElement("div");
      d.className = "chat_list";
        
      var d2 = document.createElement("div");
      d2.className= "chat_people";

      var di = document.createElement("div");
      di.className= "chat_img";

      var i = document.createElement("img")
      i.src= "Images/No-Profile.png";
      i.alt = 'sunil';

      var dc = document.createElement("div");
      dc.className = "chat_ib";

      var a = document.createElement("a");
      var correoDest= 'destinatacioMsg("'+ follows[f] + '")';
      a.setAttribute('onclick',correoDest);

      var h = document.createElement("h5")
      var name = document.createTextNode(follows[f])
      
      h.appendChild(name);
      a.appendChild(h)
      dc.appendChild(a);
      di.appendChild(i);
      d2.appendChild(di);
      d2.appendChild(dc)
      d.appendChild(d2);

      document.querySelector('#inbox-chat').appendChild(d);
  } 
}
  
function loadUserImages() {
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/images"

  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)  
  .then(res => {
    let ids = res.body.msg
    let idsLen= ids.length
    for (let id=0; id<idsLen ; id++){
      let source = basePath +"/image/"+ ids[id]
      console.log("-",source)
      
      var img = document.createElement("img");
      img.src= source;
      img.className = "img-responsive";

      var etiqueta = document.createElement("label");
      etiqueta.className = "image-checkbox";

      var check = document.createElement("input");
      check.setAttribute("type", "checkbox");
      check.name = "image[]";
      check.value = ids[id];

      var i = document.createElement("i");
      i.className = "fa fa-check hidden";

      etiqueta.appendChild(img);
      etiqueta.appendChild(check);
      etiqueta.appendChild(i);

      var columna = '#modalCollectionCol' + ((id%4) +1)
      document.querySelector(columna).appendChild(etiqueta);
    }
  }).catch(e => {
    console.log("Adeuu")
  });
}

function addCollection() {
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/addCollection"

  let description = document.querySelector('#collection-description').value
  let title = document.querySelector('#collection-name').value
  var checkedList = document.querySelectorAll("input[name^='image[']:checked")
  let imageIds = ""
  let data = {}  

  for (let i=0; i<checkedList.length - 1 ; i++){
    imageIds += checkedList[i].value + " "
  }
  imageIds += checkedList[checkedList.length-1].value


  data = {
    name : title,
    images : imageIds,
    description : description,
    token : token
  }

  superagent
  .post(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  .send(data)
  .then(function(res) {
    $('#modalCollection').modal('hide');
  })
  .catch(function(e) {
    console.error(e)
  })
}

function loadCollections() {
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/downloadCollections"

  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  .then(function(res) {
    for (let c=0; c<res.body.length; c++){

      //Nombre collection
      var etiqueta = document.createElement("label");
      var i = document.createElement("i");
      i.textContent = res.body[c].name;
      etiqueta.appendChild(i);      

      //Imagen Collection
      let source = basePath +"/image/"+ res.body[c].images[0]
      var img = document.createElement("img");
      img.src= source;
      img.className = "img-responsive";
      img.setAttribute('data-toggle', 'modal');
      img.setAttribute('data-target', '#showCollection');
      img.setAttribute('onclick', 'javascript:showCollection(' + c + ')');
      etiqueta.appendChild(img);
      
      //añadir a la capa correspondiente
      var columna = '#collectionCol' + ((c%4) +1)
      document.querySelector(columna).appendChild(etiqueta);
    }
  })
  .catch(function(e) {
    console.error(e)
  })
}

function showCollection(indice){
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/downloadCollections"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  .then(function(res) {
      document.querySelector('#showCollectionTitle').textContent = res.body[indice].name
      document.querySelector('#showCollectionDesc').textContent = res.body[indice].description
      for (let c=0; c<res.body[indice].images.length; c++){
        let source = basePath +"/image/"+ res.body[indice].images[c]
        var img = document.createElement("img");
        img.src= source;
        img.className = "img-responsive";        
        var columna = '#showCollectionCol' + ((c%4) +1)
        document.querySelector(columna).innerHTML = img.outerHTML
      
      }      
  })
  .catch(function(e) {
    console.error(e)
  })
}