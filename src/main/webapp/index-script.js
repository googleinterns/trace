
// Creates a map centered at the Googleplex
function createMap() {
  // Initialize the map!
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
}