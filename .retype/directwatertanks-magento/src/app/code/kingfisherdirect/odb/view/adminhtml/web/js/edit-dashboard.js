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
                template: 'Rixxo_Odb/edit-dashboard'
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                quoteTotals: '.actions-toolbar.bottom .totals',
                quoteItems: '.items .quoteItems',
                paymentMethodForm: '#paymentMethodForm',
                buttonDraft: 'button.save',
                buttonSend: 'button.send',
                buttonOrder: 'button.order'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;
                this.selectedStoreId = ko.observable();
                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';
                this.permissions = ko.observable();
                window.quote = ko.observableArray();

                this.initQuote();

                this.customerName = ko.observable('Please select or create a customer');
                this.customerEmail = ko.observable('No email address is available');
                this.customerTelephone = ko.observable('No telephone number is available');

                this.preventOrder = ko.observable(false);
            },

            initQuote: function()
            {
                this.permissions(this.config.permissions);
                this.selectedStoreId(this.config.quoteJson.store_id);
                window.quote({
                    quote_id: this.config.quoteJson.quote_id,
                    analysis_code: this.config.quoteJson.analysis_code,
                    status: this.config.quoteJson.status,
                    store_id: this.config.quoteJson.store_id,
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

                if(this.config.modules.Aheadworks_Ca) {
                    $('body').addClass('aw-ca-enabled');
                }

                setTimeout(function() {
                    self.checkButtonAvailability();
                    self.bindSubmitOrder();
                }, 1000);
            },

            hasPermission: function(permission)
            {
                return $.inArray(permission, this.permissions()) > -1;
            },

            bindSubmitOrder: function()
            {
                $(this.selectors.buttonOrder).on('submitOrder', function(data, event) {
                    self.submitOrder(data, event);
                })
            },

            bindTotals: function()
            {
                $(this.selectors.quoteTotals).on('updateQuoteTotals', function(data, event) {
                    self.updateQuoteTotals();
                })
            },

            bindCustomerDetails: function()
            {
                $('.actions-toolbar .customer-details').on('updateCustomerDetails', function(event) {
                    self.updateCustomerDetails();
                })
            },

            bindQuote: function()
            {
                var self = this;
                $(this.selectors.dashboard).on('saveQuote', function(data, event, updateTierPricing = false) {
                    self.saveQuote(false, updateTierPricing);
                });

                $(this.selectors.dashboard).on('setStoreId', function (event, storeId) {
                    self.selectedStoreId(storeId);
                    self.setStoreToQuote(storeId);
                });
            },

            updateCustomerDetails: function()
            {
                this.customerName(window.quote().customer.customer_firstname + ' ' + window.quote().customer.customer_lastname);
                this.customerEmail(window.quote().customer.customer_email);
                this.customerTelephone(window.quote().customer.telephone ?? 'No telephone number is available');
            },

            saveQuote: function(sendQuote = false, updateTierPricing = false)
            {
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
                                        item.tax_percent(result.quote.tax_percent[sku]);
                                        item.tier_prices(result.quote.tier_prices[sku]);
                                        item.catalog_rules(result.quote.catalog_rules[sku]);
                                        item.tier_price_applied(false);

                                        if(updateTierPricing) {
                                            $.each(result.quote.tier_prices[sku], function(index, tierPrice) {
                                                if(item.qty() >= parseInt(tierPrice.qty) && parseFloat(tierPrice.value)) {
                                                    item.custom_price(parseFloat(tierPrice.value));
                                                }
                                            });
                                        }

                                        var rulePrice;
                                        $.each(result.quote.catalog_rules[sku], function(index, catalogRule) {
                                            switch(catalogRule.operator) {
                                                case 'by_percent':
                                                    var percent = 100 - parseFloat(catalogRule.amount);
                                                    rulePrice = (item.price() / 100) * percent;
                                                    break;
                                                case 'to_percent':
                                                    rulePrice = (item.price() / 100) * parseFloat(catalogRule.amount);
                                                    break;
                                                case 'by_fixed':
                                                    rulePrice = item.price() - parseFloat(catalogRule.amount);
                                                    break;
                                                case 'to_fixed':
                                                    rulePrice = parseFloat(catalogRule.amount);
                                                    break;
                                            }

                                            if(rulePrice < item.custom_price()) {
                                                item.custom_price(parseFloat(rulePrice));
                                            }
                                        });

                                        item.discount(parseFloat(item.price() - item.custom_price()).toFixed(2));
                                        item.discount_percent(parseFloat(item.discount() / item.price() * 100).toFixed(2));
                                        item.tax(item.tax());
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

                        self.checkButtonAvailability();
                        self.updateQuoteTotals();

                        $('#order-shipping_method').trigger('updateShippingMethods');
                        $('#order-billing_method').trigger('updatePaymentMethods');
                    }
                });
            },

            saveDraft: function(element)
            {
                let result;

                if(window.quote().customer.customer_id) {
                    if(window.quote().items.length) {
                        $.ajax({
                            url: self.config.urls.save,
                            data: {
                                quote: self.compileQuote(),
                                type: 'draft',
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
                                    window.quote().quote_id = result.quote.quote_id;
                                    window.quote().status = result.quote.status;

                                    $(window.quote().items).each(function(index, item) {
                                        var sku = ko.isObservable(item.sku) ? item.sku() : item.sku;
                                        if(result.quote.items.hasOwnProperty(sku)) {
                                            if(ko.isObservable(item.item_id)) {
                                                item.item_id(result.quote.items[sku]);
                                            }
                                        }
                                    });

                                    window.location = self.config.urls.edit + 'id/' + result.quote.quote_id;
                                }
                            },
                            failure: function(response) {
                                result = JSON.parse(response);
                            },
                            complete: function() {
                                $('body').trigger('processStop');

                                self.checkButtonAvailability();
                            }
                        });

                    }
                    else {
                        alert('Please add items to the quote before saving');
                    }
                }
                else {
                    alert('Please add a Customer to the quote before saving');
                }
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
                $('[name="payment[method]"]:checked').each(function(e) {
                    window.quote().payment.method_code = $(this).val();
                    window.quote().payment.method_name = $(this).parents('.admin__field-option').find('label').text();
                });


                var quote = {
                    quote_id: window.quote().quote_id,
                    status: window.quote().status,
                    store_id: window.quote().store_id,
                    analysis_code: window.quote().analysis_code,
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
                        shipping_method_name: window.quote().shipping.shipping_method_name,
                        price: window.quote().shipping.price,
                    },
                    payment: {
                        method_code: window.quote().payment.method_code,
                        method_name: window.quote().payment.method_name,
                    },
                    comments: window.quote().comments,
                    delivery_instructions: window.quote().delivery_instructions,
                    warehouse_instructions: window.quote().warehouse_instructions,
                    totals: [],
                    expiration: {
                        days: window.quote().expiration.days,
                        date: window.quote().expiration.date
                    }
                };

                $(window.quote().items).each(function(index, item) {
                    var data = {
                        item_id: item.item_id(),
                        product_id: item.product_id(),
                        sku: item.sku(),
                        name: item.name(),
                        custom_options: item.hasOwnProperty('custom_options') && ko.isObservable(item.custom_options) ? item.custom_options() : false,
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

            validateOrder: function()
            {
                $('#billingAddressForm').submit();
            },

            submitOrder: function(data, event)
            {
                var paymentData = {};
                $('[name^="payment[method]"]:checked').each(function() {
                    paymentData['method'] = $(this).val();

                    $(this).parents('.admin__field-option').next('.admin__payment-method-wrapper').each(function(e) {
                        if($(this).find('[aria-invalid="true"]').length) {
                            alert('Error: Please check payment details');
                            $('html, body').animate({
                                scrollTop: $("#order-billing_method_form").offset().top
                            }, 500);
                            return;
                        }
                        $(this).find('[name^="payment"]').each(function(e) {
                            var firstPos = $(this).attr('name').indexOf('[') + 1;
                            var lastPos = $(this).attr('name').lastIndexOf(']');

                            var key = $(this).attr('name').substring(firstPos, lastPos);
                            paymentData[key] = $(this).val();
                        });
                    });
                });

                if($('input[name="order[shipping_method]"]:checked').length) {
                    if($('input[name="order[shipping_method]"]:checked').val() == 'odb_specialarrangement') {
                        if(!$('#arrange_shipping-special').val() || !window.quote().shipping.price) {
                            $('.selectedShippingMethod').show();
                        }
                    }
                    $('.selectedShippingMethod').hide();
                }
                else {
                    $('.selectedShippingMethod').show();
                }

                if($('input[name="payment[method]"]:checked').length) {
                  $('.selectedPaymentMethod').hide();
                }

                else {
                    $('.selectedPaymentMethod').show();
                    return false;
                }

                if(window.quote().customer.customer_id) {
                    if(window.quote().items.length) {
                        $.ajax({
                            url: self.config.urls.submit,
                            data: {
                                quote: self.compileQuote(),
                                payment: paymentData,
                                type: 'draft',
                                form_key: window.FORM_KEY
                            },
                            dataType: 'JSON',
                            method: 'post',
                            cache: false,
                            beforeSend: function () {
                                $('body').trigger('processStart');
                                if(self.preventOrder()) {
                                    return false;
                                }
                                self.preventOrder(true);
                            },
                            success: function (response) {
                                var result = JSON.parse(response);
                                self.preventOrder(false);
                                if(result.hasOwnProperty('success')) {
                                    location.href = result.order.url;
                                } else {
                                    location.href = self.config.urls.edit + 'id/' + window.quote().quote_id;
                                }
                            },
                            failure: function (response) {
                                var result = JSON.parse(response);
                                location.href = self.config.urls.edit + 'id/' + window.quote().quote_id;
                            },
                            error: function(response) {
                                alert('Error: The Order could not be created');
                            },
                            complete: function () {
                                $('body').trigger('processStop');
                            }
                        });


                    }
                    else {
                        alert('Please add items to the quote before saving');
                    }
                }
                else {
                    alert('Please add a Customer to the quote before saving');
                }

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

            checkButtonAvailability: function()
            {
                if(window.quote().items && window.quote().items.length && window.quote().customer.customer_id) {
                    $(self.selectors.buttonDraft).prop('disabled', false);
                    if(window.quote().shipping.shipping_method) {
                        $(self.selectors.buttonOrder).prop('disabled', false);
                        $(self.selectors.buttonSend).prop('disabled', false);
                    } else {
                        if(self.quoteIsVirtual()) {
                            $(self.selectors.buttonOrder).prop('disabled', false);
                            $(self.selectors.buttonSend).prop('disabled', false);
                        } else {
                            $(self.selectors.buttonOrder).prop('disabled', true);
                            $(self.selectors.buttonSend).prop('disabled', true);
                        }
                    }
                } else {
                    $(self.selectors.buttonDraft).prop('disabled', true);
                    $(self.selectors.buttonSend).prop('disabled', true);
                    $(self.selectors.buttonOrder).prop('disabled', true);
                }
            },

            quoteIsVirtual: function()
            {
                var hasVirtual = false;
                var hasWeight = false;

                $.each(window.quote().items, function(index, item) {
                    var type_id = ko.isObservable(item.type_id) ? item.type_id() : item.type_id;
                    if(!hasVirtual && type_id == 'virtual') {
                        hasVirtual = true;
                    } else {
                        hasWeight = true;
                    }
                });

                return hasVirtual && !hasWeight ? true : false;
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
            },

            setStoreToQuote: function(store_id){
                if(store_id){
                    if(!window.quote().store_id){
                        window.quote().store_id = store_id; 
                    }else{
                        if(window.quote().store_id != store_id){
                            window.quote().store_id = store_id;
                        }else{
                            window.quote().store_id = store_id; 
                        }
                    }
                }
            }
        });
    }
);
