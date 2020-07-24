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

function triggerModal(modal) {
  overlay.classList.add('active');
  modal.classList.add('active');
}

function closeModal(modal) {
  overlay.classList.remove('active');
  modal.classList.remove('active');
}