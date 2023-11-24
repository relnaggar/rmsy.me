export function makeErrorMessage(error: any): string {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "Failed to connect to server. Please check your internet connection and try again.";
    } else {
      return error.message;
    }
  } else {
    return String(error);
  }
}