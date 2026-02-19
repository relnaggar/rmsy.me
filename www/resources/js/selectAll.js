document.querySelectorAll('[data-select-all]').forEach((selectAllCheckbox) => {
  const form = selectAllCheckbox.closest('form');
  if (!form) return;

  const getCheckboxes = () =>
    form.querySelectorAll('input[type="checkbox"]:not([data-select-all])');

  const updateRequiresSelection = () => {
    const anyChecked = [...getCheckboxes()].some((cb) => cb.checked);
    form.querySelectorAll('[data-requires-selection]').forEach((el) => {
      el.disabled = !anyChecked;
    });
  };

  selectAllCheckbox.addEventListener('change', () => {
    getCheckboxes().forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
    updateRequiresSelection();
  });

  getCheckboxes().forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const all = getCheckboxes();
      selectAllCheckbox.checked = [...all].every((cb) => cb.checked);
      selectAllCheckbox.indeterminate =
        !selectAllCheckbox.checked && [...all].some((cb) => cb.checked);
      updateRequiresSelection();
    });
  });

  updateRequiresSelection();
});
