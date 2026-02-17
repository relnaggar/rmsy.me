document.querySelectorAll("[data-inline-edit-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const cell = button.closest("td");
    const display = cell.querySelector("[data-inline-edit-display]");
    const form = cell.querySelector("[data-inline-edit-form]");

    display.classList.toggle("d-none");
    form.classList.toggle("d-none");
    form.classList.toggle("d-flex");
  });
});
