function setupModalButtons() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalClosers = document.querySelectorAll('[data-modal-close-button]');
  
}

function triggerModal(modal) {
  overlay.classList.add('active');
  modal.classList.add('active');
}