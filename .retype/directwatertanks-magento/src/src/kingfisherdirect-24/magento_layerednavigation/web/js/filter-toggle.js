define([], function() {
    'use strict';

    const toggleClassImport = import("theme/js/utils/toggleClass.mjs")

    return async function (config, element) {
        const { toggleClass } = await toggleClassImport

        toggleClass(element, {
            "selector": "body",
            "class": "filters-open",
            "overlayDismiss": true
        })

        var productsEl = document.getElementById('products')
        // element.addEventListener('click', function () {
        //     scrollTo(productsEl, { downOnly: true })
        // })
    }
});
