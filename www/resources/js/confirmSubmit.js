document.addEventListener("submit", function (event) {
  const message = event.target.dataset.confirm;
  if (message && !confirm(message)) {
    event.preventDefault();
  }
});
