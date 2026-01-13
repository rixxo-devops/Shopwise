define([
    'jquery',
    'Magento_Customer/js/customer-data'
], function($, customerData) {
    'use strict';

    return function (options, element) {
        if (!window.gtag) {
            return
        }

        window.gtag('event', 'view_item', {
            currency: options.currency,
            value: options.item.price,
            items: [{
                ...options.item,
            }]
        })

        $(document).on('ajax:addToCart', function (event, data) {
            var formData = new FormData(data.form[0])

            var quantity = formData.get('qty')
            var addedProductId = data.productIds[0]

            var subscription = customerData.get('cart').subscribe(function (cart) {
                var addedProductInCart = cart.items.find(item => item.product_id === addedProductId)

                // unsubscribes this listener from further cart updates
                // this was needed one-time only
                subscription.dispose()

                if (!addedProductInCart) {
                    return
                }

                window.gtag('event', 'add_to_cart', {
                    currency: options.currency,
                    value: addedProductInCart.product_price_value.incl_tax * quantity,
                    items: [{
                        ...options.item,
                        item_variant: addedProductInCart.product_sku,
                        price: addedProductInCart.product_price_value.incl_tax,
                        quantity,
                    }]
                })
            })
        });
    }
});
