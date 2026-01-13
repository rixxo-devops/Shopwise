define([
    'mage/utils/wrapper',
    'Magento_Checkout/js/model/quote',
    'KingfisherDirect_GA4EventTracking/js/prepare-checkout-event-data',
], function (wrapper, quote, prepareEventData) {
    return function (target) {
        if (!window.gtag) {
            return target
        }

        return wrapper.wrap(target, function (orig) {
            const result = orig()

            window.gtag('event', 'add_shipping_info', Object.assign(prepareEventData(quote), {
                shipping_tier: quote.shippingMethod().method_title
            }));

            return result
        })
    }
})
