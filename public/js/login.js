/* ============================================
   SATCHEL & CO — login.js
   Login page specific logic
   ============================================ */

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const redirect = getParam("redirect") || "index.html";

  const btn = e.target.querySelector("button[type='submit']");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Signing in...";

  const success = await handleLogin(email, password, redirect);

  if (!success) {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
