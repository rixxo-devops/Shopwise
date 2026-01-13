define([
    'jquery',
    'underscore'
], function ($, _) {
    'use strict';

    const removeTrailingZeros = data => (!isNaN(+data)) ? parseFloat(data) : data;

    return function (options) {
        $('[data-role="swatch-options"]').on('change', function () {
            const product = $(this).data('mage-SwatchRenderer').getProduct()

            updateAttributes(product)
        });

        $('#product_addtocart_form').on('change', function () {
            if (!$(this).data('mage-configurable')) {
                return
            }

            const state = $(this).data('mage-configurable').options.state
            const products = $(this).data('mage-configurable').options.spConfig.index

            let selectedProduct = null

            for (const [product, configuration] of Object.entries(products)) {
                if (_.isEqual(state, configuration)) {
                    selectedProduct = product
                }
            }

            updateAttributes(selectedProduct)
        })

        function updateAttributes(productId) {
            const form = document.querySelector('#product_addtocart_form')
            const event = new Event('product_variant_change')
            event.productId = productId
            form.dispatchEvent(event)

            const labels = options.labels;
            const variant = options.variant;
            const parent = options.parent

            for (const code in parent) {
                const attrValueEl = document.querySelectorAll('[data-attswitch='+code+'], [itemprop="'+ code +'"]');

                if (!attrValueEl.length) {
                    continue;
                }

                const parentValue = parent[code]
                let label = null

                if (!productId) {
                    label = parentValue !== null ? removeTrailingZeros(parentValue) : labels.selectOption
                } else {
                    const value = variant[code][productId].value !== null
                        ? variant[code][productId].value
                        : parentValue

                    label = value !== null
                        ? removeTrailingZeros(value)
                        : options.notAvailable
                }

                if (code === 'next_day_delivery') {
                    attrValueEl.forEach(holder => {
                        holder.hidden = !(label === 'Yes' || label === '1' || label === 1);
                    });
                } else {
                    attrValueEl.forEach(holder => holder.innerHTML = label);
                }
            }

            if (variant['lead_time'][productId] && variant['lead_time'][productId].value) {
                let level = 0;

                switch (variant['lead_time'][productId].value) {
                    case '1-2 working days':
                    case '1-3 working days':
                    case '2-3 working days':
                    case '3-4 working days':
                        level = 1;
                        break;
                    case '3-5 working days':
                    case '3-7 working days':
                    case '5 working days':
                    case '5-7 working days':
                        level = 2;
                        break;
                    case '5-10 working days':
                    case '7-10 working days':
                    case '10 working days':
                        level = 3;
                        break;
                    case '10-14 working days':
                    case '10-15 working days':
                        level = 4;
                        break;
                    case '2-3 weeks':
                    case '3-4 weeks':
                        level = 5;
                        break;
                    default:
                        level = 0;
                }

                const leadTime = document.querySelectorAll('.attribute .product-item-lead-time');

                leadTime.forEach(leadTime => {
                    leadTime.className = "";
                    leadTime.classList.add('product-item-lead-time', 'product-item-lead-time--level-'+level);
                });
            }
        }

        updateAttributes()
    }
})
