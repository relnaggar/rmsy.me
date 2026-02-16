document.addEventListener("submit", function (event) {
  const message = event.submitter?.dataset.confirm || event.target.dataset.confirm;
  if (message && !confirm(message)) {
    event.preventDefault();
  }
});
