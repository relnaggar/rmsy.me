import { login } from "./auth.js";
import { showCacana } from "./cacana.js";
import { showRegisterForm } from "./register.js";


const handleLogin = async () => {
  const loginUsername = document.getElementById("loginUsername").value.trim();
  const loginPassword = document.getElementById("loginPassword").value;
  const authError = document.getElementById("authError");

  if (!loginUsername || !loginPassword) {
    authError.textContent = "Please enter username and password";
    return;
  }

  await login(
    loginUsername,
    loginPassword,
    () => { showCacana(); },
    (err) => { authError.textContent = err.message; }
  );
}

export const initialiseLoginForm = () => {
  document.getElementById("showRegisterLink").addEventListener("click", (e) => {
    e.preventDefault();
    showRegisterForm();
  });
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

export const showLoginForm = () => {
  document.getElementById("appContent").classList.add("d-none");
  document.getElementById("authContent").classList.remove("d-none");
  document.getElementById("loginForm").classList.remove("d-none");
  document.getElementById("registerForm").classList.add("d-none");
  document.getElementById("authError").textContent = "";
}
