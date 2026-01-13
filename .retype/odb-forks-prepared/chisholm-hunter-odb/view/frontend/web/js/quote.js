define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'Magento_Customer/js/customer-data',
    'mage/url'
], function ($, Component, ko, modal, customerData, url) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/quote'
            },
            selectors: {
                itemComments: '.item-comments',
                itemCommentsModal: '.item-comments-modal-contents',
                itemCommentsNewComment: '.item-comments-modal-contents .new-comment textarea'
            },
            initialize: function (config) {
                var self = this;

                this._super();
                this.config = config;

                window.quoteConfig = config;
                window.quoteSelectors = this.selectors;

                this.quote = ko.observable();
                this.quoteId = ko.observable();
                this.status = ko.observable();
                this.quoteItems = ko.observableArray();
                this.quoteTotals = ko.observableArray();
                this.quoteShippingMethod = ko.observable();
                this.quoteShippingAmount = ko.observable();
                this.quoteShippingDeliveryDate = ko.observable();
                this.billingAddress = ko.observableArray();
                this.shippingAddress = ko.observableArray();

                this.allowCustomerItemComments = parseInt(this.config.allowCustomerItemComments) == 1 ? true : false;
                this.currentItemComments = ko.observableArray();

                // setTimeout(function() {
                //     self.initQuote();
                // }, 250);
            },

            initQuote: function()
            {
                var self = this;

                this.quote(this.config.quoteJson);
                this.quoteId(this.config.quoteJson.quote_id);
                this.status(this.config.quoteJson.status);

                $.each(this.config.quoteJson.totals, function(totalType, total) {
                    self.quoteTotals.push({
                        type: totalType,
                        label: total.label,
                        total: total.amount
                    });
                });

                this.quoteShippingMethod(this.config.quoteJson.shipping.method != '' ? this.config.quoteJson.shipping.method : 'No Method Selected');
                this.quoteShippingAmount(this.config.currencySymbol + parseFloat(this.config.quoteJson.shipping.amount).toFixed(2));
                this.quoteShippingDeliveryDate(this.config.quoteJson.shipping.requested_date);


                if(this.config.quoteJson.addresses.billing) {
                    var address = this.config.quoteJson.addresses.billing;
                    this.billingAddress.push(address);
                }
                if(this.config.quoteJson.addresses.shipping) {
                    var address = this.config.quoteJson.addresses.shipping;
                    this.shippingAddress.push(address);
                }

                $.each(this.config.quoteJson.items, function(itemId, item) {
                    item.comment_count = ko.observable(item.comment_count)
                    self.quoteItems.push(item);
                });
            },

            bindItemComments: function()
            {
                var self = this;

                $(self.selectors.itemComments).on('configureItemComments', function(event, item, initEvent) {
                    self.configureItemComments(item, initEvent);
                })
            },

            addToCart: function()
            {
                var self = this;
                var result;

                $.ajax({
                    url: self.config.urls.addToCart,
                    data: {
                        quote_id: self.quoteId(),
                        isAjax: 1,
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
                        if(result.hasOwnProperty('success') && result.success == true) {
                            document.location.href =  url.build('checkout');
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

            configureItemComments: function(data, event)
            {
                var self = this;
                var itemCommentsModal = $(this.selectors.itemCommentsModal);

                $(this.selectors.itemCommentsNewComment).val();
                self.currentItemComments([]);

                $.each(data.comments, function(index, comment) {
                    self.currentItemComments.push(comment);
                })

                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    modalClass: 'item-comments-modal',
                    title: data.name,
                    buttons: [
                        {
                            text: $.mage.__('Close'),
                            class: 'modal-close',
                            click: function (){
                                this.closeModal();
                            }
                        }
                    ]
                };

                if(self.allowCustomerItemComments) {
                    options.buttons.push({
                        text: $.mage.__('Add Comment'),
                        class: 'modal-save add primary',
                        click: function () {
                            self.addItemComment(data, event)
                        }
                    })
                }

                modal(options, itemCommentsModal);
                itemCommentsModal.modal("openModal");
            },

            addItemComment: function(item, event)
            {
                var self = this;
                var timestamp = + new Date;
                var date = new Date(timestamp);

                var dateFormatted = date.toLocaleString("en-US", {weekday: "short"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {day: "numeric"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {month: "short"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {year: "numeric"});

                var newTempId = item.comments.length + 1;
                var data = {
                    quote_id: self.config.quote_id,
                    comment_id: 't-' + newTempId,
                    author_type: 'customer',
                    item_id: item.item_id,
                    product_id: item.product_id,
                    contents: $(self.selectors.itemCommentsNewComment).val(),
                    created_at: dateFormatted
                };


                item.comment_count(item.comment_count() + 1);
                item.comments.push(data);
                self.currentItemComments.push(data);
                $(self.selectors.itemCommentsNewComment).val('');

                data['form_key'] = window.FORM_KEY;
                data['created_at'] = timestamp;

                var result;date

                $.ajax({
                    url: self.config.urls.addComment,
                    data: data,
                    dataType: 'JSON',
                    method: 'POST',
                    cache: false,
                    beforeSend: function() {
                        $('body').trigger('processStart');
                    },
                    success: function(response) {
                        result = JSON.parse(response);
                        data['created_at'] = dateFormatted;
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $('body').trigger('processStop');
                    }
                });
            },

            getStatus: function(data, event)
            {
                return this.status();
            },

            showComments: function(data, event)
            {
                $(window.quoteSelectors.itemComments).trigger('configureItemComments', [data, event]);
            },

            formatCurrency: function(price)
            {
                return window.quoteConfig.currencySymbol + parseFloat(price).toFixed(2);
            }
    });
});
