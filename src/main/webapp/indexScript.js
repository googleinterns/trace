function createMap() {
  const map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: 47.5667, lng: -122.3868}, zoom: 13, mapTypeId: 'satellite'}); 
  var infoWindow = new google.maps.InfoWindow({});
}