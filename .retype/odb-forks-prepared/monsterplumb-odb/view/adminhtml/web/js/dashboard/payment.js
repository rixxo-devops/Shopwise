 define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'loader',
    'jquery/validate',
    'mage/translate',
    'prototype',
    'Magento_Ui/js/lib/view/utils/async'
    ], function (jQuery, Component, ko, modal) {
        'use strict';

        var self;
        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/dashboard/payment',

                countPaymentMethods: ko.observable(0),
                paymentMethodData: ko.observableArray(),
                paymentMethodAcknowledgementEnabled: ko.observable(),
                paymentMethodAcknowledgementMethods: ko.observableArray(),
                paymentMethodAcknowledgedMethods: ko.observableArray(),
            },
            selectors: {

            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.loadBaseUrl = config.urls.loadBlock;
                this.customerId = false;
                this.storeId = config.storeId;
                this.currencyId = false;
                this.excludedPaymentMethods = [];

                setTimeout(function() {
                    self.initPayments();
                }, 250);
            },

            initPayments: function() {
                self.getPaymentMethods();
                self.paymentMethodAcknowledgementEnabled(self.config.CCAcknowledgementEnabled);

                if(this.config.CCAcknowledgementEnabled == 1) {
                    jQuery(this.config.CCAcknowledgementMethods).each(function(code, data) {
                        self.paymentMethodAcknowledgementMethods.push(data);
                    });
                }
            },

            hasPaymentMethod: function()
            {
                return window.quote().payment.method_code ? true : false;
            },

            getPaymentMethod: function()
            {
                return window.quote().payment.method_name;
            },

            getPaymentMethods: function() {
                let result;

                jQuery.ajax({
                    url: self.config.urls.getMethods,
                    data: {
                        quote_id: window.quote().quote_id,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        jQuery('body').loader("show");
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.paymentMethodData.removeAll();

                        self.countPaymentMethods(
                            Object.keys(result.paymentMethods.methods).length
                        );

                        jQuery.each(result.paymentMethods.methods, function(index, data) {
                            self.paymentMethodData.push(data);
                        });

                        this.customerId = result.paymentMethods.customerId;
                        this.storeId = result.paymentMethods.storeId;
                        this.currencyId = result.paymentMethods.currencyId; //ToDo: Load from controller
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        jQuery('body').loader("hide");
                    }
                });
            },

            updatePayments: function() {
                self.getPaymentMethods();
            },

            selectPaymentMethod: function(methodObj) {
                jQuery('#paymentMethodSelected').hide();
                self.switchPaymentMethod(methodObj.code);

                if(self.config.CCAcknowledgementEnabled) {
                    console.log(self.paymentMethodAcknowledgementMethods());
                    console.log(methodObj.code, self.paymentMethodAcknowledgementMethods());
                    if(self.paymentMethodAcknowledgementMethods.indexOf(methodObj.code) !== -1 && self.paymentMethodAcknowledgedMethods.indexOf(methodObj.code) == -1) {
                        self.paymentMethodAcknowledgedMethods.push(methodObj.code);
                        self.showRecordingWarning(methodObj.code);
                    }
                }

                return true;
            },

            showRecordingWarning: function(code) {
                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    buttons: [
                        {
                            text: jQuery.mage.__('Acknowledge'),
                            class: 'action-default dashboard-button',
                            click: function (){
                                this.closeModal();
                            }
                        }
                    ]
                };

                modal(options, jQuery('#section-payment-dashboard-modal'));

                jQuery('#section-payment-dashboard-modal').modal("openModal");
            },

            switchPaymentMethod: function(method) {
                self.showPaymentUnderlay($('payment_form_' + method));
                if (this.paymentMethod !== method) {
                    jQuery('#odb-submit-order').prop('disabled', false);
                }

                jQuery('#edit_form').trigger('changePaymentMethod', [method]);
                self.setPaymentMethod(method);
                var data = {};
                data['order[payment_method]'] = method;
                self.loadArea(['card_validation'], true, data);
            },

            setPaymentMethod: function (method) {
                if (this.paymentMethod && $('payment_form_' + this.paymentMethod)) {
                    var form = 'payment_form_' + this.paymentMethod;
                    [form + '_before', form, form + '_after'].each(function (el) {
                        var block = $(el);
                        if (block) {
                            block.hide();
                            block.select('input', 'select', 'textarea').each(function (field) {
                                field.disabled = true;
                            });
                        }
                    });
                }

                if (!this.paymentMethod || method) {
                    $('order-billing_method_form').select('input', 'select', 'textarea').each(function (elem) {
                        if (elem.type != 'radio') elem.disabled = true;
                    });
                    if(method) {
                        this.paymentMethod = method;
                    }
                }

                if ($('payment_form_' + method)) {
                    jQuery('#' + this.getAreaId('billing_method')).trigger('contentUpdated');
                    this.paymentMethod = method;
                    var form = 'payment_form_' + method;
                    [form + '_before', form, form + '_after'].each(function (el) {
                        var block = $(el);
                        if (block) {
                            block.show();
                            block.select('input', 'select', 'textarea').each(function (field) {
                                field.disabled = false;
                                if (!el.include('_before') && !el.include('_after') && !field.bindChange) {
                                    field.bindChange = true;
                                    field.paymentContainer = form;
                                    field.method = method;
                                    field.observe('change', this.changePaymentData.bind(this))
                                }
                            }, this);
                        }
                    }, this);
                }

                window.quote().payment.method_code = method;
                window.quote().payment.method_title = jQuery('#p_method_' + method).siblings('label').text();
                jQuery('.selectedPaymentMethod').hide();
            },

            showPaymentUnderlay: function(method) {
                jQuery('#payment-underlay').bind('click', function() {
                    self.hidePaymentUnderlay();
                });
                jQuery('body').addClass('payment-underlay-active');
                jQuery('#payment-underlay').show(500);
            },

            hidePaymentUnderlay: function() {
                jQuery('.modals-overlay').hide(500);
                jQuery('#section-payment-dashboard-modal').parents('aside').hide();
                jQuery('body').removeClass('payment-underlay-active');
                jQuery('#payment-underlay').hide(500);
            },

            changePaymentData: function (event) {
                var elem = Event.element(event);
                if (elem && elem.method) {
                    var data = this.getPaymentData(elem.method);
                    if (data) {
                        this.loadArea(['card_validation'], true, data);
                    } else {
                        return;
                    }
                }
            },

            getPaymentData: function (currentMethod) {
                if (typeof (currentMethod) == 'undefined') {
                    if (this.paymentMethod) {
                        currentMethod = this.paymentMethod;
                    } else {
                        return false;
                    }
                }
                if (this.isPaymentValidationAvailable() == false) {
                    return false;
                }
                var data = {};
                var fields = $('payment_form_' + currentMethod).select('input', 'select');
                for (var i = 0; i < fields.length; i++) {
                    data[fields[i].name] = fields[i].getValue();
                }
                if ((typeof data['payment[cc_type]']) != 'undefined' && (!data['payment[cc_type]'] || !data['payment[cc_number]'])) {
                    return false;
                }
                return data;
            },

            loadArea: function (area, indicator, params) {
                var deferred = new jQuery.Deferred();
                var url = this.loadBaseUrl;
                if (area) {
                    url += 'block/' + area;
                }
                if (indicator === true) indicator = 'html-body';
                params = this.prepareParams(params);
                params.json = true;
                if (!this.loadingAreas) this.loadingAreas = [];
                if (indicator) {
                    this.loadingAreas = area;
                    new Ajax.Request(url, {
                        parameters: params,
                        loaderArea: indicator,
                        onSuccess: function (transport) {
                            var response = transport.responseText.evalJSON();
                            this.loadAreaResponseHandler(response);
                            deferred.resolve();
                        }.bind(this)
                    });
                } else {
                    new Ajax.Request(url, {
                        parameters: params,
                        loaderArea: indicator,
                        onSuccess: function (transport) {
                            deferred.resolve();
                        }
                    });
                }
                if (typeof productConfigure != 'undefined' && area instanceof Array && area.indexOf('items') != -1) {
                    productConfigure.clean('quote_items');
                }
                return deferred.promise();
            },

            isPaymentDisabled: function() {
                return window.quote().shipping.shipping_method ? false : true;
            },

            loadAreaResponseHandler: function (response) {
                if (response.error) {
                    alert({
                        content: response.message
                    });
                }
                if (response.ajaxExpired && response.ajaxRedirect) {
                    setLocation(response.ajaxRedirect);
                }
                if (!this.loadingAreas) {
                    this.loadingAreas = [];
                }
                if (typeof this.loadingAreas == 'string') {
                    this.loadingAreas = [this.loadingAreas];
                }
                if (this.loadingAreas.indexOf('message') == -1) {
                    this.loadingAreas.push('message');
                }
                if (response.header) {
                    jQuery('.page-actions-inner').attr('data-title', response.header);
                }

                for (var i = 0; i < this.loadingAreas.length; i++) {
                    var id = this.loadingAreas[i];
                    if ($(this.getAreaId(id))) {
                        if ((id in response) && id !== 'message' || response[id]) {
                            $(this.getAreaId(id)).update(response[id]);
                        }
                        if ($(this.getAreaId(id)).callback) {
                            this[$(this.getAreaId(id)).callback]();
                        }
                    }
                }
            },

            prepareParams: function (params) {
                if (!params) {
                    params = {};
                }
                if (!params.customer_id) {
                    params.customer_id = this.customerId;
                }
                if (!params.store_id) {
                    params.store_id = this.storeId;
                }
                if (!params.currency_id) {
                    params.currency_id = this.currencyId;
                }
                if (!params.form_key) {
                    params.form_key = FORM_KEY;
                }

                if (this.isPaymentValidationAvailable()) {
                    // Serialize is not working
                    var data = this.serializeData('order-billing_method');
                    if (data) {
                        data.each(function (value) {
                            params[value[0]] = value[1];
                        });
                    }
                } else {
                    params['payment[method]'] = this.paymentMethod;
                }
                return params;
            },

            getAreaId: function (area) {
                return 'order-' + area;
            },

            /**
             * Prevent from sending credit card information to server for some payment methods
             *
             * @returns {boolean}
             */
            isPaymentValidationAvailable: function () {
                return ((typeof this.paymentMethod) == 'undefined'
                    || this.excludedPaymentMethods.indexOf(this.paymentMethod) == -1);
            },

            addExcludedPaymentMethod: function (method) {
                this.excludedPaymentMethods.push(method);
            },

            /**
             * Serializes container form elements data.
             *
             * @param {String} container
             * @return {Object}
            */
            serializeData: function (container) {
                var fields = $(container).select('input', 'select', 'textarea');
                var data = Form.serializeElements(fields, true);

                return $H(data);
            },

        });
    }
);
