define([
    'jquery',
    'uiComponent',
    'ko',
    'loader'
    ], function ($, Component, ko) {
        'use strict';

        var self;

        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/dashboard/view/shipping',

                shippingRateGroups: ko.observableArray(),
                shippingRateGroupCount: ko.observable(0),
                selectedShippingMethod: ko.observable(null),

                specialShippingPriceLabel: ko.observable('£0.00'),
                specialShippingPriceAmount: ko.observable(),
                specialShippingName: ko.observable()
            },
            selectors: {
                specialShippingPrice: '#price_shipping-special',
                specialShippingLabel: '#arrange_shipping-special',
                quoteTotals: '.actions-toolbar.bottom .totals'
            },

            initialize: function (config) {
                self = this;

                this._super();
                self.config = config;

                this.specialShippingPriceLabel(self.config.currencySymbol + '0.00');
                this.specialShippingAvailable = ko.observable(self.config.specialShippingAvailable == '1' ? 1 : 0 );

                setTimeout(function() {
                    self.initShipping();
                }, 400);
            },

            initShipping: function() {
                self.getShippingRates();

                if(window.quote().shipping.shipping_method == 'odb_specialarrangement') {
                    self.specialShippingPriceAmount(parseFloat(window.quote().shipping.price).toFixed(2));
                    self.specialShippingPriceLabel(self.config.currencySymbol + self.specialShippingPriceAmount());
                    self.specialShippingName(window.quote().shipping.shipping_method_name);
                    $(self.selectors.specialShippingPrice).attr('value', self.specialShippingPriceAmount());
                }
            },

            hasShippingMethod: function()
            {
                return window.quote().shipping.shipping_method ? true : false;
            },

            getShippingMethod: function()
            {
                return window.quote().shipping.shipping_method_name + ' - ' +
                    self.config.currencySymbol + parseFloat(window.quote().shipping.price).toFixed(2);
            },

            getShippingRates: function() {
                let result;

                $.ajax({
                    url: self.config.urls.getRates,
                    data: {
                        quote_id: window.quote().quote_id,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $('body').loader("show");
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.shippingRateGroups.removeAll();
                        self.shippingRateGroupCount(0);
                        self.selectedShippingMethod(null);

                        if(typeof result.shippingRates !== "undefined") {
                            self.shippingRateGroupCount(result.shippingRates.length);
                        }

                        if(self.shippingRateGroupCount() >= 1) {
                            $.each(result.shippingRates, function(carrierIdx, carrierData) {
                                $.each(carrierData.rates, function(rateIdx, rateData) {
                                    if(rateData.checked === true) {
                                        window.quote().shipping.shipping_method = rateData.rateCode;
                                        window.quote().shipping.shipping_method_name = rateData.title ? rateData.title : rateData.description;
                                        window.quote().shipping.price = rateData.price;

                                        self.selectedShippingMethod(
                                            window.quote().shipping.shipping_method
                                        );
                                    }
                                });

                                self.shippingRateGroups.push(carrierData);
                            });
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $('body').loader("hide");
                        if(window.quote().shipping.shipping_method == 'odb_specialarrangement') {
                            $('#s_method_special_arrangement').prop('checked', true);
                        }

                    }
                });
            },

            getSpecialShippingPrice: function(data, event)
            {
                 return self.specialShippingPriceAmount() ?? '';
            },

            updateShipping: function() {
                this.getShippingRates();
            },

            setShippingMethod: function(data)
            {
                window.quote().shipping.shipping_method = data.rateCode;
                window.quote().shipping.shipping_method_name = data.title ? data.title : data.description;
                window.quote().shipping.price = data.price;
                window.quote().totals.shipping(data.price);

                $('.selectedShippingMethod').hide();

                $(self.selectors.quoteTotals).trigger('updateQuoteTotals');

                $('section.odb-dashboard').trigger('saveQuote');

                return true;
            },

            setSpecialShippingMethod: function() {
                window.quote().shipping.shipping_method = 'odb_specialarrangement'
                self.toggleSpecialShippingFields();

                var priceValue = parseFloat($(this.selectors.specialShippingPrice).val()).toFixed(2);
                var titleValue = $.trim($(this.selectors.specialShippingLabel).val());

                if(titleValue && priceValue && priceValue != 'NaN') {
                    var data = {
                        rateCode: 'odb_specialarrangement',
                        price: priceValue,
                        title: titleValue
                    }

                    self.setShippingMethod(data);
                }

                return true;
            },

            toggleSpecialShippingFields: function() {
                if(self.selectedShippingMethod() == 'odb_specialarrangement') {
                    $(this.selectors.specialShippingPrice).show();
                    $(this.selectors.specialShippingLabel).show();
                }
                else {
                    $(this.selectors.specialShippingPrice).hide();
                    $(this.selectors.specialShippingLabel).hide();
                }
            },

            updateSpecialShipping: function() {
                let price = $(this.selectors.specialShippingPrice).val();

                this.specialShippingPriceLabel(
                    self.config.currencySymbol + parseFloat(price).toFixed(2)
                );
            }
        });
    }
);
