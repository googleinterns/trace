/* Class Variables. */
var map;

/* Loads page and main buttons. */
function loadPage() {
    createMap();
    loadMainButtons();
    toggleLoginLogout();
}

/* Activates functionality for search bar and log-in button. */
function loadMainButtons() {
  const clearIcon = document.querySelector(".clear-icon");
  const searchIcon = document.querySelector("#search-icon");
  const searchForm = document.querySelector("#searchForm");
  const searchBar = document.querySelector(".search");
  const logInButton = document.querySelector("#login");
  const closeTutorial = document.querySelector("#exit");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  const tutorialText = document.getElementById("centralText");
  const modalClosers = document.querySelectorAll('[data-modal-close-button]');

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

  // Button to close the modal and deactiviate overlay
  modalClosers.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    })
  });
  
  logInButton.addEventListener("click", () => {
    window.location.href="/login" 
  }); 

  // Prevent page from refreshing when you submit the form
  searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
  });

  // Search by Text when enter is pressed 
  searchForm.addEventListener("keyup", function(event) {
    // 13 is the key code for 'Enter' 
    if (event.keyCode === 13) {
      var query = document.getElementById('searchForm').elements[0].value;
      searchByText(query);
    }
  });
}

// Chooses whether to display 'Login' or 'Logout' button.
function toggleLoginLogout(){
  const logInButton = document.querySelector("#login");
  fetch('/login').then(response => response.text()).then(data => {
    // Fetches the first line of the /login file and splits it based on the dot symbol.
    const split = data.split(".")[0];
    console.log(split);
    // If the split contains a user email, 
    // then a user is logged in and we can display the 'Logout' button
      if (split.length > 0){
        logInButton.innerHTML = logInButton.getAttribute("data-text-swap");
      } 
      // Otherwise, we know a user isn't logged in and the login button will stay as "Login"
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
function searchByText(textQuery) {
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
  
  var promises = [];
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

    // Creates a promise to return details from places api request.
    const promise = new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        }
      });
    });
    promises.push(promise);
    
  });
  // Waits on all promises to complete before passing the results into the next function.
  Promise.all(promises).then(places => {
    populateSearch(places); // Placeholder
  });
}

// Place-holder for function that fills out search results page.
function populateSearch(places) {
  places = sortPlacesByRating(places);
  console.log(places);
  triggerModal(document.getElementById("results-popup"));
  populateResults(places);
  
  console.log("Finished populating modal.");
}

/* Adds a field 'rating' to each place with a random integer to
 * simulate sorting locations by their ratings. */
function sortPlacesByRating(places) {
  places.forEach((place) => {
    let rand = Math.floor(Math.random() * 10);
    place.rating = rand;
  });
  places.sort((a, b) =>
    (a.rating > b.rating) ? 1 : -1);
  return places;
}

/* open modal function
 * This triggers the modal, and overlay, to follow the active CSS styling, making it appear.
 */
function triggerModal(modal) {
  console.log("Triggering modal.");
  if (modal == null) return;
  overlay.classList.add('active'); // Activates overlay opacity styling
  modal.classList.add('active'); // Makes modal appear by activating styling
}

/* close modal
 * Undoes the modal opening, by removing the active classifier.
 */
function closeModal(modal) {
  if (modal == null) return;
  overlay.classList.remove('active'); // Removes overlay and click blocker
  modal.classList.remove('active'); // Hides modal
  cleanModal(modal);
}

/* remove modal content function
 * Calls on closing of modal, wipes all results from inside of it.
 */
function cleanModal(modal) {
  const listContainer = document.getElementById('results-list');
  listContainer.innerHTML = ''; // Clean wrapper of all DOM elements
}

/* populate modal result list function
 * This function takes in an array of JS places
 * It creates an unorder list container to be populated
 */
function populateResults(places) {
  console.log('Populating results modal...');
  const listContainer = document.getElementById('results-list');
  const entireList = document.createElement('ul');
  places.forEach(place => {
    entireList.appendChild(generateResult(place));
  });
  listContainer.appendChild(entireList);
}

/* create result element function
 * This function takes in a JavaScript place object and populates a list entry of its information.
 *    ___________________________________
 *   |       |  Relevant information   |_|
 *   | icon  |  Relevant information   |_|
 *   |       |  Relevant information   |_|
 *   |_______|__Relevant information___|_|
 */
function generateResult(place) {
  const resultEntry = document.createElement('li');
  const resultGrid = document.createElement('div');
  resultGrid.className += 'result-grid';

  const imagePreview = document.createElement('div'); // Wrapper for icon
  imagePreview.className += 'prvw-img';
  const suggestedIcon = document.createElement('img');
  suggestedIcon.src = place.icon;
  imagePreview.appendChild(suggestedIcon);
  resultGrid.appendChild(imagePreview);
  const infoText = document.createElement('ul');
  
  // Relevant information to be displayed
  var tidbits = [
    place.name,
    place.international_phone_number,
    "<a href=\"" + place.website + "\">Site</a>",
    place.vicinity
  ];

  tidbits = tidbits.filter(function (element) {
    return element != null;
  });

  tidbits.forEach(fact => {
    const infoEntry = document.createElement('li');
    infoEntry.innerHTML = fact;
    infoText.appendChild(infoEntry);
  });

  resultGrid.appendChild(infoText);
  resultEntry.appendChild(resultGrid);
  return resultEntry;
}
