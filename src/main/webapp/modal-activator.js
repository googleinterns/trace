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

function populateResults(placesArray) {
  console.log('Populating results modal...');
  const listContainer = document.getElementById('results-list');
  const entireList = document.createElement('ul');
  places.forEach(place, () => {
    entireList.appendChild(generateResult(place));
  });
}

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