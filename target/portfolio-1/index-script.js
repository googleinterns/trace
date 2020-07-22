
// Creates a map centered at the Googleplex!
function createMap() {
  const map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: 37.422, lng: -122.0841}, zoom: 13, mapTypeId: 'satellite'}); 
}