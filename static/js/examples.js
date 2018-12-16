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
    console.log(res.body.success)
    if (res.body.token) {
      token = res.body.token
    }
    
    if(formId=='login' && res.body.token){
      document.cookie = setCookie('token',token,1);
      document.cookie = setCookie('username',aux,1);
      window.location = "Perfil.html"
    }
    if(formId=='signup' && res.body.success){
      document.cookie = setCookie('token',token,1);
      document.cookie = setCookie('username',aux,1);
      window.location = "signin.html"
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
    
    
    for (let b=1; b<=4;b++){
      var gridImg = '#columnaimagen' + b;

      $(gridImg).empty()
    }

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


      var columna = '#columnaimagen' + ((l%4) +1)
      console.log(columna)
      document.querySelector(columna).appendChild(d);
      //document.querySelector('#columnaimagen').appendChild(d);
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
      
      var columna = '#columnaimagen' + ((p%4) +1)
      document.querySelector(columna).appendChild(i);
      //document.querySelector('#columnaimagen1').appendChild(i);
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

/* 
Inici funció getAllUsers() --> Aquesta funció es crida des de l'HTML per tal de carregar els usuaris ja registrats.
Es fa una consulta per tal de saber tots els usuaris disponibles, es comprova si ja es segueixen o no i en funció 
d'aixó apareixerà un botó de follow o unfollow, així com mostrar el nom de cada usuari i la seva foto de perfil.
*/
function getAllUsers(){
  //let following = myFollows();
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let token = getCookie("token")
  console.log("TOKEN ACTUAL!", token)
  let encType = "application/x-www-form-urlencoded" 
  let target1 = "/user/myFollows";
  let follows = []
  var resposta = false;
  console.log("HOLAAA1f432423")

  superagent
  .get(basePath + target1)
  .set('x-access-token', token)
  .set('Content-Type', encType )
  .then(function(res) {

      console.log("CORRECTE_myfollows", JSON.stringify(res.body))
      var mails = res.body;
      var nom = "";
      for (let i = 0; i < mails["mails"].length; i++){
        nom = mails["mails"][i];
        nom = nom.split("@");
        nom = nom[0]
        follows.push(nom)
      }
    resposta = true;
    setUsersToFollow(follows); 
  })
  .catch(function(e) {
    console.error(e)
  })
  setTimeout(myFunction, 500)
  function myFunction(){
    if (resposta == false){
      console.log("SAALTA EL TIMER!!")
      let follows = []
      setUsersToFollow(follows); 
    }
  }
}

function setUsersToFollow(follows){
  let target = "/user/all";
  let actualUser = getCookie("username");
  let following = follows;
  let encType = "application/x-www-form-urlencoded" 

  console.log("ESTIC SEGUINT: ", following);
  
  superagent
  .get(basePath + target)
  .set('Content-Type', encType)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    let get = res.body.users
    console.log('GET', get[0].email)
    var nom = "";
    var email = ""
    for(let i = 0; i <get.length; i++){
      nom = get[i]["email"];
      email = get[i]["email"];
      nom = nom.split("@")
      nom = nom[0];

      if (nom != actualUser){

        var label = document.createElement("label");
        label.id = nom;
        label.className = nom;
        label.textContent = nom;
        label.style.marginLeft = "10px"

        var photo = document.createElement("img");
        photo.id = "photo"+nom;
        photo.src = "Images/No-Profile.png"
        photo.length = "70"
        photo.width = "70"
        photo.style.marginLeft = "20px"

        label.append(photo);

        getProfileImage(email, nom)

        if (following.includes(nom)){
          var btn = document.createElement("BUTTON");
          btn.id = nom
          btn.textContent = "Unfollow";  
          btn.style.height = "25px";
          btn.style.width = "70px"
          btn.style.color = "white"
          btn.style.backgroundColor = "#ef5a4a"
          
          btn.addEventListener("click", unfollowUser);
          btn.param = nom;
        }else{
          var btn = document.createElement("BUTTON");
          btn.id = nom
          btn.textContent = "Follow";  
          btn.style.height = "25px";
          btn.style.width = "70px"
          btn.style.backgroundColor = "#4286f4"
          btn.style.color = "white"
          
          btn.addEventListener("click", followUser);
          btn.param = nom;
        }
        
        let space = document.createElement("br");
  
        label.innerHTML += '  ';
        label.appendChild(btn);
        
        //document.querySelector("#label").append(photo);
        document.querySelector("#people").append(btn);
        document.querySelector("#people").append(label);
        document.querySelector("#people").append(space);
      }

    }
  })
  .catch(function(e) {
    console.error(e)
  })
} 


