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