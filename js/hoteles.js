$(document).ready(function(){
  $( "#tabs" ).tabs();
  mymap = L.map('tabs-map');

  mymap.locate({setView: true, maxZoom: 16});

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);
});
