/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define(['uiComponent'], function (Component) {
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
            displayArea: 'after_details',
            template: 'KingfisherDirect_LeadTime/summary/item/details/lead-time'
        },

        getLeadTime: function(itemId) {
            return getItem(itemId).lead_time
        },

        getNextDayDelivery: function(itemId) {
            return getItem(itemId).next_day_delivery
        }
    });
});
