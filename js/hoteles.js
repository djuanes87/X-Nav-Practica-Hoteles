//var apiKey = 'AIzaSyBMw42rEkhXtqkV7d5v2zYm6qveV85q82c';
//var hotelactive;
var apiKey = 'AIzaSyB-5jim643xF_iFUYXphMRaiGyHCmK6rRk';
var mycollection;
var myassignations = [];

var save = false;
var load = false;

var accomodations;
var github;
var myrepo;

var checkLoadAccomodation = function(t){
  if(t == "savecol" ){
    if(mycollection == undefined){
      return false;
    }
  }
  if(accomodations == undefined){
    return false;
  }
  return true;
};

var checkUser = function(no, id){
  var p = get_accomodation(no).assignation;
  if(p == undefined){
    return false;
  }

  var nelem = p.length;
  for(i=0; i<nelem; i++){
    if(p[i].id == id){
      return true;
    }
  }
  return false;
};

var elementLista = function(no, name, src){
  return '<li no=' + no + '><div class="elem-lista">' +
  '<img class="mark" no="'+ no +'" src='+src+' onclick="show_mark('+no+')" />'+
  '<div class="acm" no="'+ no+'" onclick="show_accomodation('+no+')" >' + name + '</div>'+
  '</div></li>';
};

var loadStars = function(data){
  var text = "";
  try{
    var subcat = data.extradata.categorias.categoria
    .subcategorias.subcategoria.item[1]['#text'];
    if(subcat != null || subcat != undefined){
      text = text + ':  ';
      for(i=0; i<parseInt(subcat);i++){
        text = text + '<img src="images/estrella.gif" />';
      }
    }
  }catch(err) {
    text = "";
  }
  return text;
}

var loadDirection = function(data){
  var text = '<p><strong> ADDRESS: </strong>';
  text = text + data.address + ', '+data.subAdministrativeArea +
  ', ' + data.zipcode + ', '+data.country + '</p>';
  return text;
};

var accordionElement = function(name, hotels){
  var content = "<h3 name='"+name+"'>"+name+"</h3><div><ul>";
  var nhotels = hotels.length;
  for(k=0; k<nhotels; k++){
    var accomodation = get_accomodation(hotels[k]);
    var hname = accomodation.basicData.name;
    var hijo = parseInt(hotels[k]) + 1;
    var src = $("#lista li:nth-child("+ hijo +") img").attr("src");
    content = content + elementLista(hotels[k], hname, src);
  }
  content = content + "</ul></div>";
  return content;
};

var delProfile = function(no, iduser){
  var assignation = get_accomodation(no).assignation;
  var nelem = assignation.length;
  for(i=0; i<nelem; i++){
    if(assignation[i].id == iduser){
      var tag = "#" + assignation[i].id;
      assignation.splice(i,1);
      $(tag).remove();
      break;
    }
  }
};

var saveUser = function(resp, no){
  accomodation = get_accomodation(no);
  if(checkUser(no, resp.id))
    return "";
  var assignation = accomodation.assignation;
  if(assignation == undefined){
    assignation = [{'id':resp.id, 'name':resp.displayName,'img':resp.image.url}];
    myassignations.push(no);
  }else{
    var user = {'id':resp.id, 'name':resp.displayName,'img':resp.image.url};
    assignation.push(user);
  }
  accomodation.assignation = assignation;
  var content = '<div class="prof" id="'+ resp.id+'" ><h3>'+
  '<img class="delprof" src="images/close.png" onclick="delProfile('+no+', '+ resp.id+')" />'+
  '<img class="imgprof" src="'+resp.image.url+'" />'+resp.displayName+'</h3></div>';
  return content;
}

var createContainer = function(){
  $( "#collection" ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function( event, ui ) {
      if(!contentAccomodation(ui.draggable)){
        var no = ui.draggable.attr('no');
        var text = '<li no='+no+' ><img class="close" src="images/close.png" onclick="delSelect('+no+')" />';
        text = text + ui.draggable.html()+ '</li>';
        $("#collection ol").append(text);
      }
    }
  }).sortable({
    items: "li:not(.placeholder)",
    sort: function() {
      $( this ).removeClass( "ui-state-default" );
    }
  });
};

