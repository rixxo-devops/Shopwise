define([
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/cart/totals-processor/default',
], function (
    quote,
    totalsDefaultProvider
) {
    'use strict';

    return function (Shipping) {
        return Shipping.extend({
            initialize: function () {
                this._super();

                var lastShippingMethod = quote.shippingMethod()

                quote.shippingMethod.subscribe(function () {
                    var shippingMethod = quote.shippingMethod()

                    if (!shippingMethod
                        || !shippingMethod['method_code']
                        || lastShippingMethod === shippingMethod
                    ) {
                        return
                    }

                    lastShippingMethod = shippingMethod
                    totalsDefaultProvider.estimateTotals(quote.shippingAddress())
                });
            }
        });
    }
});
