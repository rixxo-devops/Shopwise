define([
    'uiComponent',
    'escaper'
], function (Component, escaper) {
    'use strict';

    var items = {}

    // Gets QuoteItemData from QuoteItem Object
    var getItem = function (itemId) {
        if (items[itemId]) {
            return items[itemId]
        }

        window.checkoutConfig.quoteItemData.forEach(function(item) {
            if (item.item_id == itemId) {
                items[itemId] = item
            }
        });

        return items[itemId]
    }

    return Component.extend({
        defaults: {
            template: 'Magento_Checkout/summary/item/details',
            allowedTags: ['b', 'strong', 'i', 'em', 'u']
        },

        /**
         * @param {Object} quoteItem
         * @return {String}
         */
        getNameUnsanitizedHtml: function (quoteItem) {
            var txt = document.createElement('textarea');

            txt.innerHTML = quoteItem.name;

            return escaper.escapeHtml(txt.value, this.allowedTags);
        },

        /**
         * @param {Object} quoteItem
         * @return {String}Magento_Checkout/js/region-updater
         */
        getValue: function (quoteItem) {
            return quoteItem.name;
        },

        getSku: function(itemId) {
            return getItem(itemId).sku
        },

        getLeadTime: function(itemId) {
            return getItem(itemId).lead_time
        },

        getNextDayDelivery: function(itemId) {
            return getItem(itemId).next_day_delivery
        },
    });
});
