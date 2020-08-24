/* Class Variables. */
var map;
var markers;
var prev_ID;

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
  const commentSortHighestRated = document.getElementById("comment-sort-highest-rated");
  const commentSortRecent = document.getElementById("comment-sort-recent");
  const commentSortRelevant = document.getElementById("comment-sort-relevant");

  // Hide reviews page and display results page.
  modalBackArrow.addEventListener("click", () => {
    returnToResultsScreen();
  });

  commentSortHighestRated.addEventListener("click", () => {
    commentSortHighestRated.classList.add("active");
    commentSortRecent.classList.remove("active");
    commentSortRelevant.classList.remove("active");
    resortReviews(prev_ID, 'highest-rated');
  });
  
  commentSortRecent.addEventListener("click", () => {
    commentSortRecent.classList.add("active");
    commentSortHighestRated.classList.remove("active");
    commentSortRelevant.classList.remove("active");
    resortReviews(prev_ID, 'recent');
  });

  commentSortRelevant.addEventListener("click", () => {
    commentSortRelevant.classList.add("active");
    commentSortHighestRated.classList.remove("active");
    commentSortRecent.classList.remove("active");
    resortReviews(prev_ID, 'relevant');
  })
}

/** Clears top layers of modal and displays results page. */
function returnToResultsScreen() {
  returnToReviewScreen();
  hideButton(document.getElementById("modal-backarrow"));
  hideButton(document.getElementById("comment-sort-highest-rated"));
  hideButton(document.getElementById("comment-sort-recent"));
  hideButton(document.getElementById("comment-sort-relevant"));
  hideButton(document.getElementById('reviews-body'));

  document.getElementById('results-body').style.display = "block"; // Display results page.
  document.getElementById('reviews-list-container').innerHTML = ''; // Clean reviews wrapper of all DOM elements;
}

/** Wipes review form from page. */
function returnToReviewScreen() {
  document.getElementById('fname').value = '';
  document.getElementById('lname').value = '';
  document.getElementById('comment').value = '';
  hideButton(document.getElementById('rev-form-body'));
  document.querySelector('#submit-button').innerHTML = '';
}

/* Adds mouse listeners to searchBar-related html items. */
function activateSearchBar() {
  const searchIcon = document.getElementbyID("search-icon");
  const searchBar = document.getElementbyID("search");
  const searchForm = document.getElementbyID("searchForm");
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
    var radius = document.getElementById('searchForm').elements[2].value;
    searchByText(query, location, radius);
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
      var radius = document.getElementById('searchForm').elements[2].value;
      searchByText(query, location, radius);
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
  hideButton(document.getElementById("modal-backarrow"));
  hideButton(document.getElementById("comment-sort-recent"));
  hideButton(document.getElementById("comment-sort-highest-rated"));
  hideButton(document.getElementById("comment-sort-relevant"));
}

/** Multi-purpose button hiding function */
function hideButton(button) {
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
      }
  });
}

