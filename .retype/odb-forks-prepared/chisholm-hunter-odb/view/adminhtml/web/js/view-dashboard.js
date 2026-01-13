define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal'
    ], function ($, Component, ko, modal) {
        'use strict';

        var self;

        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/view-dashboard'
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                quoteTotals: '.actions-toolbar.bottom .totals',
                quoteItems: '.items .quoteItems'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.permissions = ko.observable();
                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';
                window.quote = ko.observableArray();

                this.initQuote();

                this.customerName = ko.observable('Please select or create a customer');
                this.customerEmail = ko.observable('No email address is available');
                this.customerTelephone = ko.observable('No telephone number is available');

                setTimeout(function() {
                    self.setViewMode();
                }, 500)
            },

            setViewMode: function()
            {
                $('.odb-dashboard').find('input, select, textarea, #showCreateCustomer').each(function() {
                    $(this).prop('disabled', 'disabled');
                });
            },

            getQuoteStatus: function()
            {
                return window.quote().status;
            },

            duplicateQuote: function()
            {
                var self = this;
                let result;


                $.ajax({
                    url: self.config.urls.duplicate,
                    data: {
                        quote_id: window.quote().quote_id,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $('body').trigger('processStart');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        if(!result.error) {
                            if(result.hasOwnProperty('quote')) {
                                if(result.quote.hasOwnProperty('quote_id')) {
                                    window.location.href = self.config.urls.edit + 'id/' + result.quote.quote_id;
                                }
                            }
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $('body').trigger('processStop');
                    }
                });
            },

            initQuote: function()
            {
                this.permissions(this.config.permissions);

                window.quote({
                    quote_id: this.config.quoteJson.quote_id,
                    status: this.config.quoteJson.status,
                    config_price_tax: this.config.quoteJson.config_price_tax,
                    customer: this.config.quoteJson.customer,
                    items: this.config.quoteJson.items,
                    addresses: {
                        billing: {
                            address_id: this.config.quoteJson.addresses.billing,
                        },
                        shipping: {
                            address_id: this.config.quoteJson.addresses.shipping
                        }
                    },
                    shipping: this.config.quoteJson.shipping,
                    payment: this.config.quoteJson.payment,
                    comments: this.config.quoteJson.comments,
                    delivery_instructions: this.config.quoteJson.delivery_instructions,
                    warehouse_instructions: this.config.quoteJson.warehouse_instructions,
                    totals: {
                        subtotal: ko.observable(parseFloat(this.config.quoteJson.totals.subtotal).toFixed(2)),
                        shipping: ko.observable(parseFloat(this.config.quoteJson.totals.shipping).toFixed(2)),
                        tax: ko.observable(parseFloat(this.config.quoteJson.totals.tax).toFixed(2)),
                        grand_total: ko.observable(parseFloat(this.config.quoteJson.totals.grand_total).toFixed(2)),
                        grand_total_ex_vat: ko.observable(parseFloat(this.config.quoteJson.totals.grand_total - this.config.quoteJson.totals.tax).toFixed(2))
                    },
                    modules: {
                        Aheadworks_Ca: this.config.modules.hasOwnProperty('Aheadworks_Ca') ? this.config.modules.Aheadworks_Ca : false
                    },
                    expiration: {
                        days: this.config.quoteJson.expiration.days,
                        date: this.config.quoteJson.expiration.date
                    }
                });
            },

            hasPermission: function(permission)
            {
                return $.inArray(permission, this.permissions()) > -1;
            },

            bindTotals: function()
            {
                var self = this;

                $(this.selectors.quoteTotals).on('updateQuoteTotals', function(data, event) {
                    self.updateQuoteTotals();
                })
            },

            bindCustomerDetails: function()
            {
                var self = this;

                $('.actions-toolbar .customer-details').on('updateCustomerDetails', function(event) {
                    self.updateCustomerDetails();
                })
            },

            bindQuote: function()
            {
                var self = this;

                $(this.selectors.dashboard).on('saveQuote', function(data, event) {
                    self.saveQuote();
                });

            },

            updateCustomerDetails: function()
            {
                this.customerName(window.quote().customer.customer_firstname + ' ' + window.quote().customer.customer_lastname);
                this.customerEmail(window.quote().customer.customer_email);
                this.customerTelephone(window.quote().customer.telephone ?? 'No telephone number is available');
            },

            editQuote: function()
            {
                $('body').trigger('processStart');
                window.location = self.config.urls.edit + 'id/' + window.quote().quote_id;
            },

            saveQuote: function(sendQuote = false)
            {
                var self = this;
                var result;

                var data = {
                    quote: self.compileQuote(),
                    form_key: window.FORM_KEY,
                    type: 'auto',
                }

                if(sendQuote) {
                    data['sendQuote'] = true;
                }

                $.ajax({
                    url: self.config.urls.save,
                    data: data,
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    async: false,
                    beforeSend: function() {
                        if(sendQuote) {
                            $('body').trigger('processStart');
                        }
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        if(!result.error) {
                            window.quote().quote_id = result.quote.quote_id;
                            window.quote().status = result.quote.status;
                            window.quote().addresses.billing.address_id = result.quote.addresses.billing;
                            window.quote().addresses.shipping.address_id = result.quote.addresses.shipping;

                            $(window.quote().items).each(function(index, item) {
                                var sku = ko.isObservable(item.sku) ? item.sku() : item.sku;
                                if(result.quote.items.hasOwnProperty(sku)) {
                                    if(ko.isObservable(item.item_id)) {
                                        item.item_id(result.quote.items[sku]);
                                    }
                                }
                            });

                            $('.items .quoteItems').trigger('updateQuoteItemsAfterSave');
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        if(sendQuote) {
                            $('body').trigger('processStop');
                            document.location.href = self.config.urls.index;
                        }

                        $('#order-shipping_method').trigger('updateShippingMethods');
                        $('#order-billing_method').trigger('updatePaymentMethods');
                    }
                });
            },

            sendQuote: function(element)
            {
                this.saveQuote(true);
            },


            updateQuoteTotals: function()
            {
                var shipping = parseFloat(window.quote().totals.shipping()) ?? 0.00;
                var subtotal = 0.00;
                var tax = 0.00;
                var configPriceTax = window.quote().config_price_tax;
                $.each(window.quote().items, function(index, item) {
                    subtotal = subtotal + parseFloat(item.row_total());
                    tax = tax + parseFloat(item.tax());
                });

                if(configPriceTax){
                    window.quote().totals.subtotal(subtotal.toFixed(2));
                    window.quote().totals.tax(tax.toFixed(2));
                    window.quote().totals.shipping(shipping.toFixed(2));
    
                    var grandTotal = parseFloat(subtotal) + parseFloat(shipping);
                    var grandTotalExVat = parseFloat(subtotal + shipping - tax).toFixed(2);
                    window.quote().totals.grand_total_ex_vat(grandTotalExVat);
                    window.quote().totals.grand_total(grandTotal);
                }else{
                    window.quote().totals.subtotal(subtotal.toFixed(2));
                    window.quote().totals.tax(tax.toFixed(2));
                    window.quote().totals.shipping(shipping.toFixed(2));
    
                    var grandTotal = parseFloat(subtotal) + parseFloat(tax) + parseFloat(shipping);
                    var grandTotalExVat = parseFloat(subtotal + shipping).toFixed(2);
                    window.quote().totals.grand_total_ex_vat(grandTotalExVat);
                    window.quote().totals.grand_total(grandTotal);
                }
            },

            compileQuote: function()
            {
                var quote = {
                    quote_id: window.quote().quote_id,
                    status: window.quote().status,
                    title: window.quote().title,
                    customer: window.quote().customer,
                    items: [],
                    addresses: {
                        billing: {
                            address_id: window.quote().addresses.billing.address_id,
                            first_name: $(window.addressSelectors.billingFirstName).val(),
                            last_name: $(window.addressSelectors.billingLastName).val(),
                            street_1: $(window.addressSelectors.billingStreet1).val(),
                            street_2: $(window.addressSelectors.billingStreet2).val(),
                            city: $(window.addressSelectors.billingCity).val(),
                            postcode: $(window.addressSelectors.billingPostcode).val(),
                            telephone: $(window.addressSelectors.billingTelephone).val(),
                            country: $(window.addressSelectors.billingCountry).val(),
                        },
                        shipping: {
                            address_id: window.quote().addresses.shipping.address_id,
                            first_name: $(window.addressSelectors.shippingFirstName).val(),
                            last_name: $(window.addressSelectors.shippingLastName).val(),
                            street_1: $(window.addressSelectors.shippingStreet1).val(),
                            street_2: $(window.addressSelectors.shippingStreet2).val(),
                            city: $(window.addressSelectors.shippingCity).val(),
                            postcode: $(window.addressSelectors.shippingPostcode).val(),
                            telephone: $(window.addressSelectors.shippingTelephone).val(),
                            country: $(window.addressSelectors.shippingCountry).val(),
                        }
                    },
                    shipping: {
                        shipping_method: window.quote().shipping.shipping_method,
                        method_name: window.quote().shipping.method_name,
                        price: window.quote().shipping.price,
                    },
                    payment: {
                        method_code: window.quote().payment.method_code,
                        method_title: window.quote().payment.method_title,
                    },
                    comments: window.quote().comments,
                    delivery_instructions: window.quote().delivery_instructions,
                    warehouse_instructions: window.quote().warehouse_instructions,
                    totals: []
                };

                $(window.quote().items).each(function(index, item) {
                    var data = {
                        item_id: item.item_id(),
                        product_id: item.product_id(),
                        sku: item.sku(),
                        name: item.name(),
                        image_url:item.image_url(),
                        qty: item.qty(),
                        price: item.price(),
                        custom_price: item.custom_price(),
                        cost_price: item.cost_price(),
                        discount: item.discount(),
                        discount_percent: item.discount_percent(),
                        tax: item.tax(),
                        tax_percent: item.tax_percent(),
                        row_total: item.row_total(),
                        comments: item.comments()
                    };

                    quote.items.push(data);
                });

                return quote;
            },

            submitOrder: function(data, event)
            {

            },

            deleteQuote: function(data, event)
            {
                if(window.quote().quote_id) {
                    var deleteUrl = this.config.urls.delete + 'id/' + window.quote().quote_id;
                    document.location.href = deleteUrl;
                }
                else {
                    document.location.href = this.config.urls.index;
                }
            },

            currencyFormat: function(price, includeSymbol = true)
            {
                if(price) {
                    var result = '';

                    if(includeSymbol) {
                        result += this.config.currencySymbol;
                    }
                    result += parseFloat(price).toFixed(2);

                    return  result;
                }

                return '';
            }
        });
    }
);
