define(['jquery'], function($) {
    'use strict'

    return function(targetWidget) {
        $.widget('mage.configurable', targetWidget, {
            options: {
                emptyTierPricesMessage: $.mage.__('Select an option above to view quantity discounts'),
                defaultClassName: 'tier-price-default',
            },

            /**
             * Add "empty" state if no tier prices are displayed.
             */
            _displayTierPriceBlock: function(optionId) {
                var outputElement = document.querySelector(this.options.tierPriceBlockSelector)
                if (!outputElement) {
                    return this._super(optionId)
                }

                // if optionId is set a child has been selected
                if (optionId) {
                    outputElement.classList.remove(this.options.defaultClassName)
                    return this._super(optionId)
                }

                // if tier price present on child display default message
                for (var key in this.options.spConfig.optionPrices) {
                    if (this.options.spConfig.optionPrices[key].tierPrices.length) {
                        outputElement.classList.add(this.options.defaultClassName)
                        outputElement.innerText = this.options.emptyTierPricesMessage
                        break
                    }
                }
            }
        })

        return $.mage.configurable
    }
})
