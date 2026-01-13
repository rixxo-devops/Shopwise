define(['uiComponent'], function (Component) {
    'use strict';

    return Component.extend({
        defaults: {
            displayArea: 'after_details',
            template: 'Magento_Checkout/summary/item/detail-sku'
        },

        getSku: function(itemId) {
            const item = window.checkoutConfig.quoteItemData.find(i => i.item_id == itemId)

            return item ? item.sku : null
        },
    });
});
