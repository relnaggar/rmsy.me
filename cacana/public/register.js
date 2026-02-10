import { register } from "./auth.js";
import { showCacana } from "./cacana.js";
import { showLoginForm } from "./login.js";


const handleRegister = async () => {
  const registerUsername = document.getElementById("registerUsername").value.trim();
  const registerPassword = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const authError = document.getElementById("authError");

  if (!registerUsername || !registerPassword) {
    authError.textContent = "Please enter username and password";
    return;
  }

  if (registerPassword !== confirmPassword) {
    authError.textContent = "Passwords do not match";
    return;
  }

  if (registerPassword.length < 8) {
    authError.textContent = "Password must be at least 8 characters";
    return;
  }

  await register(
    registerUsername,
    registerPassword,
    () => { showCacana(); },
    (err) => { authError.textContent = err.message; }
  );
}

export const initialiseRegisterForm = () => {
  document.getElementById("showLoginLink").addEventListener("click", (e) => {
    e.preventDefault();
    showLoginForm();
  });
  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister();
  });
}

export const showRegisterForm = () => {
  document.getElementById("appContent").classList.add("d-none");
  document.getElementById("authContent").classList.remove("d-none");
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("registerForm").classList.remove("d-none");
  document.getElementById("authError").textContent = "";
}
