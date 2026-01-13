define([
        'jquery',
        'Magento_Customer/js/model/authentication-popup',
        'Magento_Customer/js/customer-data',
    ],
    function($, authenticationPopup, customerData) {
        'use strict';
        return function (widget) {
            $.widget('mage.sidebar', widget, {
                _initContent: function () {
                    this._super();

                    // Unbind click event handlers
                    this._off(this.element, 'click');

                    // Rebind modified handlers
                    var self = this,
                        events = {};

                    /**
                     * @param {jQuery.Event} event
                     */
                    events['click ' + this.options.button.close] = function (event) {
                        event.stopPropagation();
                        $(self.options.targetElement).dropdownDialog('close');
                    };
                    events['click ' + this.options.button.checkout] = $.proxy(function () {
                        var cart = customerData.get('cart'),
                            customer = customerData.get('customer'),
                            element = $(this.options.button.checkout);

                        if (!customer().firstname && cart().isGuestCheckoutAllowed === false) {
                            // set URL for redirect on successful login/registration. It's postprocessed on backend.
                            $.cookie('login_redirect', this.options.url.checkout);

                            if (this.options.url.isRedirectRequired) {
                                element.prop('disabled', true);
                                location.href = this.options.url.loginUrl;
                            } else {
                                authenticationPopup.showModal();
                            }

                            return false;
                        }
                        element.prop('disabled', true);
                        location.href = this.options.url.checkout;
                    }, this);

                    /**
                     * @param {jQuery.Event} event
                     */
                    events['click ' + this.options.button.remove] =  function (event) {
                        event.stopPropagation();
                        self._removeItem($(event.currentTarget));
                    };

                    /**
                     * @param {jQuery.Event} event
                     */
                    events['click ' + this.options.item.button] = function (event) {
                        event.stopPropagation();
                        self._updateItemQty($(event.currentTarget));
                    };

                    this._on(this.element, events);
                },
            });
            return $.mage.sidebar;
        }
    }
);