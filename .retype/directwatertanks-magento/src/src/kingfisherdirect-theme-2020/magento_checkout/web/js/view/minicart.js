/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'uiComponent',
    'Magento_Customer/js/customer-data',
    'jquery',
    'ko',
    'underscore',
    'js/toggle-class',
    'Magento_Ui/js/modal/confirm',
    'Magento_Ui/js/modal/alert',
    'mage/translate',
    'mage/dropdown',
], function (Component, customerData, $, ko, _, toggleClass, confirm, alert) {
    'use strict';

    var sidebarInitialized = false,
        addToCartCalls = 0;

    var miniCartEls = document.querySelectorAll('[data-block=\'minicart\']');
    var miniCart = $(miniCartEls);

    var options = {
        'url': {
            'checkout': window.checkout.checkoutUrl,
            'update': window.checkout.updateItemQtyUrl,
            'remove': window.checkout.removeItemUrl,
            'loginUrl': window.checkout.customerLoginUrl,
            'isRedirectRequired': window.checkout.isRedirectRequired
        },
        'confirmMessage': $.mage.__('Are you sure you would like to remove this item from the shopping cart?')
    };

    var toggleBasketOpenClass = toggleClass({
        targets: [document.body],
        class: "minicart-open",
        overlayDismiss: "true",
    });

    var api = {
        open: toggleBasketOpenClass.add,
        close: toggleBasketOpenClass.remove,
        toggle: toggleBasketOpenClass.toggle,
        removeProduct: function (itemId) {
            return ajaxPost(
                options.url.remove, {
                    'item_id': itemId
                }
            );
        },
        updateProductQuantity: function (itemId, quantity) {

        }
    };

    Array.prototype.forEach.call(miniCartEls, (function (minicartEl) {
        minicartEl.addEventListener('click', function (event) {
            var el = event.target

            do {
                // checkout button
                if (el.classList.contains('action')) {
                    if (el.classList.contains('checkout')) {
                        event.preventDefault()

                        location.href = options.url.checkout
                        api.close();

                        return
                    }

                    if (el.classList.contains('delete')) {
                        var itemId = el.dataset.cartItem

                        confirm({
                            content: options.confirmMessage,
                            actions: {
                                /** @inheritdoc */
                                confirm: function () {
                                    api.removeProduct(itemId)
                                        .fail(alertError)
                                        .done(function () {
                                            window.location.reload()
                                        })
                                },
                            }
                        });
                    }
                }

                // data-action elements
                if (el.dataset.action && api[el.dataset.action]) {
                    api[el.dataset.action]()
                    event.preventDefault()
                    return
                }


                // reached the topmost element, no need to handle anything else
                if (el === minicartEl.parentElement) {
                    return
                }
            } while (el = el.parentElement)
        })
    }));

    function ajaxPost (url, data) {
        $.extend(data, {
            'form_key': $.mage.cookies.get('form_key')
        });

        return $.ajax({
            url: url,
            data: data,
            type: 'post',
            dataType: 'json',
            context: this,
        })
            .then(function (response) {
                if (response.success) {
                    return response
                }

                return new $.Deferred().reject(response)
            });
    }

    function alertError (response) {
        if (response.success !== false) {
            return
        }

        var msg = response['error_message'];

        if (msg) {
            alert({
                content: msg
            });

            return
        }
    }

    /**
     * @return {Boolean}
     */
    function initSidebar() {
        // if (miniCart.data('mageSidebar')) {
        //     miniCart.sidebar('update');
        // }

        if (!document.querySelectorAll('[data-role=product-item]').length) {
            return false;
        }

        miniCart.trigger('contentUpdated');

        if (sidebarInitialized) {
            return false;
        }

        sidebarInitialized = true;
        // miniCart.sidebar({
        //     'targetElement': 'div.block.block-minicart',
        //     'url': {
        //         'checkout': window.checkout.checkoutUrl,
        //         'update': window.checkout.updateItemQtyUrl,
        //         'remove': window.checkout.removeItemUrl,
        //         'loginUrl': window.checkout.customerLoginUrl,
        //         'isRedirectRequired': window.checkout.isRedirectRequired
        //     },
        //     'button': {
        //         'checkout': '#top-cart-btn-checkout',
        //         'remove': '#mini-cart a.action.delete',
        //         'close': '#btn-minicart-close'
        //     },
        //     'showcart': {
        //         'parent': 'span.counter',
        //         'qty': 'span.counter-number',
        //         'label': 'span.counter-label'
        //     },
        //     'minicart': {
        //         'list': '#mini-cart',
        //         'content': '#minicart-content-wrapper',
        //         'qty': 'div.items-total',
        //         'subtotal': 'div.subtotal span.price',
        //         'maxItemsVisible': window.checkout.minicartMaxItemsVisible
        //     },
        //     'item': {
        //         'qty': ':input.cart-item-qty',
        //         'button': ':button.update-cart-item'
        //     },
        //     'confirmMessage': $.mage.__('Are you sure you would like to remove this item from the shopping cart?')
        // });
    }

    // miniCart.on('dropdowndialogopen', function () {
    //    initSidebar();
    // });

    return Component.extend({
        shoppingCartUrl: window.checkout.shoppingCartUrl,
        maxItemsToDisplay: window.checkout.maxItemsToDisplay,
        cart: {},

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        /**
         * @override
         */
        initialize: function () {
            var self = this,
                cartData = customerData.get('cart');

            this.update(cartData());
            cartData.subscribe(function (updatedCart) {
                addToCartCalls--;
                this.isLoading(addToCartCalls > 0);
                sidebarInitialized = false;
                this.update(updatedCart);
                initSidebar();
            }, this);
            $('[data-block="minicart"]').on('contentLoading', function () {
                addToCartCalls++;
                self.isLoading(true);
            });

            if (
                cartData().website_id !== window.checkout.websiteId && cartData().website_id !== undefined ||
                cartData().storeId !== window.checkout.storeId && cartData().storeId !== undefined
            ) {
                customerData.reload(['cart'], false);
            }

            return this._super();
        },
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers

        isLoading: ko.observable(false),
        initSidebar: initSidebar,

        /**
         * Close mini shopping cart.
         */
        closeMinicart: api.close,

        /**
         * @param {String} productType
         * @return {*|String}
         */
        getItemRenderer: function (productType) {
            return this.itemRenderer[productType] || 'defaultRenderer';
        },

        /**
         * Update mini shopping cart content.
         *
         * @param {Object} updatedCart
         * @returns void
         */
        update: function (updatedCart) {
            _.each(updatedCart, function (value, key) {
                if (!this.cart.hasOwnProperty(key)) {
                    this.cart[key] = ko.observable();
                }
                this.cart[key](value);
            }, this);
        },

        /**
         * Get cart param by name.
         *
         * @param {String} name
         * @returns {*}
         */
        getCartParamUnsanitizedHtml: function (name) {
            if (!_.isUndefined(name)) {
                if (!this.cart.hasOwnProperty(name)) {
                    this.cart[name] = ko.observable();
                }
            }

            return this.cart[name]();
        },

        /**
         * @deprecated please use getCartParamUnsanitizedHtml.
         * @param {String} name
         * @returns {*}
         */
        getCartParam: function (name) {
            return this.getCartParamUnsanitizedHtml(name);
        },

        /**
         * Returns array of cart items, limited by 'maxItemsToDisplay' setting
         * @returns []
         */
        getCartItems: function () {
            var items = this.getCartParamUnsanitizedHtml('items') || [];

            items = items.slice(parseInt(-this.maxItemsToDisplay, 10));

            return items;
        },

        /**
         * Returns count of cart line items
         * @returns {Number}
         */
        getCartLineItemsCount: function () {
            var items = this.getCartParamUnsanitizedHtml('items') || [];

            return parseInt(items.length, 10);
        }
    });
});