// Fi funció getAllUsers()

// Inici funció followUser() --> funció cridada al apretar el botó follow per tal de seguir un usuari.
function followUser(evt){
  let encType = "application/x-www-form-urlencoded" 
  let username = evt.target.param;
  let target = "/user/follow/" + username;
  let token = getCookie("token");

  superagent
  .put(basePath + target)
  .set('Content-Type', encType)
  .set('x-access-token', token)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    console.log("USUARI SEGUIT : ", username)
    var btn = document.getElementById(username);
    btn.style.backgroundColor = "#ed4921"
    btn.textContent = "Unfollow"
    btn.style.color = "white"
    btn.addEventListener("click", unfollowUser);
  })
  .catch(function(e) {
    console.error(e)
  })
} // Fi funció followUser()

// Inici funció unfollowUser() --> funció cridada al apretar el botó unfollow per tal de deixar de seguir un usuari.
function unfollowUser(evt){
  let encType = "application/x-www-form-urlencoded" 
  let username = evt.target.param;
  let target = "/user/unfollow/" + username;
  let token = getCookie("token");

  superagent
  .put(basePath + target)
  .set('Content-Type', encType)
  .set('x-access-token', token)
  .then(function(res) {
    console.log(JSON.stringify(res.body))
    console.log("USUARI DEIXAT DE SEGUIR: ", username)
    var btn = document.getElementById(username);
    btn.style.backgroundColor = "#4286f4"
    btn.textContent = "Follow"
    btn.addEventListener("click", followUser);

  })
  .catch(function(e) {
    console.error(e)
  })
} // Fi funció unfollowUser()


// Inici funció getProfileImage() --> entrat un email, retorna la foto de perfil de l'usuari amb l'email corresponent.
function getProfileImage(email, nom){
  let mail = email
  let name =  nom
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/profImg/"+mail;
  var fotoID = "";
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .then(function(res) {
    console.log("FOTO", JSON.stringify(res.body))
    let foto = res.body;
    fotoID = foto["profile_img"];
    var photo = document.createElement("img");

    if (fotoID.length == 0){
      photo.src = "Images/No-Profile.png";
      document.querySelector("#photo"+name).src = photo.src;
    }else{
      let source = basePath+"/image/"+fotoID
      photo.src = source;
      document.querySelector("#photo"+name).src = photo.src
    }
  })
  .catch(function(e) {
    console.error(e)
  })

} // Fi funció getProfileImage()


//Get Timeline
function getImageTimeLine(){
  let token = getCookie("token")
  let encType = "application/x-www-form-urlencoded"
  let target = "/user/timelineInfo"
  
  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', encType)
  //.set('Accept', 'application/json')
  //.send(data)
  .then(function(res) {
    let imgs = res.body.imgs;
    console.log(JSON.stringify(res.body));
    
    let ilen = imgs.length;
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
      
      var columna = '#columnaimagen' + ((l%4) +1)
      document.querySelector(columna).appendChild(d);
    }
    
  })
  .catch(function(e) {
    console.log("Error al cargar el TimeLine")
    console.error(e)
  })
}
//Fin Get Timenline

//CHAT

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


function logOut(){
  document.cookie = setCookie('token',"",-100);
  document.cookie = setCookie('username',"",100);

  window.location = "signin.html"
}