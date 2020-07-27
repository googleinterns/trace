
/* Class Variables. */
var map;

/* Loads page and main buttons. */
function loadPage() {
    createMap();
    loadMainButtons();
}

/* Activates functionality for search bar and log-in button. */
function loadMainButtons() {
  const clearIcon = document.querySelector(".clear-icon");
  const searchIcon = document.querySelector("#search-icon");
  const searchBar = document.querySelector(".search");

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

  // Search Icon registers clicks and searches for location.
  searchIcon.addEventListener("click", () => {
    var query = document.getElementById('searchForm').elements[0].value;
    searchByText(query);
  });
}

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
      handleSearchResults(results, service);
    }
  });
}

/* Search Places API for relevant locations using text query. */
function searchByText(textQuery){
  // Perform a query (hard-coded to be the Googleplex for right now)
  var request = {
      query: textQuery,
      fields: ['place_id', 'geometry']
  };

  var service = new google.maps.places.PlacesService(map);

  service.findPlaceFromQuery(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      handleSearchResults(results, service);
    }
  });
}

/* Accepts results from places query and returns array of details for nearby locations. */
function handleSearchResults(results, service) {
  // Center on the queried location
  if (results.length > 0) { 
    map.setCenter(results[0].geometry.location);
  }
  
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
        'international_phone_number',
        'website'
      ]
    };

    service.getDetails(request, (place, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        places.push(place);
        console.log(place);
      }
    });
  }).then(() =>  populateSearch(places));
}

function populateSearch(places) {
  console.log(places);
  console.log(places[0]);
  places.forEach((place) => {
    console.log('a');
    console.log(place.name);
  });
}