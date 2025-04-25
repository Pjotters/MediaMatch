// EIGEN ANALYTICS MODULE
// Verzamel pageviews, clicks, events en stuur naar backend
(function(){
  const endpoint = window.config?.analyticsUrl || '/api/analytics/event';
  function send(event, data={}) {
    fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        event,
        data,
        url: window.location.pathname,
        ts: Date.now(),
        ua: navigator.userAgent
      })
    }).catch(()=>{});
  }
  window.Analytics = {
    send,
    pageview: () => send('pageview'),
    click: (target) => send('click', {target}),
    custom: (event, data) => send(event, data)
  };
  // Automatische pageview bij load
  document.addEventListener('DOMContentLoaded', () => {
    window.Analytics.pageview();
    document.body.addEventListener('click', e => {
      let el = e.target;
      while(el && !el.dataset.analytics) el = el.parentElement;
      if(el && el.dataset.analytics) window.Analytics.click(el.dataset.analytics);
    });
  });
})();
