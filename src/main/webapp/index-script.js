/* Class Variables. */
var map;
var currentLocation = "newID";

/* Loads page and main buttons. */
function loadPage() {
    loadMainButtons();
    createMap();
    toggleLoginLogout();
}

/* Activates functionality for search bar and log-in button. */
function loadMainButtons() {
  activateSearchBar();
  activateTutorial();

  const logInButton = document.querySelector("#login");
  // Calls login servlet onclick.
  logInButton.addEventListener("click", () => {
    window.location.href = "/login";
  }); 

  const modalClosers = document.querySelectorAll('[data-modal-close-button]');
  // Button to close the modal and deactiviate overlay
  modalClosers.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
  });
  
  const modalBackArrow = document.getElementById("modal-backarrow");
  // Hide reviews page and display results page.
  modalBackArrow.addEventListener("click", () => {
    hideBackArrow();
    document.getElementById('results-body').style.display = "block"; // Display results page.
    document.getElementById('reviews-body').style.display = "none"; // Hide reviews page.
    document.getElementById('reviews-list-container').innerHTML = ''; // Clean reviews wrapper of all DOM elements;
    document.getElementById('rev-form-body').style.display = "none";
  });
}

/* Adds mouse listeners to searchBar-related html items. */
function activateSearchBar() {
  const searchIcon = document.querySelector("#search-icon");
  const searchBar = document.querySelector(".search");
  const searchForm = document.querySelector("#searchForm");
  const clearIcon = document.querySelector(".clear-icon");

  // Make 'clear-icon' visible when user starts typing.
  searchBar.addEventListener("keyup", () => {
    if(searchBar.value && clearIcon.style.display != "block"){
      clearIcon.style.display = "block";
    } else if(!searchBar.value) {
      clearIcon.style.display = "none";
    }
  });

  // Delete text and hide 'clear-icon' on click.
  clearIcon.addEventListener("click", () => {
    searchBar.value = "";
    clearIcon.style.display = "none";
  });

  // Search Icon registers clicks and searches for location.
  searchIcon.addEventListener("click", () => {
    var query = document.getElementById('searchForm').elements[0].value;
    var location = document.getElementById('searchForm').elements[1].value;
    searchByText(query, location);
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
      var location = document.getElementById('searchForm').elements[1].value;
      searchByText(query, location);
    }
  });
}

/* Adds mouse listeners to tutorial-related html items. */
function activateTutorial() {
  const closeTutorial = document.querySelector("#exit");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  const tutorialText = document.getElementById("centralText");

  // Stub for previous button.
  prev.addEventListener("click", () => {
    tutorialText.innerHTML = "This button will take you to the previous page.";
  });

  // Stub for next button.
  next.addEventListener("click", () => {
    tutorialText.innerHTML = "This button will take you to the next page.";
  });

  // Close tutorial window on exit click. Remove popUp listeners.
  closeTutorial.addEventListener("click", function close() {
    document.getElementById("popUp").style.display = "none";
    closeTutorial.removeEventListener("click", close);
  });
}

/* close modal
 * Undoes the modal opening, by removing the active classifier.
 */
function closeModal(modal) {
  if (modal == null) return;
  overlay.classList.remove('active'); // Removes overlay and click blocker
  modal.classList.remove('active'); // Hides modal

  // Clean reviews and results.
  document.querySelectorAll('.list').forEach((item) => {
    item.innerHTML = "";
  });
  // Hide modal content.
  document.querySelectorAll('.modal-body').forEach((item) => {
    item.style.display = "none";
  });
  hideBackArrow();
}

/** Hide modal-backarrow. */
function hideBackArrow() {
  const button = document.getElementById("modal-backarrow");
  button.innerHTML = '';
  button.style.display = "none";
}

// Chooses whether to display 'Login' or 'Logout' button.
function toggleLoginLogout(){
  const logInButton = document.querySelector("#login");
  fetch('/login').then(response => response.text()).then(data => {
    // Fetches the first line of the /login file and splits it based on the dot symbol.
    const split = data.split(".")[0];
    // If the split contains a user email, 
    // then a user is logged in and we can display the 'Logout' button
      if (split.length > 0){
        logInButton.innerHTML = logInButton.getAttribute("data-text-swap");
      } else {     
        // If a user is not logged in, also display the tutorial
        document.getElementById("popUp").style.display = "block";
      }
  });
}

