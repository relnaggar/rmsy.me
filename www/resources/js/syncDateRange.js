document.querySelectorAll('[data-copy-date-to]').forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const sourceInput = document.getElementById(button.dataset.copyDateFrom);
    const targetInput = document.getElementById(button.dataset.copyDateTo);
    if (sourceInput && targetInput) {
      targetInput.value = sourceInput.value;
    }
  });
});
