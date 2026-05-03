/* editMode.js
 *
 * Activated only when ?edit is present in the URL.
 * Shows a blocking login modal (no dismiss until valid credentials entered).
 * On success: sets window.editMode = true and calls activateEditMode().
 * On page reload with ?edit and an active session: skips modal, activates immediately.
 */

window.editMode = false;

(function () {
  if (!new URLSearchParams(window.location.search).has('edit')) return;

  injectLoginModal();

  // If a session already exists (page reload), skip the modal
  window.supabaseClient.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      document.getElementById('edit-login-overlay').remove();
      activateEditMode();
    }
  });

  function injectLoginModal() {
    var overlay = document.createElement('div');
    overlay.id = 'edit-login-overlay';
    overlay.innerHTML = [
      '<div id="edit-login-card">',
        '<h2>Sign In</h2>',
        '<input type="email"    id="edit-email"    placeholder="Email"    autocomplete="email" />',
        '<input type="password" id="edit-password" placeholder="Password" autocomplete="current-password" />',
        '<button id="edit-login-btn">Sign In</button>',
        '<p id="edit-login-error"></p>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('edit-login-btn').addEventListener('click', attemptLogin);
    document.getElementById('edit-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attemptLogin();
    });
  }

  async function attemptLogin() {
    var email    = document.getElementById('edit-email').value.trim();
    var password = document.getElementById('edit-password').value;
    var errEl    = document.getElementById('edit-login-error');
    var btn      = document.getElementById('edit-login-btn');

    errEl.textContent = '';
    btn.disabled      = true;
    btn.textContent   = 'Signing in...';

    var result = await window.supabaseClient.auth.signInWithPassword({ email, password });

    if (result.error) {
      errEl.textContent = 'Invalid email or password.';
      btn.disabled      = false;
      btn.textContent   = 'Sign In';
      return;
    }

    document.getElementById('edit-login-overlay').remove();
    activateEditMode();
  }

  function activateEditMode() {
    window.editMode = true;
    if (typeof initDrawTool === 'function') initDrawTool();
  }
})();