/* Creates a map centered at the Googleplex! .*/
function createMap() {
  const googleplex = {lat: 37.422, lng: -122.0841};
  map = new google.maps.Map(
    document.getElementById('map'),
    {center: googleplex, zoom: 13,
    mapTypeControlOptions: {mapTypeIds: ['roadmap']}});

  // Checks to see if browser has enabled location sharing.
  if (navigator.geolocation) {
    // If so, sets the center of the map at the user's current position. 
    navigator.geolocation.getCurrentPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
      }
    );
  }

  // initializeHeatMap(map);

  // Search by coordinates on map click.
  map.addListener('click', function(mapsMouseEvent) {
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
function searchByText(textQuery, textLocation) {
  // Get the coordinates of a requested location. 
  const locationPromise = new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': textLocation}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        resolve(new google.maps.LatLng(latitude, longitude));
      } else {
        // If no location given, defaults to your cookie-d location.
        resolve();
      }
    });
  }); 
 
  // Waits for location to be chosen, then runs search
  locationPromise.then((locationRequest) => {
    var request = {
      query: textQuery,
      location: locationRequest,
      fields: ['place_id', 'geometry']
    };
 
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, (results, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        handleSearchResults(results, service);
      }
    });
  });
}

/* Accepts results from places query and returns array of details for nearby locations. */
function handleSearchResults(results, service) {
  // Center on the queried location
  if (results.length > 0) { 
    map.setCenter(results[0].geometry.location);
  }
  
  var promises = [];

  // Modal can handle up to 9 results only
  for (var i = 0; i < 9; i++) {
    if (results[i] == null){
        break;
    } else {
      var request = {
        placeId: results[i].place_id,
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
    }

    // Creates a promise to return details from places api request.
    const promise = new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        }
      });
    });
    promises.push(promise);
    
  };
  // Waits on all promises to complete before passing the results into the next function.
  Promise.all(promises).then(places => {
    populateSearch(places); // Placeholder
  });
}

