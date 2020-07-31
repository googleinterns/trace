// Create the script tag, set the appropriate attributes
var script = document.createElement('script');

// Edit key between 'key=' and '&locat...' to our new API key once you pull this file.
// Then add this file to .gitignore
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB-kjcAxxbrQeJJEvSg5XgkTmGI4aZLS5E&libraries=places';
script.defer = true;
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function() {
  // JS API is loaded and available
};

// Append the 'script' element to 'head'
document.head.appendChild(script);