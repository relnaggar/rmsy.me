document.querySelectorAll('[data-auto-submit]').forEach((element) => {
  element.addEventListener('change', () => {
    element.closest('form')?.submit();
  });
});
