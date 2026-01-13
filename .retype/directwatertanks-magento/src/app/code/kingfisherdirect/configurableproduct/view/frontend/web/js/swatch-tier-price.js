define(['jquery'], function($) {
    'use strict'

    return function (widget) {
        $.widget('mage.SwatchRenderer', widget, {
            options: {
                emptyTierPricesMessage: $.mage.__('Select an option above to view quantity discounts'),
                noTierPricesMessage: $.mage.__('This configuration doesn\'t have quantity discount'),
            },

            _init() {
                this._super()
                this.updateTierPricesEmptyState()
            },

            _UpdatePrice() {
                this._super(...arguments)
                this.updateTierPricesEmptyState()
            },

            updateTierPricesEmptyState() {
                const tierPriceEl = document.querySelector(this.options.tierPriceBlockSelector)

                if (!tierPriceEl) {
                    return
                }

                if (!tierPriceEl.innerText || tierPriceEl.style.display === "none") {
                    tierPriceEl.style.display = null
                    tierPriceEl.innerText = this.getProduct()
                        ? this.options.noTierPricesMessage
                        : this.options.emptyTierPricesMessage
                }
            }
        });

        return $.mage.SwatchRenderer;
    }
});
