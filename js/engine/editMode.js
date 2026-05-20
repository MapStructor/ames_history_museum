/* editMode.js
 *
 * Activated only when ?edit is present in the URL.
 * Shows a blocking login modal (no dismiss until valid credentials entered).
 * On success: sets window.editMode = true and calls activateEditMode().
 * On page reload with ?edit and an active session: skips modal, activates immediately.
 */

window.editMode = false;
window._buildingsOpacity = 1.0;

window.applyBuildingsOpacity = function (opacity) {
  opacity = typeof opacity === 'number' ? opacity : 1;
  var mainExpr = ['case', ['boolean', ['feature-state', 'hover'], false], 0.5 * opacity, 1.0 * opacity];
  var hlExpr   = ['case', ['boolean', ['feature-state', 'hover'], false], 0.7 * opacity, 0];
  [
    ['curr-builds-left',          'curr-builds-highlighted-left',  'curr-builds-promoted-left',  window.beforeMap],
    ['curr-builds-right',         'curr-builds-highlighted-right', 'curr-builds-promoted-right', window.afterMap],
  ].forEach(function (entry) {
    var mainId = entry[0], hlId = entry[1], promId = entry[2], map = entry[3];
    if (!map) return;
    if (map.getLayer(mainId))  map.setPaintProperty(mainId,  'fill-opacity', mainExpr);
    if (map.getLayer(hlId))    map.setPaintProperty(hlId,    'fill-opacity', hlExpr);
    if (map.getLayer(promId))  map.setPaintProperty(promId,  'fill-opacity', mainExpr);
  });
};

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
    _buildBuildingsOpacitySlider();
    if (typeof initDrawTool === 'function') initDrawTool();
  }

  function _buildBuildingsOpacitySlider() {
    if (document.getElementById('buildings-opacity-wrap')) return;

    var wrap = document.createElement('div');
    wrap.id = 'buildings-opacity-wrap';

    var label = document.createElement('label');
    label.htmlFor = 'buildings-opacity-slider';
    label.textContent = 'Buildings';

    var slider = document.createElement('input');
    slider.type  = 'range';
    slider.id    = 'buildings-opacity-slider';
    slider.min   = '0';
    slider.max   = '100';
    slider.value = '100';
    slider.step  = '5';

    var valEl = document.createElement('span');
    valEl.id = 'buildings-opacity-val';
    valEl.textContent = '100%';

    slider.addEventListener('input', function () {
      var pct = parseInt(slider.value, 10);
      valEl.textContent = pct + '%';
      window._buildingsOpacity = pct / 100;
      window.applyBuildingsOpacity(window._buildingsOpacity);
    });

    wrap.appendChild(label);
    wrap.appendChild(slider);
    wrap.appendChild(valEl);
    document.body.appendChild(wrap);
  }
})();
