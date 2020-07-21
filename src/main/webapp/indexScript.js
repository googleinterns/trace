function createMap() {
  const map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: 37.422, lng: 122.0841}, zoom: 13, mapTypeId: 'satellite'}); 
  var infoWindow = new google.maps.InfoWindow({});
}