/* Creates a map centered at the Googleplex! .*/
function createMap() {
  const googleplex = {lat: 37.422, lng: -122.0841};
  map = new google.maps.Map(
    document.getElementById('map'),
    {center: googleplex, zoom: 14, // Set default zoom to allow proper spacing of markers on-search.
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
  markers = [];
  initializeHeatMap();

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
function searchByText(textQuery, textLocation, textRadius) {
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
  
  // Checks if they set the radius, if not, automatically set it to be 10 miles. 
  if (textRadius == 0){
    textRadius = 10;
  }
  // Convert from miles to meters
  var meters = textRadius * 1609;
  // Waits for location to be chosen, then runs search
  locationPromise.then((locationRequest) => {
    var request;
    // If no location is given, automatically gives you results near you with no radius limitation. 
    if (locationRequest == null){
      request = {
        query: textQuery, 
        fields: ['place_id', 'geometry']
      };
    } else {
      request = {
        query: textQuery,
        location: locationRequest,
        radius: meters,
        fields: ['place_id', 'geometry']
      };
    }
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, (results, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        handleSearchResults(results, service, meters, locationRequest);
      }
    });
  });
}

/* Accepts results from places query and returns array of details for nearby locations. */
function handleSearchResults(results, service, radius, location) {
  // Center on the queried location
  if (results.length > 0) { 
    map.setCenter(results[0].geometry.location);
    map.setZoom(14); // Ensure map is sufficiently zoomed in to appropriately space results.
  }
  deleteMarkers();
  var promises = [];

  // Modal can handle up to 9 results only due to Google API restrictions
  for (var i = 0; i < 9; i++) {
    if (results[i] == null){
        break;
    } else {
      // Check to make sure within specified distance (if one is specified)
      if (checkDistance(location, results[i].geometry.location, radius)){
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
      } else {
        break;
      }
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
    populateSearch(places, location);
  });
}

/** Deletes all markers in the array by removing references to them. */
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

/** Sets the map on all markers in the array. */
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

/** Check if coordinates are within the requested distance */
function checkDistance(location1, location2, radius){
  // If no distance is given, automatically returns true. 
  if (location1 == null || location2 == null){
    return true;
  }
  var earthRadius = 6371000; // in meters. 
  var dLat = degreesToRadians(location2.lat()-location1.lat());
  var dLng = degreesToRadians(location2.lng()-location1.lng());
  var sindLat = Math.sin(dLat / 2);
  var sindLng = Math.sin(dLng / 2);
  var a = Math.pow(sindLat, 2) + Math.pow(sindLng, 2)
            * Math.cos(degreesToRadians(location1.lat())) * Math.cos(degreesToRadians(location2.lat()));
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var dist = earthRadius * c;
  return (dist <= radius);
}

/** Convert degrees to radians */
function degreesToRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

/* Fills out search results page. */
function populateSearch(places, location) {
  const resultSortDistance = document.getElementById("sort-distance");
  const resultSortRating = document.getElementById("sort-rated");
  var promises = [];
    // Give each place a rating field based on the information from our datastore.
  places.forEach(place => {
    const placeRatingPromise = new Promise((resolve, reject) => {
      const request = '/review?place_id=' + place.place_id + '&sort=recent';
      fetch(request).then(response => response.json()).then((p) => {
        place.rating = p.rating;
        resolve(place);
      });
    });
    promises.push(placeRatingPromise);
  });

    // Make sure each place has a rating, then allow search results to pop up. 
  Promise.all(promises).then(() => {
    closeModal(document.getElementById("results-popup"));
    triggerModal(document.getElementById("results-popup"));
    populateResults(places);
  });

  // Adds an event listener for the distance sort button
  resultSortDistance.addEventListener("click", () => {
    if (location == null) {
      // TODO: Add geolocator code. 
      return;
    }
    places.sort(function(a, b){ 
      return getDistance(location, a.geometry.location)
        - getDistance(location, b.geometry.location);
    });
    closeModal(document.getElementById("results-popup"));
    triggerModal(document.getElementById("results-popup"));
    populateResults(places);
  });

  // Adds an event listener for the rating sort button
  resultSortRating.addEventListener("click", () => {
    places.sort(function(a, b){
      // Top ratings on top of the list
      return b.rating - a.rating;
    });
    closeModal(document.getElementById("results-popup"));
    triggerModal(document.getElementById("results-popup"));
    populateResults(places);
  });
}

/** Returns the distance between two coordinates*/
function getDistance(location1, location2){
  if (location1.lat() == location2.lat() && location1.lng() == location2.lng()){
    return 0;
  }
  var a = Math.pow((location1.lat() - location2.lat()), 2);
  var b = Math.pow((location1.lng() - location2.lng()), 2);
  return Math.sqrt(a + b);
}


/* Triggers the modal, and overlay, to follow the active CSS styling, making it appear. */
function triggerModal(modal) {
  if (modal == null) return;
  overlay.classList.add('active');
  modal.classList.add('active');
  document.getElementById('results-body').style.display = "block";
  hideButton(document.getElementById("modal-backarrow"));
  hideButton(document.getElementById("comment-sort-highest-rated"));
  hideButton(document.getElementById("comment-sort-recent"));
  hideButton(document.getElementById("comment-sort-relevant"));
}

/* This function takes in an array of JS places and creates an unordered
 * list container to be populated. */
function populateResults(places) {
  const listContainer = document.getElementById('results-list-container');
  const entireList = document.createElement('ul'); // Results ul
  entireList.id += "results-list";
  places.forEach(place => {
    entireList.appendChild(generateResult(place));
    var marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      animation: google.maps.Animation.DROP,
      title: 'Hello World!'
    });
    addMarkerListeners(marker, place.place_id);
    markers.push(marker);
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
    "<a onclick=\"showReviews(\'" + place.place_id + "\', false);\">" + place.name + "</a>",
    place.international_phone_number,
    "<a href=\"" + place.website + "\">Site</a>",
    place.vicinity,
    place.rating
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

/** Add event listeners to markers. */
function addMarkerListeners(marker, placeID) {
  marker.addListener('mouseover', () => toggleBounce(marker));
  marker.addListener('mouseout', () => toggleBounce(marker));
  marker.addListener('click', () => {
    triggerModal(document.getElementById("results-popup"));
    showReviews(placeID, true);
  });
}

/** Enable markers to bounce when hovered over. */
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

/** Pseudomaster Review Function
 * One central function that is called to trigger entire review interface
 */
function showReviews(placeID, clickedFromMap) {
  if(getURLParameter('testing') === 'true') {
    placeID = 'testReviews';
  }
  fetchReviews(placeID);
  displayReviewModal(clickedFromMap);
}

/** Retrieve url parameters from the site's url. */
function getURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
  return null;
}

/**
 * Review modal activation function
 */
function displayReviewModal(clickedFromMap) {
  if(!clickedFromMap) {
    enableBackArrow();
  }
  enableSortOptions();
  displayReviewsBody();
}

/** Displays back-arrow button. */
function enableBackArrow() {
  const reviewBackArrow = document.getElementById('modal-backarrow');
  reviewBackArrow.innerHTML = "&larr;";
  reviewBackArrow.style.display = "block"
}

/** Displays sort options button. */
function enableSortOptions() {
  const commentSortHighestRated = document.getElementById("comment-sort-highest-rated");
  commentSortHighestRated.style.display = "block";
  const commentSortRecent = document.getElementById("comment-sort-recent");
  commentSortRecent.style.display = "block";
  const commentSortRelevant = document.getElementById("comment-sort-relevant");
  commentSortRelevant.style.display = "block";
}

/** Displays review-body and hides results-body. */
function displayReviewsBody() {
  document.getElementById('results-body').style.display = "none";
  document.getElementById('reviews-body').style.display = "block";
}

/** Fetch Reviews
 * Queries ReviewServlet with elementID// Comment object gets it's datastore id. 
    comment.setId(reviewEntity.getKey().getId()); to find internal datastore
 */
function fetchReviews(placeID, sort='recent') {
  prev_ID = placeID;
  const request = '/review?place_id=' + placeID + '&sort=' + sort;
  fetch(request).then(response => response.json()).then((place) => {
    populateReviews(place.reviews, placeID, place.currUser);
  });
}

/** Creates a structure to put reviews in modal
 * Takes in array of JS reviews
 */
function populateReviews(reviewList, placeID, currUser) {
  const listContainer = document.getElementById('reviews-list-container');
  const entireList = document.createElement('ul');
  entireList.id += 'reviews-list';

  if (reviewList[0] == null) {
    entireList.appendChild(noReviews());
  } else { 
    reviewList.forEach((review) => {
      entireList.appendChild(generateReview(review, currUser));
    });
  }
  entireList.appendChild(newReviewButton(placeID));
  listContainer.appendChild(entireList);
}

/** ReSorts the shown comments
 * Cleans the review modal, requeries, and displays the comments
 */
function resortReviews(placeID, sort) {
  document.getElementById("reviews-list-container").innerHTML = '';
  fetchReviews(placeID, sort);
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
  hideButton(document.getElementById('comment-sort-highest-rated'));
  hideButton(document.getElementById('comment-sort-recent'));
  hideButton(document.getElementById('comment-sort-relevant'));
  const newReviewSubmit = document.createElement('button');
  newReviewSubmit.innerHTML = 'Submit';
  newReviewSubmit.id = 'submit-new-review';
  newReviewSubmit.addEventListener("click", () => {
    postNewReview(place_id);
  });
  document.getElementById('submit-button').appendChild(newReviewSubmit);
}

/** Function posts new review to datastore and updates modal reviews page with new review. */
function postNewReview(place_id) {
  const first = document.getElementById('fname').value;
  const last = document.getElementById('lname').value;
  const comment = document.getElementById('comment').value;
  const rate = getRating();
  const request = '/review?firstName=' + first + '&rate=' + rate +
    '&lastName=' + last + '&comment=' + comment + '&place_id=' + place_id;
  fetch(request, {method:"POST"}).then(() => {
    returnToReviewScreen();
    returnToResultsScreen();
    //showReviews(place_id, false);
  });
}

/** Finds which of the radio buttons is currently checked and returns that value. */
function getRating() {
  var radios = document.getElementsByName('rate');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      radios[i].style.color = "#ccc;"
      return radios[i].value;
    }
    radios[i].style.color = "#ccc;"
  }
  return 0;
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
function generateReview(review, currUser) {
  const newReview = createReviewContainer();
  newReview.appendChild(createBigFlexContainer(review, currUser));
  newReview.appendChild(document.createElement('br'));
  newReview.appendChild(createReviewTextDiv(review.messageContent));
  return newReview;
}

