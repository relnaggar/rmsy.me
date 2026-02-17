const form = document.querySelector('[data-match-payment]');

if (form) {
  const remainingAmount = parseInt(form.dataset.matchPayment, 10);
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

    const isExact = total === remainingAmount;
    const isPartial = total > 0 && total < remainingAmount;
    const isOver = total > remainingAmount;

    totalDisplay.classList.toggle('text-success', isExact);
    totalDisplay.classList.toggle('text-warning', isPartial);
    totalDisplay.classList.toggle('text-danger', !isExact && !isPartial);
    submitBtn.disabled = total === 0 || isOver;
  }

  // Auto-check suggested lessons until total reaches remaining amount
  let runningTotal = 0;
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      runningTotal += parseInt(cb.dataset.price, 10);
    }
  });
  if (runningTotal < remainingAmount) {
    checkboxes.forEach((cb) => {
      if (!cb.checked && cb.hasAttribute('data-suggested')) {
        const price = parseInt(cb.dataset.price, 10);
        if (runningTotal + price <= remainingAmount) {
          cb.checked = true;
          runningTotal += price;
        }
      }
    });
  }

  checkboxes.forEach((cb) => cb.addEventListener('change', update));
  update();
}
