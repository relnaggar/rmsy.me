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
    submitBtn.disabled = !matches || submitBtn.hasAttribute('data-disabled');
  }

  // Auto-check suggested lessons until total matches payment amount
  let runningTotal = 0;
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      runningTotal += parseInt(cb.dataset.price, 10);
    }
  });
  if (runningTotal < paymentAmount) {
    checkboxes.forEach((cb) => {
      if (!cb.checked && cb.hasAttribute('data-suggested')) {
        const price = parseInt(cb.dataset.price, 10);
        if (runningTotal + price <= paymentAmount) {
          cb.checked = true;
          runningTotal += price;
        }
      }
    });
  }

  checkboxes.forEach((cb) => cb.addEventListener('change', update));
  update();
}
