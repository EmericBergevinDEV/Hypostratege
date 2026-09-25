// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle') || document.querySelector('.nav__toggle') || document.querySelector('.menu-toggle');
const navLinks = document.getElementById('navLinks') || document.querySelector('.nav__links') || document.querySelector('.site-header nav');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
    navLinks.classList.toggle('mobile-open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      navLinks.classList.remove('mobile-open');
    });
  });
}


// Calculatrice (utilisée sur /calculatrice/ uniquement)
const calculator=document.getElementById('mortgageCalculator');
calculator?.addEventListener('submit',e=>{
  e.preventDefault();
  const price=Number(document.getElementById('price').value)||0;
  const down=Number(document.getElementById('down').value)||0;
  const annual=Number(document.getElementById('rate').value)||0;
  const years=Number(document.getElementById('years').value)||25;
  const principal=Math.max(0,price-down), r=annual/100/12, n=years*12;
  const payment=r===0?(n?principal/n:0):principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  document.getElementById('payment').textContent='Paiement mensuel estimé : '+payment.toLocaleString('fr-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0});
  window.HypostrategeAnalytics?.track('calculator_used',{calculator:'mortgage_payment'});
});
calculator?.dispatchEvent(new Event('submit',{cancelable:true}));

// Formulaire préautorisation (utilisé sur /preautorisation/ uniquement)
const preauthForm=document.getElementById('preauthForm');
function clearErrors(form){form.querySelectorAll('.form-error').forEach(e=>e.remove());form.querySelectorAll('.invalid').forEach(e=>e.classList.remove('invalid'));}
function showError(field,message){field.classList.add('invalid');const d=document.createElement('div');d.className='form-error';d.textContent=message;field.insertAdjacentElement('afterend',d);}
preauthForm?.addEventListener('submit',e=>{
  clearErrors(preauthForm);let first=null;
  preauthForm.querySelectorAll('[required]').forEach(field=>{if(!field.checkValidity()){e.preventDefault();showError(field,field.type==='email'?'Veuillez inscrire une adresse courriel valide.':'Ce champ est requis.');first=first||field;}});
  const projects=[...preauthForm.querySelectorAll('input[name="Projet"]')];
  const other=preauthForm.querySelector('input[name="Autre projet"]');
  if(projects.length&&!projects.some(x=>x.checked)&&!other?.value.trim()){e.preventDefault();const target=projects[0];showError(target.parentElement,'Veuillez sélectionner un projet ou préciser « Autre ».');first=first||target;}
  if(e.defaultPrevented){first?.focus();first?.scrollIntoView({behavior:'smooth',block:'center'});return;}
  window.HypostrategeAnalytics?.track('preauthorization_submitted');
  const btn=preauthForm.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Envoi en cours…';}
});

// Analytics
document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>window.HypostrategeAnalytics?.track('contact_click',{method:'phone'})));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>window.HypostrategeAnalytics?.track('contact_click',{method:'email'})));

// Bannière cookies
const cookieBanner=document.getElementById('cookieBanner');
const COOKIE_KEY='hypo_analytics_consent';
if(cookieBanner){
  const stored=localStorage.getItem(COOKIE_KEY);
  if(!stored)cookieBanner.hidden=false;
  document.getElementById('acceptAnalytics')?.addEventListener('click',()=>{localStorage.setItem(COOKIE_KEY,'accepted');cookieBanner.hidden=true;window.HypostrategeAnalytics?.enable();});
  document.getElementById('rejectAnalytics')?.addEventListener('click',()=>{localStorage.setItem(COOKIE_KEY,'rejected');cookieBanner.hidden=true;});
}