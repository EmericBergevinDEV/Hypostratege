(function(){
  const cfg=window.HYPOSTRATEGE_ANALYTICS||{};
  const key='hypostratege_analytics_consent';
  const banner=document.getElementById('cookieBanner');
  function loadGA4(id){if(!id||document.querySelector('[data-ga4]'))return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',id,{anonymize_ip:true});const s=document.createElement('script');s.async=true;s.dataset.ga4='true';s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(s)}
  function loadGTM(id){if(!id||document.querySelector('[data-gtm]'))return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const s=document.createElement('script');s.async=true;s.dataset.gtm='true';s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(id);document.head.appendChild(s)}
  function enable(){if(cfg.googleTagManagerId)loadGTM(cfg.googleTagManagerId);else if(cfg.ga4MeasurementId)loadGA4(cfg.ga4MeasurementId)}
  function save(v){localStorage.setItem(key,v);banner.hidden=true;if(v==='accepted')enable()}
  const choice=localStorage.getItem(key);if(choice==='accepted')enable();else if(!choice)banner.hidden=false;
  document.getElementById('acceptAnalytics')?.addEventListener('click',()=>save('accepted'));
  document.getElementById('rejectAnalytics')?.addEventListener('click',()=>save('necessary'));
  window.HypostrategeAnalytics={track:function(name,params={}){if(localStorage.getItem(key)!=='accepted')return;if(window.gtag)gtag('event',name,params);else if(window.dataLayer)dataLayer.push({event:name,...params})},resetConsent:function(){localStorage.removeItem(key);location.reload()}};
})();