/** Creates container to hold and style reviews. */
function createReviewContainer() {
  const reviewEntry = document.createElement('li');
  reviewEntry.className = 'review-container';
  return reviewEntry;
}

/** Creates container to hold and style top elements of review. */
function createBigFlexContainer(review, currUser) {
  const bigFlex = document.createElement('div');
  bigFlex.className = 'big-flex';
  bigFlex.appendChild(createLeftFlex(review));
  bigFlex.appendChild(createRightFlex(review, currUser));
  return bigFlex;
}

/** Creates container to hold a user's actual review. */
function createReviewTextDiv(text) {
  const div = document.createElement('div');
  div.innerHTML = text;
  div.className = 'review-text';
  return div;
}

/** Creates a container to hold leftmost elements of top elements of review. */
function createLeftFlex(review) {
  const leftFlex = document.createElement('div');
  leftFlex.className = 'left-flex';

  const userName = document.createElement('div');
  userName.className = 'userName';
  userName.innerHTML = review.author;

  const staticRating = document.createElement('div');
  staticRating.className = 'static-rating';
  addStars(review.rating, staticRating);

  leftFlex.appendChild(userName);
  leftFlex.appendChild(staticRating);
  return leftFlex;
}

/** Adds stars to parent element in review modal for a given review. */
function addStars(rate, parent) {
  const starClass = 'fa fa-star ';
  for(var i = 0; i < rate; i ++) {
    const star = document.createElement('span');
    star.className = starClass + 'checked';
    parent.appendChild(star);
  }
  for(var i = rate; i < 5; i++) {
    const star = document.createElement('span');
    star.className = starClass + 'unchecked';
    parent.appendChild(star);
  }
}

