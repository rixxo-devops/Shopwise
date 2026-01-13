// Inject Rixxo Brand CSS
(function() {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'resources/css/rixxo-brand.css';
  link.type = 'text/css';
  document.head.appendChild(link);
  
  // Also add Google Fonts preconnect
  var preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);
  
  var preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);
})();
