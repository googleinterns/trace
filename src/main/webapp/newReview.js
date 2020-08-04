var currentLocation = "dsfsdf";

/* Load currentLocation into newReview form. */
function loadPlaceID() {
  console.log("loading....");
  console.log(currentLocation);
  let value = document.getElementByID("place_id").value;
  value = currentLocation;
}