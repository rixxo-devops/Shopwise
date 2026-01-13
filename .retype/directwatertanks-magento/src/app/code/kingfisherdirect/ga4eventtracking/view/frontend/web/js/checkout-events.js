define([
    'KingfisherDirect_GA4EventTracking/js/prepare-checkout-event-data'
], function (prepareEventData) {
    'use strict';

    return function (quote) {
        if (!window.gtag) {
            return quote
        }

        window.gtag('event', 'begin_checkout', prepareEventData(quote));

        quote.paymentMethod.subscribe(function(paymentMethod) {
            window.gtag('event', 'add_payment_info', Object.assign(prepareEventData(quote), {
                payment_type: paymentMethod.method
            }));
        }, null, 'change');

        return quote;
    }
});