/** Creates container to hold upvote/downvote buttons. */
function createRightFlex(review, currUser) {
  const rightFlex = document.createElement('div');
  rightFlex.className = 'right-flex';
  addVotingButtons(rightFlex, review, currUser);
  return rightFlex;
}

/** Adds upvote/downvote button to each review. */
function addVotingButtons(parent, review, currUser) {
  const upvoteButton = document.createElement('a');
  upvoteButton.innerHTML += '&#128077;' + review.positive;
  upvoteButton.id += "up" + review.id;
  upvoteButton.className = 'vote-button';
  if (review.currUserVote == "positive"){
    upvoteButton.style.color = "red";
  }
  upvoteButton.addEventListener("click", () => {
    upvoteClick(review, currUser);
  });

  const downvoteButton = document.createElement('a');
  downvoteButton.innerHTML += '&#128078;' + review.negative;
  downvoteButton.id += "down" + review.id;
  downvoteButton.className = 'vote-button';
  if (review.currUserVote == "negative"){
    downvoteButton.style.color = "red";
  }
  downvoteButton.addEventListener("click", () => {
    downvoteClick(review, currUser);
  });
  parent.appendChild(upvoteButton);
  parent.appendChild(downvoteButton);
}

/** Sends post request to VotingServlet.java and updates modal. */
function voteOnReview(review) {
  const request = '/vote?comment_id=' + review.id + 
    '&up=' + review.positive + '&down=' + review.negative;
  fetch(request, {method:"POST"}).then((results) => {
    document.getElementById("up" + review.id).innerHTML = "&#128077;" + review.positive + " ";
    document.getElementById("down" + review.id).innerHTML = "&#128078;" + review.negative + " ";
  });
}

