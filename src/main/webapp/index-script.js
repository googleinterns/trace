function loadPage() {
    createMap();
    loadMainButtons();
}

// Creates a map centered at the Googleplex
function createMap() {
  const map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: 37.422, lng: -122.0841}, zoom: 13, mapTypeId: 'satellite'}); 
}
/*  // Initialize the map!
  const googleplex = {lat: 37.422, lng: -122.0841};
  const map = new google.maps.Map(document.getElementById("map"), {
    center: googleplex,
    zoom: 13
  });

  // Create the places service.
  const service = new google.maps.places.PlacesService(map);
  
  // Perform a nearby search.
  service.nearbySearch(
    { location: googleplex, radius: 500, type: "food" },
    (results, status, pagination) => {
      if (status !== "OK") return;
      createMarkers(results, map);
    }
  );
*/

// Activates functionality for search bar and log-in button.
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