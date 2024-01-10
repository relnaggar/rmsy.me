export const localLogout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};

export const localLogin = (username: string, token: string): void => {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
};

export const localIsLoggedIn = (): boolean => {
  return localStorage.getItem("token") !== null && localStorage.getItem("username") !== null;
};

export  const localGetUsername = (): string => {
  return localStorage.getItem("username") || "";
}