/* Completes a thumbs up vote by either adding a new upvote or switching the user's current vote */
function upvoteClick(review, currUser){
  // Users must be logged in to vote! 
  if (currUser != null){
    // Check if they already voted positive
    if (review.currUserVote != "positive") {
      // If not, add their vote. 
      // Check if they already voted negative
      if (review.currUserVote == "negative"){
        // If so, remove their negative vote.
        review.negative -= 1;   
        review.currUserVote = null;  
        toggleColor("down" + review.id);
      }
      review.positive += 1;
      review.currUserVote = "positive";
      toggleColor("up" + review.id);
    } else {
      // Otherwise, remove their vote
      review.positive -= 1;
      review.currUserVote = null;
      toggleColor("up" + review.id);
    }
    voteOnReview(review);
  }
}

/* Completes a thumbs down vote by either adding a new downvote or switching the user's current vote */
function downvoteClick(review, currUser){
  // Users must be logged in to vote! 
  if (currUser != null){
    // Check if they already voted negative
    if (review.currUserVote != "negative") {
      // If not, add their vote. 
      // Check to see if they already voted positive
      if (review.currUserVote == "positive"){
        // If so, remove their vote. 
        review.positive -= 1;
        review.currUserVote = null;
        toggleColor("up" + review.id);
      }
      review.negative += 1;
      review.currUserVote = "negative";
      toggleColor("down" + review.id);
    } else {
      // Otherwise, remove their vote. 
      review.negative -= 1;
      review.currUserVote = null;
      toggleColor("down" + review.id);
    }
    voteOnReview(review);
  }
}

/** Switch the color of the button based on vote */
function toggleColor(review){
  if (document.getElementById(review).style.color == "red"){
    document.getElementById(review).style.color = "black";
  } else {
    document.getElementById(review).style.color = "red";
  }
}

/** Function reads heatWeights.txt and parses it as a JSON object
  * in order to populate heatMap in helperfunction. */
function initializeHeatMap() {
  var heatWeights = null
  fetch('heatWeights.txt').then(response => response.text())
    .then(text => {
      heatWeights = JSON.parse(text);
      const heatMapData = createHeatMapData(heatWeights);
      populateHeatMap(heatMapData)
    });
}

/** Returns an array of json objects that contain both a county's coordinates
  * and its weight in a format that google heatmaps can read. */
