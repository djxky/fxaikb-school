(function(){
  if (window.supabase) return;

  function loadSupabase(){
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = function(){
      window.dispatchEvent(new CustomEvent('supabase:ready'));
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'complete') {
    setTimeout(loadSupabase, 0);
  } else {
    window.addEventListener('load', function(){ setTimeout(loadSupabase, 0); }, { once: true });
  }
})();
