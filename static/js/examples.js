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

/* 
Inici funció getAllUsers() --> Aquesta funció es crida des de l'HTML per tal de carregar els usuaris ja registrats.
Es fa una consulta per tal de saber tots els usuaris disponibles, es comprova si ja es segueixen o no i en funció 
d'aixó apareixerà un botó de follow o unfollow, així com mostrar el nom de cada usuari i la seva foto de perfil.
*/
function getAllUsers(){
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/all"
  let actualUser = getCookie("username")
  let following = myFollows();
  console.log("ESTIC SEGUINT: ", following);
  console.log("ESTIC SEGUINT[0]: ", following.indexOf(0));

  
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
        console.log("NOM: ", nom);
        console.log("includes??: ", following.includes(nom));
        console.log("ESTAT ACTUAL DE FOLLOWING ", following);

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
} // Fi funció getAllUsers()

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

// Inici funció myFollows() --> retorna un array amb els noms de tots els usuaris als qui segueix l'usuari loguejat actualment.
function myFollows(){
  let token = getCookie("token")
  console.log("TOKEN ACTUAL!", token)
  let encType = "application/x-www-form-urlencoded" 
  let target = "/user/myFollows";
  let follows = []

  superagent
  .get(basePath + target)
  .set('x-access-token', token)
  .set('Content-Type', )
  .then(function(res) {
    console.log("CORRECTE", JSON.stringify(res.body))
    var mails = res.body;
    var nom = "";
    for (let i = 0; i < mails["mails"].length; i++){
      nom = mails["mails"][i];
      nom = nom.split("@");
      nom = nom[0]
      follows.push(nom)
    }    
    console.log("DES DE SUPERAGENT")
  })
  .catch(function(e) {
    console.error(e)
  })
  console.log("DES DE RETURN")
  return follows;
} // Fi funció myFollows()

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