function createHeatMapData(heatWeights) {
  var heatMapData = []
  i = 0
  for(const county in heatWeights) {
    const location = heatWeights[county].location;
    const newPoint = {
      location: new google.maps.LatLng(location.lat, location.lng),
      weight: heatWeights[county].weight
    }
    heatMapData.push(newPoint);
    i += 1;
  }
  return heatMapData;
}

/** Uses heatMapData object to populate heatMap. */
function populateHeatMap(heatMapData) {
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatMapData
  });
  heatmap.set("radius", 150);
  addHeatMapListeners(heatmap); 
}

/** Adds functionality for heatmap related buttons/toggles. */
function addHeatMapListeners(heatmap) {
  const heatToggle = document.getElementById("heat-toggle");
  const gradToggle = document.getElementById("gradient-toggle");
  const radiusSlider = document.getElementById("heat-radius");
  const opacitySlider = document.getElementById("heat-opacity");
  const darkMode = document.getElementById("dark-toggle");
  const darkGradient = [
    "rgba(0, 255, 255, 0)",
    "rgba(0, 255, 255, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(0, 127, 255, 1)",
    "rgba(0, 63, 255, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(0, 0, 223, 1)",
    "rgba(0, 0, 191, 1)",
    "rgba(0, 0, 159, 1)",
    "rgba(0, 0, 127, 1)",
    "rgba(63, 0, 91, 1)",
    "rgba(127, 0, 63, 1)",
    "rgba(191, 0, 31, 1)",
    "rgba(255, 0, 0, 1)"
  ];

  // Activate heatmap and display heatmap buttons.
  heatToggle.addEventListener("click", () => {
      const mapActive = heatmap.getMap();
      heatmap.setMap(mapActive ? null : map);
      map.setZoom(8); // Zoom out when heatmap is activated.

      // Activate buttons.
      const disp = mapActive ? 'none' : 'block';
      gradToggle.style.display = disp;
      radiusSlider.style.display = disp;
      opacitySlider.style.display = disp;
      heatToggle.innerHTML = mapActive ? 
        'Open COVID Dashboard' : 'Close dashboard';
  });

  // Scale radius on zoom-in/out.
  map.addListener("zoom_changed", () => {
    changeRadius(heatmap, radiusSlider);
  });

  // Change heatmap gradient.
  gradToggle.style.display = 'none';
  gradToggle.addEventListener("click", () => {
    heatmap.set("gradient", heatmap.get("gradient") ? null : darkGradient);
  });
  
  // Grow/shrink heatmap data radius.
  radiusSlider.oninput = function() {
    changeRadius(heatmap, radiusSlider);
  }

  // Changes heatmap data opacity.
  opacitySlider.oninput = function() {
    heatmap.set("opacity", parseInt(this.value)/5); // Opacity ranges from 0 to 2.
  }

  darkMode.addEventListener("click", () => {
    darkMode.innerHTML = toggleDarkMode(map, heatmap, darkGradient, darkMode.innerHTML);
  });
}

/** Function is called whenever user zooms in/out of map
  * or manually changes the radius of the heatmap data.
  * Sets the heatmap radius based on radius slider and current
  * zoom level. */
function changeRadius(heatmap, slider) {
  const zoom = map.getZoom();
  const factor = parseInt(slider.value)/5; // Ranges from 0 to 2.
  heatmap.set("radius", Math.pow(1.75, zoom + factor));
}

/** Toggles "Dark Mode" on/off. */
function toggleDarkMode(map, heatmap, gradient, mode) {
  const darkStyle = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#263c3f'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#6b9a76'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#38414e'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#212a37'}]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{color: '#9ca5b3'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#746855'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#1f2835'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f3d19c'}]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#17263c'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}]
    }
  ];

  if(mode === "Light Mode") {
    map.set("styles", null);
    heatmap.set("gradient", null);
    return "Dark Mode";
  } else {
    map.set("styles", darkStyle);
    heatmap.set("gradient", gradient);
    return "Light Mode";
  }
}