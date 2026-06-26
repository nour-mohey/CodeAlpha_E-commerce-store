/* ============================================
   SATCHEL & CO — login.js
   Login page specific logic
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address");
      return;
    }

    const redirectParam = getParam("redirect") || "/";
    const redirect = redirectParam.startsWith("/") ? redirectParam : `/${redirectParam}`;

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
});
