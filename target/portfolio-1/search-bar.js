const clearIcon = document.querySelector(".clear-icon");
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

logInButton.addEventListener("click", () => {
    return; // TO-DO: Fetch log-in info here.
});