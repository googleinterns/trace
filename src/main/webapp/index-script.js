// Class Variables
<<<<<<< HEAD
const map;

=======
var map;
/* Loads page and main buttons. */
>>>>>>> 7c5d1483561ca584bd49c9e5260e5c2409eb2ddf
function loadPage() {
    createMap();
    loadMainButtons();
}

<<<<<<< HEAD
// Creates a map centered at the Googleplex!
function createMap() {
  map = new google.maps.Map(
    document.getElementById('map'),
    {center: {lat: 37.422, lng: -122.0841}, zoom: 13, mapTypeId: 'satellite'}); 
}

// Activates functionality for search bar and log-in button.
=======
/* Activates functionality for search bar and log-in button. */
>>>>>>> 7c5d1483561ca584bd49c9e5260e5c2409eb2ddf
function loadMainButtons() {
  const clearIcon = document.querySelector(".clear-icon");
  const searchIcon = document.querySelector(".search-icon");
  const searchBar = document.querySelector(".search");
  const logInButton = document.querySelector("#logIn");

  // Make 'clear-icon' visible when user starts typing.
  searchBar.addEventListener("keyup", () => {
    if(searchBar.value && clearIcon.style.visibility != "visible"){
      clearIcon.style.visibility = "visible";
    } else if(!searchBar.value) {
      clearIcon.style.visibility = "hidden";
    }
  });

  // Delete text and hide 'clear-icon' on click.
  clearIcon.addEventListener("click", () => {
    searchBar.value = "";
    clearIcon.style.visibility = "hidden";
  });

  searchIcon.addEventListener("click", () => {
    return; // TO-DO: Send search bar info to places API.
  });
}

<<<<<<< HEAD
=======
/* Creates a map centered at the Googleplex! .*/
function createMap() {
  const googleplex = {lat: 37.422, lng: -122.0841};
  map = new google.maps.Map(
    document.getElementById('map'),
    {center: googleplex, zoom: 13,
    mapTypeControlOptions: {mapTypeIds: ['roadmap']}});

  // Create the initial InfoWindow.
  var infoWindow = new google.maps.InfoWindow(
      {content: 'Open javascript console (ctrl + shift + j) then click the map to see the placeIDs of nearby locations (within 50m)',
       position: googleplex});
  infoWindow.open(map);

  // Search by coordinates on map click.
  map.addListener('click', function(mapsMouseEvent) {
    infoWindow.close();
    searchByCoordinates(mapsMouseEvent.latLng);
  });
}

/* Takes coordinates from mouseclick and searches for locations within a given radius of those coordinates. */
function searchByCoordinates(coordinate) {
  var request = {
    location: coordinate,
    radius: '50',
    rankBy: google.maps.places.RankBy.PROMINENCE
  };

  var service = new google.maps.places.PlacesService(map);
  // Print resulting IDs to log.
  service.nearbySearch(request, (results, status) => {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        handleSearchResults(results);
    }
  });
}

>>>>>>> 7c5d1483561ca584bd49c9e5260e5c2409eb2ddf
// Search using text query
function searchByText(){
  // Create the places service.
  const service = new google.maps.places.PlacesService(map);
  
  // Perform a query (hard-coded to be the Googleplex for right now)
  var request = {
      query: 'Googleplex',
      radius: '1000',
      fields: ['place_id', 'geometry']
  }

  service.findPlaceFromQuery(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      handleSearchResults(results);
    }
  });
}

/* Accepts results from places query and returns array of details for nearby locations. */
function handleSearchResults(results) {
  // Center on the queried location
  if (results.length > 0) { 
    map.setCenter(results[0].geometry.location);
  }
  // Create the places service.
  const service = new google.maps.places.PlacesService(map);
  
  var places = [];
  results.forEach((result)=> {
    var request = {
      placeId: result.place_id,
      fields: [
        'name',
        'vicinity',
        'reviews',
        'place_id',
        'opening_hours',
        'geometry',
        'icon',
        'name',
        'international_phone_number'
      ]
    };

    service.getDetails(request, (place, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        places.push(place);
      }
    });
  });
  return places;

}