/* Fills out search results page. */
function populateSearch(places) {
  places = sortPlacesByRating(places);
  triggerModal(document.getElementById("results-popup"));
  populateResults(places);
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

/* Triggers the modal, and overlay, to follow the active CSS styling, making it appear. */
function triggerModal(modal) {
  if (modal == null) return;
  overlay.classList.add('active');
  modal.classList.add('active');
  document.getElementById('results-body').style.display = "block";
  document.getElementById("modal-backarrow").style.display = "none";
}

/* This function takes in an array of JS places and creates an unordered
 * list container to be populated. */
function populateResults(places) {
  const listContainer = document.getElementById('results-list-container');
  const entireList = document.createElement('ul'); // Results ul
  entireList.id += "results-list";
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
  const infoText = document.createElement('ul'); // Tidbits ul
  
  // Relevant information to be displayed
  var tidbits = [
    "<a onclick=\"showReviews(\'" + place.place_id + "\');\">" + place.name + "</a>",
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

/** Pseudomaster Review Function
 * One central function that is called to trigger entire review interface
 */
function showReviews(placeID) {
  fetchReviews(placeID);
  displayReviewModal();
}

/**
 * Review modal activation function
 */
function displayReviewModal() {
  const button = document.getElementById('modal-backarrow');
  button.classList.add("exit-button");
  button.innerHTML += "&larr;";

  document.getElementById("modal-backarrow").style.display = "block";
  document.getElementById('results-body').style.display = "none";
  document.getElementById('reviews-body').style.display = "block";
}

/** Fetch Reviews
 * Queries ReviewServlet with elementID// Comment object gets it's datastore id. 
    comment.setId(reviewEntity.getKey().getId()); to find internal datastore
 */
function fetchReviews(placeID) {
  const request = '/review?place_id=' + placeID;
  fetch(request).then(response => response.json()).then((place) => {
    populateReviews(place.reviews, placeID);
  });
}

/** Creates a structure to put reviews in modal
 * Takes in array of JS reviews
 */
function populateReviews(reviewList, placeID) {
  const listContainer = document.getElementById('reviews-list-container');
  const entireList = document.createElement('ul');
  entireList.id += 'reviews-list';

  if (reviewList[0] == null) {
    entireList.appendChild(noReviews());
  } else { 
    reviewList.forEach((review) => {
      entireList.appendChild(generateReview(review));
    });
  }
  entireList.appendChild(newReviewButton(placeID));
  listContainer.appendChild(entireList);
}

/** Creates a new-review button for users to post their own review. */
function newReviewButton(place_id) {
  const button = document.createElement('button');
  button.type = "button";
  button.id = "new-review-button";
  button.innerHTML = "Add New Review " + "&oplus;";
  button.addEventListener("click", function() {
    triggerNewReviewForm(place_id);
  });
  return button;
}

/** Hides reviews page and displays new-review form. */
function triggerNewReviewForm(place_id) {
  document.getElementById("place_id").value = place_id;
  document.getElementById("reviews-body").style.display = "none"; // Hide reviews page.
  document.getElementById("rev-form-body").style.display = "block";
}


/**
 * Review modal activation function
 */
function noReviews() {
  const reviewEntry = document.createElement('li');
  const entryText = document.createElement('p');
  entryText.id = 'no-reviews';
  entryText.innerHTML = "No reviews yet!";
  reviewEntry.appendChild(entryText);
  return reviewEntry;
}

/** Creates a review element using grid styling
 * Puts the review text in a <p> element
 */
function generateReview(review) {
  const reviewEntry = document.createElement('li');

  const reviewGrid = document.createElement('div');
  reviewGrid.className += 'review-grid';

  const reviewText = document.createElement('p');
  reviewText.innerHTML += review.messageContent;
  
  const upvoteButton = document.createElement('button');
  upvoteButton.innerHTML += '&#128077;' + review.positive;
  upvoteButton.id += "up" + review.id;
  upvoteButton.addEventListener("click", () => {
    if(upvoteButton.innerHTML[0] != " ") {
      review.positive += 1;
      voteOnReview(review);
    }
  });

  const downvoteButton = document.createElement('button');
  downvoteButton.innerHTML += '&#128078;' + review.negative;
  downvoteButton.id += "down" + review.id;
  downvoteButton.addEventListener("click", () => {
    if(upvoteButton.innerHTML[0] != " ") {
      review.negative += 1;
      voteOnReview(review);
    }
  });

  reviewGrid.appendChild(reviewText);
  reviewEntry.appendChild(reviewGrid);
  reviewEntry.appendChild(upvoteButton);
  reviewEntry.appendChild(downvoteButton);
  return reviewEntry;
} 

/** Sends post request to VotingServlet.java and updates modal. */
function voteOnReview(review) {
  const request = '/vote?comment_id=' + review.id + 
    '&up=' + review.positive + '&down=' + review.negative;
  fetch(request, {method:"POST"}).then(() => {
    document.getElementById("up" + review.id).innerHTML = " " + review.positive + " ";
    document.getElementById("down" + review.id).innerHTML = " " + review.negative + " ";
  });
}

/** Function reads heatWeights.txt and parses it as a JSON object
  * in order to populate heatMap in helperfunction. */
function initializeHeatMap(map) {
  let heatWeights = null
  fetch('heatWeights.txt').then(response => response.text())
    .then(text => {
      heatWeights = JSON.parse(text);
      locToLatLng(heatWeights);
    });
}

/** Function accepts a JSON object mapping U.S. counties to their relative covid weights
  * and creates an array of JSON objects mapping that county's coordinates to thosse weights
  * before making a call to populateHeatMap(). */
function locToLatLng(heatWeights, map) {
  var pointPromises = [];  // Promises to be resolved to {LatLng : Weight} objects.
  for(let county in heatWeights) {
    newPointPromise = countyToCoords(county, heatWeights[county], i);
    pointPromises.push(newPointPromise);
  }
  // Waits on all promises to complete before passing the results into the next function.
  Promise.all(pointPromises).then(points => {
    //console.log(points);
    populateHeatMap(points, map);
  });
}

/** Function accepts a county and a corresponding weight and 
  * returns a promise to find its geocoded coordinates. */
function countyToCoords(county, countyWeight, i) {
  // Get the coordinates of a requested location. 
  const locationPromise = new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': county}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        var newCoords = new google.maps.LatLng(latitude, longitude);
        var newPoint = {
          location: newCoords,
          weight: countyWeight
        };
        resolve(newPoint);
      }
    });
  });
  return locationPromise; 
}


/** Uses heatMapData object to populate heatMap. */
function populateHeatMap(heatMapData, map) {
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatMapData
  });
  heatmap.setMap(map);
}