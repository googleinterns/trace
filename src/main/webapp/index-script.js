// Class Variables
var map;
/* Loades page and main buttons. */
function loadPage() {
    createMap();
    loadMainButtons();
}

/* Creates a map centered at the Googleplex! .*/
function createMap() {
  map = new google.maps.Map(
    document.getElementById('map'),
    {center: {lat: 37.422, lng: -122.0841}, zoom: 13,
    mapTypeControlOptions: {mapTypeIds: ['roadmap']}});

  // Create the initial InfoWindow.
  var infoWindow = new google.maps.InfoWindow(
      {content: 'Open javascript console (ctrl + shift + j) then click the map to see the placeIDs of nearby locations (within 50m)',
       position: {lat: 37.422, lng: -122.0841}});
  infoWindow.open(map);

  // Configure the click listener.
  map.addListener('click', function(mapsMouseEvent) {
    // Close the current InfoWindow.
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
      results.forEach((result)=> {
        var request = {
          placeId: result.place_id,
          fields: ['name']
        };
        service.getDetails(request, (place, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(place.name);
          }
        })
      });
      newInfoWindow(results, coordinate)
    }
  });
}

/* Temporary tool for debugging. */
function newInfoWindow(results, coordinate) {
  var ids = [];
  results.forEach((result) => {
      ids.push(result.place_id);
  });
  var infoWindow = new google.maps.InfoWindow(
      {content: ids.toString(),
       position: coordinate});
  infoWindow.open(map);
  createMap();
}

/* Activates functionality for search bar and log-in button. */
function loadMainButtons() {
  const clearIcon = document.querySelector(".clear-icon");
  const searchIcon = document.querySelector(".search-icon");
  const searchBar = document.querySelector(".search");
  const logInButton = document.querySelector("#logIn");

  searchBar.addEventListener("keyup", () => {
    if(searchBar.value && clearIcon.style.visibility != "visible"){
      clearIcon.style.visibility = "visible";
    } else if(!searchBar.value) {
      clearIcon.style.visibility = "hidden";
    }
  });

  clearIcon.addEventListener("click", () => {
    searchBar.value = "";
    clearIcon.style.visibility = "hidden";
  });

  searchIcon.addEventListener("click", () => {
    return; // TO-DO: Send search bar info to places API.
  });

  logInButton.addEventListener("click", () => {
    return; // TO-DO: Fetch log-in info here.
  });
}

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
      for (var i = 0; i < results.length; i++){
          // Populate the screen
      }

      // Center on the queried location
      if (results.length > 0) { 
        map.setCenter(results[0].geometry.location);
      }
    }
  });
}