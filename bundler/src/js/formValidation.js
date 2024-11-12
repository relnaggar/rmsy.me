export function applyBootstrapValidation() {
  // add event listener to every form on the page that needs validation
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    // listen for submit event
    form.addEventListener('submit', event => {
      // on submit, check if form is valid
      if (!form.checkValidity()) {
        // if not valid, prevent default submit event
        event.preventDefault();
        event.stopPropagation();
      }
      // add bootstrap validation classes for visual feedback (red or green)
      form.classList.add('was-validated');
    }, false);
  });
}
