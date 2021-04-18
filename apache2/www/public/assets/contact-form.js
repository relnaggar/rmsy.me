// based on https://getbootstrap.com/docs/5.0/forms/validation/?#custom-styles

'use strict';

var recaptchaElement;

// Example starter JavaScript for disabling form submissions if there are invalid fields
var onloadCallback = function () {

  // Fetch the form we want to apply custom Bootstrap validation styles to
  var form = document.querySelector('.needs-validation')
  recaptchaElement = form.querySelector('.g-recaptcha');

  form.addEventListener('submit', function (event) {
    var grecaptchaResponse = grecaptcha.getResponse();

    // prevent submission
    if (!form.checkValidity() || !grecaptchaResponse) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (!grecaptchaResponse) {
      recaptchaElement.firstElementChild.classList.add('invalid')
      recaptchaElement.nextElementSibling.classList.add('d-block');
    }

    form.classList.add('was-validated')
  }, false)
}

var successfulResponseCallback = function() {
  recaptchaElement.firstElementChild.classList.remove('invalid')
  recaptchaElement.nextElementSibling.classList.remove('d-block');
}
