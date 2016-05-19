//var apiKey = 'AIzaSyBMw42rEkhXtqkV7d5v2zYm6qveV85q82c';
//var hotelactive;
var apiKey = 'AIzaSyB-5jim643xF_iFUYXphMRaiGyHCmK6rRk';

var github;
var myrepo;

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

var delProfile = function(no, iduser){
  var assignation = get_accomodation(no).assignation;
  var nelem = assignation.length;
  for(i=0; i<nelem; i++){
    if(assignation[i].id == iduser){
      var tag = "#" + assignation[i].id;
      console.log("ELIMINA");
      assignation.splice(i,1);
      console.log(tag);
      console.log(iduser);
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
  }else{
    var user = {'id':resp.id, 'name':resp.displayName,'img':resp.image.url};
    assignation.push(user);
  }
  console.log(resp.id);
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
        text = text + ui.draggable.html() + '</li>';
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
  var url = accomodation.basicData.web;
  /*map.setView([lat, lon], 15); */

  var hijo = parseInt(no) + 1;
  var sel = "#lista li:nth-child("+ hijo +") img, #collection li img[no='"+no+"'],"
  + "#accordion li img[no='"+no+"']";
  var img = $(sel).attr("src");
  if(img == "images/mrojo1.png"){
      var textmark = '<a href="' + url + '">' + name + '</a><br/>';
      textmark = textmark + "<input type='button' class='popup' no='"+no+"' value='Unmark' onclick='show_mark("+no+")'/>";
      var mark = L.marker([lat, lon]);
	    mark.bindPopup(textmark);
      mark.addTo(map);
      mark.openPopup();
      accomodation.marker = mark;
      $(sel).attr("src", "images/mverde1.png");
    }else{
      var mark = accomodation.marker;
      map.removeLayer(mark);
      $(sel).attr("src", "images/mrojo1.png");
    }
};

//INCOMPLETE
var show_marks_collection = function(){
  var name = $(this).attr("name");
  //  $("#accordion h3[name="'+name+'"] > div").
  //console.log(name);
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
  var subcat = accomodation.extradata.categorias.categoria
   .subcategorias.subcategoria.item[1]['#text'];
  var people = loadPeople(accomodation, no);

  var content = '<h2>' + name + '</h2>'
   + '<p>Type: ' + cat + ', subtype: ' + subcat + '</p>'
   + desc;
   if(car != null){
     content = content + car;
   }
   content = content + '<div id="people">';
   content = content + '<form>ID USER<input type="text" id="iduser" />'+
   "<input type='button' value='ADD USER' onclick='loadUser()' /></form>";
   if(people != null){
     content = content + people;
   }
   content = content + '</div>';
  $('#tabs-infohotel').html(content);
  $('.carousel').carousel();
  $( "#tabs" ).tabs( "option", "active", 2);
};

function get_accomodations(){
  $("#loadlist").hide();
  $.getJSON("json/alojamientos.json", function(data){
    accomodations = data.serviceList.service;
    var list ="";
    list = list + '<ul id="gallery">'
    for (var i = 0; i < accomodations.length; i++) {
      list = list + '<li no=' + i + '><div class="elem-lista">';
      list = list + '<img class="mark" no="'+ i +'" src="images/mrojo1.png" onclick="show_mark('+i+')" />';
      list = list +"<div class='acm' no='"+ i +"' onclick='show_accomodation("+i+")' >" + accomodations[i].basicData.title + "</div>";
      list = list + '</div></li>';
    }
    list = list + '</ul>';
    $('#lista').html(list);

    $( "#lista li" ).draggable({
      appendTo: "body",
      helper: "clone"
    });
  });
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

  var github

function getToken(){
  var token = $("#tokenBox").val()
  $("#tokenBox").hide()
  $("#repoBox").show()
  $("#userBox").show()

  github = new Github({
    token: token,
    auth: "oauth"
  });
}

function getRepo(){
  var repodata = $("#repodata")
  var repo = github.getRepo($("#userBox").val(), $("#repoBox").val());
  repo.write('master', 'ficherito', 'GITHUB API', 'GITHUB', function(err) {});
  repo.show(function(err, repo) {
    if(err){
      repodata.html("<p>Error: " + err.error + "</p>")
    }else{

      repodata.html("<p>Repo data:</p>" +
          "<ul><li>Full name: " + repo.full_name + "</li>" +
          "<li>Description: " + repo.description + "</li>" +
          "<li>Created at: " + repo.created_at + "</li>" +
          "</ul>");
    }
  });
}

$(document).ready(function(){


  $("#submitBtn").click(function(){
    if ($("#tokenBox").is(":visible")){
      getToken()
    }else{
      getRepo()
    }
  })

})

});
