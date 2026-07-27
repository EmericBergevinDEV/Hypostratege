const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-header nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('mobile-open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('mobile-open');menuButton?.setAttribute('aria-expanded','false');}));

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
document.querySelectorAll('.calc-menu button').forEach(btn=>btn.addEventListener('click',()=>document.getElementById('mortgageCalculator')?.scrollIntoView({behavior:'smooth',block:'center'})));

const preauthForm=document.getElementById('preauthForm');
const preauthIntro=document.getElementById('preauthIntro');
const openPreauthButton=document.getElementById('openPreauthButton');
function openPreauthForm({scroll=true}={}){if(!preauthForm)return;preauthForm.hidden=false;preauthForm.classList.add('is-open');openPreauthButton?.setAttribute('aria-expanded','true');preauthIntro?.classList.add('form-open');window.HypostrategeAnalytics?.track('preauthorization_opened');if(scroll)preauthForm.scrollIntoView({behavior:'smooth',block:'start'});}
openPreauthButton?.addEventListener('click',()=>openPreauthForm());
document.querySelectorAll('[data-open-preauth]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openPreauthForm({scroll:true});history.replaceState(null,'','#preautorisation');}));
if(location.hash==='#preautorisation')openPreauthForm({scroll:false});

document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>window.HypostrategeAnalytics?.track('contact_click',{method:'phone'})));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>window.HypostrategeAnalytics?.track('contact_click',{method:'email'})));

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