var show_map = function(){
  map = L.map('tabs-map').setView([40.4175, -3.708], 11);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

var get_accomodation = function (n){
  return accomodations[n];
}

//Mark and UnMark
function show_mark(no){
  var accomodation = get_accomodation(no);
  var lat = accomodation.geoData.latitude;
  var lon = accomodation.geoData.longitude;
  var name = accomodation.basicData.name;
  /*map.setView([lat, lon], 15); */

  var hijo = parseInt(no) + 1;
  var sel = "#lista li:nth-child("+ hijo +") img, #collection li img[no='"+no+"'],"
  + "#accordion li img[no='"+no+"']";
  var img = $(sel).attr("src");
  if(img == "images/mrojo1.png"){
      var textmark = '<p onclick="show_accomodation('+no+')">' + name + '</p>';
      textmark = textmark + "<input type='button' class='popup' no='"+no+"' value='Unmark' onclick='show_mark("+no+")'/>";
      var mark = L.marker([lat, lon]);
	    mark.bindPopup(textmark);
      mark.addTo(map);
      map.setView([lat, lon], 15);
      mark.openPopup();
      accomodation.marker = mark;
      $(sel).attr("src", "images/mverde1.png");
    }else{
      var mark = accomodation.marker;
      map.removeLayer(mark);
      $(sel).attr("src", "images/mrojo1.png");
    }
};

//GITHUB
var user;
var reponame;
var filename;

var initForm = function(f){
  save = false;
  load = false;
  user = "";
  reponame = "";
  filename = "";
  if(f == "col"){
    $("#forminitcol").show();
    $("#formtokencol").hide();
    $("#formendcol").hide();
  }else{
    $("#forminitprofs").show();
    $("#formtokenprofs").hide();
    $("#formendprofs").hide();
  }
}

var showForm = function(v, h){
  var vis = "#"+v;
  var hid = "#"+h;
  $(vis).hide();
  $(hid).show();
}

var getToken = function (v, h, f) {
    var token;
    if(f == "col"){
      token = $("#tokencol").val();
      $("#tokencol").val("");
    }else{
      token = $("#tokenprofs").val();
      $("#tokenprofs").val("");
    }
    if(token.length < 40){
      return;
    }
    github = new Github({
        token: token,
	      auth: "oauth"
      });
    showForm(v, h);
};

var getFileSave = function(s){
  if(s == "col"){
    return JSON.stringify(mycollection);
  }else if(s == "profs"){
    var asidata = {"asgt":[]};
    var nelem = myassignations.length;
    for(i=0; i<nelem; i++){
      var accomodation = get_accomodation(myassignations[i]);
      var elem = {"no":myassignations[i], "profiles":accomodation.assignation};
      asidata.asgt.push(elem);
    }
    return JSON.stringify(asidata);
  }else{
    null;
  }
};

var readData = function(s, file){
  var objdata = JSON.parse(file);
  if(s == "col"){
    loadCollections(objdata);
  }else if(s == "profs"){
    loadProfiles(objdata);
  }else{
    null;
  }
}

function getRepo(s) {
  if(s == "col"){
    user = $("#usercol").val();
    reponame = $("#repocol").val();
    filename = $("#filecol").val();
    $("#usercol").val("");
    $("#repocol").val("");
    $("#filecol").val("");
  }else{
    user = $("#userprofs").val();
    reponame = $("#repoprofs").val();
    filename = $("#fileprofs").val();
    $("#userprofs").val("");
    $("#repoprofs").val("");
    $("#fileprofs").val("");
  }
    myrepo = github.getRepo(user, reponame);
    if(save){
      var datafile = getFileSave(s);
      myrepo.write('master', filename,
		    datafile, "Updating data", function(err) {
		    });
    }
    if(load){
      myrepo.read('master', filename, function(err, data) {
      	if(data != null){
          readData(s, data);
        }
      });
    }
    initForm(s);
};

var loadCollections = function(data){

  if(data.clts == undefined){
    return;
  }
  mycollections = data;
  clts = data.clts;
  var ncol = clts.length;
  var contaccordeon = "";
  for(i=0; i<ncol; i++){
    contaccordeon = contaccordeon + accordionElement(clts[i].name, clts[i].hotels);
  }
  $("#accordion").accordion( "destroy" );
  $("#accordion").html(contaccordeon);
  $("#accordion").accordion({collapsible: true, active: false});
  $("#accordion h3").click(show_marks_collection);

}

var loadProfiles = function(data){
  if(data.asgt == undefined){
    return;
  }
  asgt = data.asgt;
  var ncol = asgt.length;
  for(i=0; i<ncol; i++){
    var no = asgt[i].no;
    var accomodation = get_accomodation(no);
    if(accomodation.assignation == undefined){
      accomodation.assignation = asgt[i].profiles;
      myassignations.push(no);
    }else{
      var np = asgt[i].profiles.length;
      for(k=0; k<np; k++){
        var profile = asgt[i].profiles[k];
        if(!checkUser(asgt[i].no, profile.id)){
          accomodation.assignation.push(profile);
        }
      }
    }
  }
};


var loadCarousel = function(multimedia){
  if(multimedia == null){
    return null;
  }
  images = multimedia.media;
  var nimg = images.length;
  if(nimg == undefined){
    return null;
  }
  var text = '<div id="carousel" class="carousel slide" data-ride="carousel">';
  text = text + '<ol class="carousel-indicators">';
  for(i = 0; i < nimg; i++){
    if(i == 0){
      text = text + '<li data-target="#carousel" data-slide-to="'+ i +'" class="active"></li>';
    }else{
      text = text + '<li data-target="#carousel" data-slide-to="'+ i +'" ></li>';
    }
  }
  text = text + '</ol>';
  text = text + '<div class="carousel-inner" role="listbox">';
  text = text + '<div class="item active">';
  text = text + '<img src="'+ images[0].url+'">';
  text = text + '<div class="carousel-caption"></div></div>';

  for(i=1; i<nimg; i++){
    text = text + '<div class="item">';
    text = text + '<img src="'+ images[i].url+'">';
    text = text + '<div class="carousel-caption"></div></div>';
  }
  text = text + '</div>';
  text = text +
  '<a class="left carousel-control" href="#carousel" role="button" data-slide="prev">'+
  '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'+
  '<span class="sr-only">Previous</span></a>'+
  '<a class="right carousel-control" href="#carousel" role="button" data-slide="next">'+
  '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'+
  '<span class="sr-only">Next</span></a></div>';

  return text;

};

var loadPeople = function(data, no){
  people = data.assignation;
  if(people == undefined)
    return null;
  var content = "";
  console.log(people);
  for(i=0; i < people.length; i++){
    content =  content +'<div class="prof" id="'+ people[i].id+'" ><h3>'+
    '<img class="delprof" src="images/close.png" onclick="delProfile('+no+', '+ people[i].id+')" />'+
    '<img class="imgprof" src="'+people[i].img+'" />'+people[i].name+'</h3></div>';
  }
  return content;
}

var loadUser = function(){
  var no = hotelactive;
  var iduser = $("#iduser").val();

  gapi.client.setApiKey(apiKey);

  if(checkUser(no, iduser)){
    return;
  }

  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': iduser
    });
    request.execute(function(resp) {
      var content = saveUser(resp, no);
      $('#people').append(content);
    });
  });
};

