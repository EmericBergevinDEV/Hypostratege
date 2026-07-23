/* Hypostratège — interactions (menu mobile, formulaire, apparitions au défilement) */
(function () {
  var doc = document;

  // --- Menu mobile / tablette ---
  var toggle = doc.querySelector('.nav__toggle');
  var links = doc.querySelector('.nav__links');
  if (toggle && links) {
    var setMenu = function (open) {
      links.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!links.classList.contains('is-open'));
    });
    // Fermer après avoir choisi un lien
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
    // Fermer en touchant à l'extérieur du menu
    doc.addEventListener('click', function (e) {
      if (links.classList.contains('is-open') && !links.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });
    // Fermer si on repasse en affichage large (retour paysage/desktop)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) setMenu(false);
    });
  }

  // --- Année dans le pied de page ---
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Apparitions au défilement ---
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-reveal');

    // Éléments animés individuellement
    var singles = doc.querySelectorAll('.split, .cta-band, .rates, .form, .page-hero .breadcrumb, .section > .container > .text-center, .section > .container > div[style]');
    singles.forEach(function (el) { el.classList.add('reveal'); });

    // Grilles : apparition en cascade des enfants
    doc.querySelectorAll('.grid, .logos, .stats, .faq').forEach(function (el) {
      el.classList.add('reveal-stagger');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    doc.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) { io.observe(el); });
  }

  // --- Formulaire (Formspree AJAX) ---
  var form = doc.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      // Tant que la clé Web3Forms n'est pas collée, on laisse le repli mailto agir.
      var key = form.access_key ? form.access_key.value : '';
      if (!key || key.indexOf('VOTRE_CLE') !== -1) return;

      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours...'; }

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          var ok = doc.querySelector('.form__success');
          if (ok) { ok.style.display = 'block'; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        } else {
          alert("Une erreur est survenue. Vous pouvez aussi nous écrire directement par courriel.");
        }
      }).catch(function () {
        alert("Une erreur est survenue. Vous pouvez aussi nous écrire directement par courriel.");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
    });
  }
})();
