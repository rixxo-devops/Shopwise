define([
    'knockout',
    'jquery',
    'mage/url',
    'Magento_Ui/js/form/form',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/url-builder',
    'Magento_Checkout/js/model/error-processor',
    'Magento_Checkout/js/model/cart/cache',
    'KingfisherDirect_Checkout/js/model/checkout/custom-checkout-form',
    'Magento_Checkout/js/model/shipping-service',
], function(ko, $, urlFormatter, Component, customer, quote, urlBuilder, errorProcessor, cartCache, formData, shippingService) {
    'use strict';

    return Component.extend({
        customFields: ko.observable(null),
        formData: formData.customFieldsData,

        /**
         * Initialize component
         *
         * @returns {exports}
         */
        initialize: function () {
            let self = this;
            this._super();
            formData = this.source.get('customCheckoutForm');
            let formDataCached = cartCache.get('custom-form');
            if (formDataCached) {
                formData = this.source.set('customCheckoutForm', formDataCached);
            }

            this.customFields.subscribe(function(change){
                self.formData(change);
            });

            return this;
        },

        isLoading: shippingService.isLoading,

        /**
         * Trigger save method if form is change
         */
        onFormChange: function () {
            this.saveCustomFields();
        },

        /**
         * Form submit handler
         */
        saveCustomFields: function() {
            this.source.set('params.invalid', false);
            this.source.trigger('customCheckoutForm.data.validate');

            if (!this.source.get('params.invalid')) {
                let formData = this.source.get('customCheckoutForm');
                let quoteId = quote.getQuoteId();
                let isCustomer = customer.isLoggedIn();
                let url;

                if (isCustomer) {
                    url = urlBuilder.createUrl('/carts/mine/set-order-custom-fields', {});
                } else {
                    url = urlBuilder.createUrl('/guest-carts/:cartId/set-order-custom-field', {cartId: quoteId});
                }

                let payload = {
                    cartId: quoteId,
                    customFields: formData
                };
                let result = true;
                $.ajax({
                    url: urlFormatter.build(url),
                    data: JSON.stringify(payload),
                    global: false,
                    contentType: 'application/json',
                    type: 'PUT',
                    async: true
                }).done(
                    function (response) {
                        cartCache.set('custom-form', formData);
                        result = true;
                    }
                ).fail(
                    function (response) {
                        result = false;
                        errorProcessor.process(response);
                    }
                );

                return result;
            }
        }
    });
});