function show_accomodation(no){
  hotelactive = no;
  var accomodation = get_accomodation(no);
  var car = loadCarousel(accomodation.multimedia);
  var url = accomodation.basicData.web;
  var name = accomodation.basicData.name;
  var desc = accomodation.basicData.body;
  var cat = accomodation.extradata.categorias.categoria.item[1]['#text'];
  var people = loadPeople(accomodation, no);
  var content = '<h2>' + name + '</h2><p>';
  if(cat != null || cat != undefined){
    content = content + '<strong>'+ cat + '</strong>';
  }
  content = content + loadStars(accomodation);
  content = content + '</p>';
  content = content + loadDirection(accomodation.geoData);
  if(desc != null || desc != undefined){
    content = content + desc;
  }
   if(car != null){
     content = content +'<p class="descriptions">' + car + '</p>';
   }
   content = content + '<section id="people"> <h3> <span class="label label-success" > PEOPLE ASIGNED </span></h3>';
   content = content + '<form>ID USER<input type="text" id="iduser" />'+
   "<input type='button' value='ADD USER' onclick='loadUser()' /></form>";
   if(people != null){
     content = content + people;

   }
   content = content + '</section>';
   initForm("profs");
  $('#info-hotel').html(content);
  $('.carousel').carousel();
  $( "#tabs" ).tabs( "option", "active", 2);
};

