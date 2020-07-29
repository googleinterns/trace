// Class Variables
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
  const logInButton = document.querySelector("#logIn");
  const closeTutorial = document.querySelector("#exit");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  const tutorialText = document.getElementById("centralText");

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
  
  // Stub for previous button.
  prev.addEventListener("click", function prevClick() {
    tutorialText.innerHTML = "This button will take you to the previous page.";
  });

  // Stub for next button.
  next.addEventListener("click", function nextClick() {
    tutorialText.innerHTML = "This button will take you to the next page.";
  });

  // Close tutorial window on exit click. Remove popUp listeners.
  closeTutorial.addEventListener("click", function close() {
    document.getElementById("popUp").style.display = "none";
    prev.removeEventListener("click", prevClick);
    next.removeEventListener("click", nextClick);
    closeTutorial.removeEventListener("click", close);
  });
  
  logInButton.addEventListener("click", () => {
    window.location.href = "/login"
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

// Search using text query
function searchByText(textQuery){
  // Create the places service.

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

// Takes the results from a given search and prints them to the console
function handleSearchResults(results, service) {
  results.forEach((result)=> {
    var request = {
      placeId: result.place_id,
      fields: ['name']
    };
    // Finds the exact details about the place
    service.getDetails(request, (place, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        console.log(place.name);
      }
    })
  });

  // Center on the queried location
  if (results.length > 0) { 
    map.setCenter(results[0].geometry.location);
  }
}

/* init() function
 * Collects the button objects on the page and populates them with relevenat action events.
 */
function setupModalButtons() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalClosers = document.querySelectorAll('[data-modal-close-button]');
  
  modalTriggers.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      triggerModal(modal);
    })
  })
  modalClosers.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    })
  })
}

/* open modal function
 * This triggers the modal, and overlay, to follow the active CSS styling, making it appear.
 */
function triggerModal(modal) {
  if (modal == null) return;
  overlay.classList.add('active');
  modal.classList.add('active');
}

/* close modal
 * Undoes the modal opening, by removing the active classifier.
 */
function closeModal(modal) {
  if (modal == null) return;
  overlay.classList.remove('active');
  modal.classList.remove('active');
}

/* populate modal result list function
 * This function takes in an array of JS places
 * It creates an unorder list container to be populated
 */
function populateResults(placesArray) {
  console.log('Populating results modal...');
  const listContainer = document.getElementById('results-list');
  const entireList = document.createElement('ul');
  places.forEach(place, () => {
    entireList.appendChild(generateResult(place));
  });
}

/* create result element function
 * This function takes in a JavaScript place object and populates a list entry of its information.
 *    ___________result Grid_____________
 *   |       |  Relevant information   |_|
 *   | icon  |  Relevant information   |_|
 *   |       |  Relevant information   |_|
 *   |_______|__Relevant information   |_|
 */
function generateResult(place) {
  const resultGrid = document.createElement('div');
  resultGrid.className += 'result-grid';

  const imagePreview = document.createElement('div');
  imagePreview.className += 'prvw-img';
  const suggestedIcon = document.createElement('icon');
  suggestedIcon.innerHTML = place.icon;
  imagePreview.appendChild(suggestedIcon);
  resultGrid.appendChild(imagePreivew);

  const infoText = document.createElement('ul');
  places.forEach(tidbit, () => {
    const infoEntry = document.createElement('li');
    infoEntry.innerHTML = tidbit;
    infoText.appendChild(infoEntry);
  });

  resultGrid.appendChild(infoText);
}