const form = document.querySelector('[data-match-payment]');

if (form) {
  const paymentAmount = parseInt(form.dataset.matchPayment, 10);
  const checkboxes = form.querySelectorAll('input[name="lesson_ids[]"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const totalDisplay = document.getElementById('match-total');

  function update() {
    let total = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) {
        total += parseInt(cb.dataset.price, 10);
      }
    });

    const formatted = '£' + (total / 100).toFixed(2);
    totalDisplay.textContent = formatted;

    const matches = total === paymentAmount;
    totalDisplay.classList.toggle('text-success', matches);
    totalDisplay.classList.toggle('text-danger', !matches);
    submitBtn.disabled = !matches;
  }

  checkboxes.forEach((cb) => cb.addEventListener('change', update));
  update();
}