function show_list = function(){
  var list ="";
  list = list + '<ul id="gallery">'
  for (var i = 0; i < accomodations.length; i++) {
    list = list + elementLista(i, accomodations[i].basicData.title, "images/mrojo1.png");
  }
  list = list + '</ul>';
  $('#lista').html(list);

  $( "#lista li" ).draggable({
    appendTo: "body",
    helper: "clone"
  });
}

function get_accomodations(){
  $("#loadlist").hide();
  if (Modernizr.localstorage) {
    accomodations = localStorage.getItem("hotels");
    console.log(accomodations);
  }
  if(accomodations == undefined || accomodations == null){
    $.getJSON("json/alojamientos.json", function(data){
      accomodations = data.serviceList.service;
      localStorage.setItem("hotels", accomodations);
    });
  }
  show_list();

};

var delSelect = function(no){
  $("#collection li[no='"+no+"']").remove();
};

var delClear = function(){
  $("#collection ol").html("");
}

var contentAccomodation = function(data){
  var val = data.attr('no');
  var name = $("#collection li[no='"+val+"']").text();
  var content = $("#collection li[no='"+val+"']").attr('no');

  if(name == undefined || content == undefined){
    return false;
  }
  return true;
};

var addCollection = function(name, data){
  var i = 0;
  var hotels = [];
  while(true){
    var val = data[i];
    if(val == undefined){
      break;
    }
    val = val.attributes[0].value;
    hotels.push(val);
    i++;
  }
  if(mycollection == undefined){
    mycollection = {"clts":[{"name":name, "hotels":hotels}]};
  }else{
    var col = {"name":name, "hotels":hotels};
    mycollection.clts.push(col);
  }
}

var create_Collection = function(){
  var text = "";
  var empty = false;
  var name = $("#name_collection").val();
  if(name.length == 0 || name == undefined || name == null){
    return;
  }
  if($("#yourcollections h3[name='"+name+"']").text() != ""){
    return;
  }

  text = "<h3 name='"+name+"'>"+name+"</h3><div><ul>";
  while(!empty){
    var val = $("#collection ol li .close").html();
    if(val == undefined || val == null){
      empty = true;
    }else{
      $("#collection ol li .close").remove();
    }
  }
  addCollection(name, $("#collection ol li"));
  var val = $("#collection ol").html();
  $("#collection ol").html("");
  text = text + val +"</ul></div>";

  $("#accordion").accordion( "destroy" );
  $("#accordion").append(text);
  $("#accordion").accordion({collapsible: true, active: false});
  $("#accordion h3").click(show_marks_collection);
}

$(document).ready(function() {
  $("#tabs").tabs();
  show_map();
  createContainer();
  $("#loadlist").click(get_accomodations);
  $("#create").click(create_Collection);
  $("#clear").click(delClear);
  $("#accordion").accordion({collapsible: true, active: false});
  $("#tabs ul li:nth-child(2)").click(function(){initForm("col");});
  $("#tabs ul li:nth-child(3)").click(function(){initForm("profs");});

  //Buttons Github Collections
  $("#saveclts").click(function(){
    if(!checkLoadAccomodation("savecol"))
      return;
    save = true;
    showForm("forminitcol", "formtokencol");
  });
  $("#loadclts").click(function(){
    if(!checkLoadAccomodation())
      return;
    load = true;
    showForm("forminitcol", "formtokencol");
  });
  $("#gettokencol").click(function(){getToken("formtokencol", "formendcol", "col");})
  $("#acceptcol").click(function(){getRepo("col");})

  //Buttons Github Assignation Profiles;
  $("#saveprofs").click(function(){
    if(!checkLoadAccomodation("saveprofs"))
      return;
    save = true;
    showForm("forminitprofs", "formtokenprofs");
  });
  $("#loadprofs").click(function(){
    if(!checkLoadAccomodation())
      return;
    load = true;
    showForm("forminitprofs", "formtokenprofs");
  });
  $("#gettokenprofs").click(function(){getToken("formtokenprofs", "formendprofs", "profs");})
  $("#acceptprofs").click(function(){getRepo("profs");})

});
