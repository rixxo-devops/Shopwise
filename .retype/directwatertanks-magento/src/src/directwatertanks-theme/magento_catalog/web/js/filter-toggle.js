'use strict'

define([
  'js/min-scroll-to',
  'js/toggle-classes'
],
function(minScrollTo, toggleClasses) {
  return function (config, element) {
    toggleClasses({"toggles": [{"selector": ".block.filter"}], "overlay": true}, element)

    var productsEl = document.getElementById('products')
    element.addEventListener('click', function () {
      minScrollTo(productsEl)
    })
  }
});
