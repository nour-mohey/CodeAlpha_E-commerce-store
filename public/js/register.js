/* ============================================
   SATCHEL & CO — register.js
   Registration page specific logic
   ============================================ */

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const btn = e.target.querySelector("button[type='submit']");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Creating Account...";

  const success = await handleRegister(name, email, password);

  if (!success) {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
