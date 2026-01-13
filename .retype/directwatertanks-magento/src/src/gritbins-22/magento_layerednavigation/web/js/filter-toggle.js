'use strict'

define([
    'js/toggle-class',
    'js/scroll-to'
],
function(toggleClass, scrollTo) {
	return function (config, element) {
		toggleClass({
		    "selector": "body",
		    "class": "filters-open",
		    "overlayDismiss": true
		}, element)

		var productsEl = document.getElementById('products')
		element.addEventListener('click', function () {
			scrollTo(productsEl, { downOnly: true })
		})
	}
});
