define(function () {
    'use strict';

    return function (options, element) {
        const crossellFor = new WeakMap();
        const crossellEls = Array.from(element.querySelectorAll('[data-crossell-for]'));
        const showMoreEl = element.querySelector('.dynamic-extras-show-more');

        crossellEls.forEach(el => {
            crossellFor.set(el, JSON.parse(el.dataset.crossellFor));
        });

        let productId = options.productId.toString();
        let expanded = false;

        const form = document.querySelector('#product_addtocart_form');

        function updateVisibility() {
            const matchingCrossSells = crossellEls.filter(el => {
                const products = crossellFor.get(el);
                return products.includes(productId) || products.includes(options.productId);
            });

            crossellEls.forEach(el => {
                if (!matchingCrossSells.includes(el)) {
                    el.hidden = true;

                    const checkbox = el.querySelector('input[type=checkbox]');
                    checkbox && (checkbox.checked = false);
                    return;
                }
            });

            matchingCrossSells.forEach((el, index) => {
                el.hidden = !expanded && index >= 3;
            });

            const hiddenCount = Math.max(0, matchingCrossSells.length - 3);
            const moreTextTemplate = showMoreEl.dataset.moreTextTemplate || showMoreEl.dataset.moreText || 'Show More';

            showMoreEl.hidden = matchingCrossSells.length <= 3;
            element.hidden = matchingCrossSells.length === 0;

            showMoreEl.innerText = expanded
                ? showMoreEl.dataset.lessText
                : moreTextTemplate.replace('%1', hiddenCount);
        }

        updateVisibility();

        form.addEventListener('product_variant_change', function (event) {
            productId = event.productId ? event.productId.toString() : options.productId;

            expanded = false;
            updateVisibility();
        });

        showMoreEl.addEventListener('click', function (event) {
            event.preventDefault();

            expanded = !expanded;
            updateVisibility();
        });
    };
});
