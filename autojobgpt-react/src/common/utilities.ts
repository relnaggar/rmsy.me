export function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toFormData(object: {[index: string]: string | File}): FormData {
  const formData: FormData = new FormData();
  for (const [key, value] of Object.entries(object)) {
    formData.append(key, value);
  }
  return formData;
}

export function generatePlaceholderWidths(numberOfRows: number): number[] {
  // generate a random list of numbers
  // the numbers represent the width of each placeholder span
  // there should be (numberOfRows) groups of numbers
  // each group represents a row of placeholders
  // each group of numbers should add up to (maxWidth) or less

  const maxWidth: number = 10;
  const placeHolderWidths: number[] = [];
  let row = 1;
  let sum = 0;
  while (row < numberOfRows) {
    let width: number = Math.floor(Math.random() * maxWidth) + 1;    
    if (sum + width <= maxWidth) {
      placeHolderWidths.push(width);
      sum += width;
    } else {
      placeHolderWidths.push(0);
      row += 1;
      placeHolderWidths.push(width);
      sum = width;
    }
  }
  return placeHolderWidths;
}

export function closeModal(modal: HTMLElement): void {
  modal.removeAttribute("aria-modal")
  modal.removeAttribute("role")
  modal.classList.remove("show");
  modal.setAttribute("style", "display: none;");
  modal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");
  document.body.removeAttribute("style");
  document.body.removeAttribute("data-bs-overflow");
  document.body.removeAttribute("data-bs-padding-right");

  const modalBackdrops = document.getElementsByClassName("modal-backdrop");
  for (let i = 0; i < modalBackdrops.length; i++) {
    modalBackdrops[i].remove();
  }
}