var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/model/quote': {
                'KingfisherDirect_GA4EventTracking/js/checkout-events': true
            },
            'Magento_Checkout/js/action/set-shipping-information': {
                'KingfisherDirect_GA4EventTracking/js/checkout-shipping-event': true
            }
        }
    }
};
