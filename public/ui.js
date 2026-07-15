<!-- Shared UI: sliding active-nav indicator, auth-aware "For Teachers" link, dead-button router -->
<script>
(function () {
  function label(el) { return (el.textContent || '').trim().toLowerCase(); }

  // 1) Auth-aware "For Teachers" link
  var ft = document.querySelector('a[href="login.html"]');
  if (ft && label(ft) === 'for teachers') {
    fetch('/api/auth/me', { credentials: 'same-origin' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (d) {
      if (d && d.user) {
        ft.setAttribute('href', d.user.role === 'teacher' ? 'teacher-dashboard.html' : 'post-hiring-request.html');
      }
    }).catch(function () {});
  }

  // 2) Sliding active indicator
  function moveIndicator() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var indicator = document.getElementById('nav-indicator');
    if (!indicator) return;
    var active = nav.querySelector('[aria-current="page"]');
    var cont = nav.getBoundingClientRect();
    if (!active) { indicator.style.opacity = '0'; return; }
    var r = active.getBoundingClientRect();
    indicator.style.opacity = '1';
    indicator.style.left = (r.left - cont.left) + 'px';
    indicator.style.width = r.width + 'px';
  }
  // animate only after fonts/layout settle
  window.addEventListener('load', function () { setTimeout(moveIndicator, 60); });
  window.addEventListener('resize', moveIndicator);

  // 3) Dead-button router (skip real links / forms)
  function isForm(el) { return !!el.closest('form'); }
  document.body.addEventListener('click', function (e) {
    var el = e.target.closest('button, a, [role="button"]');
    if (!el) return;
    var txt = label(el);
    if (isForm(el)) return;
    if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return;
    var map = {
      'sign in': 'login.html', 'signin': 'login.html', 'login': 'login.html',
      'get started': 'post-hiring-request.html', 'get started free': 'login.html',
      'create account': 'login.html', 'register': 'login.html', 'sign up': 'login.html',
      'request shortlist': 'post-hiring-request.html', 'request 3 matched teachers': 'post-hiring-request.html',
      'request 3 matches': 'post-hiring-request.html', 'browse talent pool': 'browse.html',
      'browse teachers': 'browse.html', 'view all listings': 'browse.html', 'find teachers': 'browse.html',
      'view profile': 'browse.html', 'compare': 'compare.html', 'compare teachers': 'compare.html',
      'messages': 'messages.html', 'interviews': 'messages.html', 'dashboard': 'teacher-dashboard.html',
      'pricing': 'pricing.html', 'school solutions': 'for-schools.html', 'for schools': 'for-schools.html',
      'directory': 'browse.html', 'teacher directory': 'browse.html'
    };
    for (var key in map) { if (txt.indexOf(key) !== -1) { e.preventDefault(); location.href = map[key]; return; } }
    if (txt && txt.indexOf('view bio') !== -1) { e.preventDefault(); location.href = 'browse.html'; }
  });
})();
</script>
