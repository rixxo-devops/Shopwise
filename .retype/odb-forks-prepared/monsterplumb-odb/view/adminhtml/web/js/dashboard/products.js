define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'jquery/validate'
    ], function ($, Component, ko, modal) {
        'use strict';

        ko.bindingHandlers.datepicker = {
            init: function(element, valueAccessor, allBindingsAccessor) {
                var $el = $(element);

                //initialize datepicker with some optional options
                var options = allBindingsAccessor().datepickerOptions || {};
                $el.datepicker(options);

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $el.datepicker("destroy");
                });
            },
            update: function(element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    $el = $(element),
                    current = $el.datepicker("getDate");

                if (value - current !== 0) {
                    $el.datepicker("setDate", value);
                }
            }
        };

        var self;

        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/dashboard/products',
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                findProduct: '#findProduct',
                findProductResults: '.findProductResults',
                findProductPages: '.findProductResults .pagination .pages',
                findProductPageLink: '.findProductResults .pagination .pages .page a',
                configurableProductModal: '.configure-item-modal-content',
                configurableOptionValues: '.configure-item-modal-content .attribute .option a',
                createProductModal: '.custom-product-modal-content',
                itemComments: '.item-comments',
                itemCommentsModal: '.item-comments-modal-contents',
                newItemCommentInput: '.new-comment textarea',
                quoteItems: '.items .quoteItems',
                quoteTotals: '.actions-toolbar.bottom .totals'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.permissions = ko.observable(this.config.permissions);

                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';

                this.findProductsPerPage = ko.observable(5);
                this.pagesVisibleInPagination = ko.observable(5);

                this.currencySymbol = ko.observable(config.currencySymbol);

                this.findProductQuery = ko.observable();
                this.findProductQueryMatches = ko.observable();
                this.findProductQueryPageMatches = ko.observableArray();
                this.findProductPages = ko.observableArray();
                this.findProductTotalPages = ko.observable(3);
                this.findProductResultCount = ko.observable(0);
                this.findProductQueryId = ko.observable(1);
                this.findProductPreventClose = ko.observable(false);

                this.currentPage = ko.observable(1);
                this.hasPreviousProductPage = ko.observable();
                this.hasNextProductPage = ko.observable();

                this.configurableItemProduct = ko.observable();
                this.configureItemModalTitle = ko.observable();
                this.configureItemDisplayType = ko.observable();
                this.configureItemButtonText = ko.observable();

                this.configurableProductSuperAttributes = ko.observableArray();
                this.configurableProductAttributeCount = ko.observable(1);
                this.configurableProductOptionData = ko.observable();
                this.configurableProductQuantities = {};

                this.productCustomOptions = ko.observableArray();
                this.productCustomOptionsData = ko.observableArray();
                this.customOptionsDates = ko.observableArray();

                this.customProductCategoryFilter = ko.observable('');
                this.customProductFilteredCategories = ko.observableArray();
                this.customProductCategoryFilterQueryId = ko.observable(1);
                this.customProductCategories = ko.observableArray();
                this.customProductSelectedCategories = ko.observableArray();
                this.customProductAttributeSets = ko.observableArray();
                this.customProductAttributeSet = ko.observable();
                this.customProductVisibilities = ko.observableArray();
                this.customProductVisibility = ko.observable();
                this.customProductTaxClasses = ko.observableArray();
                this.customProductTaxClass = ko.observable();
                this.customProductName = ko.observable();
                this.customProductSku = ko.observable();
                this.customProductPrice = ko.observable();
                this.customProductQty = ko.observable();
                this.customProductMakePermanent = ko.observable(0);

                this.saveOnBlur = ko.observable();
                this.quoteItems = ko.observableArray();

                this.quoteTotalItemCount = ko.computed(function() {
                   return self.quoteItems().length;
                });

                this.quoteTotalsSubtotal = ko.computed(function() {
                    var subtotal = 0.00;
                    $.each(self.quoteItems(), function(index, item) {
                       subtotal += parseFloat(item().row_total());
                    });

                    return self.currencyFormat(subtotal, true);
                });

                this.quoteTotalsMargin = ko.computed(function() {
                    var cost_price = 0.00;
                    var custom_price = 0.00;

                    $.each(self.quoteItems(), function(index, item) {
                        cost_price += parseFloat(item().cost_price() ?? 0.00);
                        custom_price += parseFloat(item().custom_price());
                    });

                    var margin = ((custom_price - cost_price) / custom_price) * 100;

                    return isNaN(margin) ? '' : margin.toFixed(2);
                });

                this.currentItemComments = ko.observableArray();
                this.allowCustomerItemComments = parseInt(this.config.allowCustomerItemComments) == 1 ? true : false;

                window.productSelectors = this.selectors;

                setTimeout(function() {
                    self.initItems();
                }, 400);
            },

            initItems: function()
            {
                if(window.quote().items) {
                    this.populateItemTable();
                }

                if(self.config.categories) {
                    $.each(self.config.categories, function(id, category) {
                        self.customProductCategories.push(category);
                    });
                }

                if(self.config.attributeSets) {
                    $.each(self.config.attributeSets, function(attributeSetId, attributeSet) {
                        self.customProductAttributeSets.push(attributeSet);
                    });
                }

                if(self.config.visibility) {
                    $.each(self.config.visibility, function(index, option) {
                        self.customProductVisibilities.push(option);
                    });
                }

                if(self.config.taxClasses) {
                    $.each(self.config.taxClasses, function(index, option) {
                        self.customProductTaxClasses.push(option);
                    });
                }
            },

            hasPermission: function(permission)
            {
                return $.inArray(permission, this.permissions()) > -1;
            },

            bindQuoteItems: function()
            {
                $(this.selectors.quoteItems).on('addQuoteItem', function(event, product, originalEvent) {
                    self.addQuoteItem(product, originalEvent);
                });

                $(this.selectors.quoteItems).on('updateQuoteItem', function(event, item, updateType) {
                    self.editQuoteItem(item, updateType);
                });

                $(this.selectors.quoteItems).on('updateQuoteItemsAfterSave', function(event, item, updateType) {
                    self.updateQuoteItemsAfterSave();
                });
            },

            bindCustomProductCategories: function()
            {
                $(self.selectors.createProductModal).find('.next-level img').each(function(e) {
                    $(this).unbind('click').bind('click', function(event) {
                        self.toggleShowCustomProductChildCategories(this);
                    });
                });

                $(self.selectors.createProductModal).find('.select-category').each(function(e) {
                    $(this).unbind('change').bind('change', function(e) {
                        self.selectCustomProductCategory(this);
                    });
                });

                $(self.selectors.createProductModal).find('.categories .name, .filtered-categories .name').each(function(e) {
                    $(this).unbind('click').bind('click', function(e) {
                        self.setCustomProductCategoryChecked(this);
                    });
                });
            },

            updateQuoteItemsAfterSave: function()
            {
                if(window.quote().items.length) {
                    $.each(window.quote().items, function(index, item) {
                        if(self.quoteItems().length) {
                            $.each(self.quoteItems(), function(itemIndex, quoteItem) {
                                if(quoteItem().sku() == item.sku()) {
                                    quoteItem().item_id(item.item_id());
                                    quoteItem().tax_percent(item.tax_percent());
                                    quoteItem().tax(item.tax());
                                    quoteItem().custom_price(item.custom_price());
                                    quoteItem().discount(item.discount());
                                    quoteItem().discount_percent(item.discount_percent());
                                    quoteItem().tier_prices(item.tier_prices());
                                    quoteItem().tier_price_applied(item.tier_price_applied());
                                    quoteItem().catalog_rules(item.catalog_rules);
                                    quoteItem().row_total(parseFloat(item.qty() * item.custom_price()).toFixed(2));
                                }
                            })
                        }
                    })
                }

                $(self.selectors.dashboard).trigger('updateQuoteTotals');
            },

            bindConfigurableOptions: function(result)
            {
                var self = this;

                $(this.selectors.configurableProductModal).find('.options').slice(1).each(function(e) {
                    $(this).find('.option a').addClass('unavailable');
                });

                $(this.selectors.configurableOptionValues).on('click', function(event) {
                    // self.toggleSelectedConfigurableOption(option, event);
                    self.configureAttributes(event, result);
                });

                if(this.configurableProductOptionData().levels > 1) {
                    $(this.selectors.configurableProductModal + ' .selection-attribute table').addClass('unavailable');
                }
            },

            bindCustomOptions: function()
            {
                $('.custom-options .option a').bind('click', function(event) {
                    self.selectCustomOptionValue(event);
                });
            },

            bindItemComments: function()
            {
                var self = this;

                $(this.selectors.itemComments).on('populateItemCommentsModal', function(event, item, initialEvent) {
                    self.populateItemCommentsModal(item, initialEvent);
                });

                $(this.selectors.itemComments).on('deleteItemComment', function(event, comment, initialEvent) {
                    $.each(self.quoteItems(), function(index, item) {
                        if(item().item_id() == comment.item_id) {
                            $.each(item().comments(), function(index, itemComment) {
                                if(itemComment) {
                                    if(itemComment.comment_id == comment.comment_id) {
                                        item().comments.remove(itemComment);
                                        item().comment_count(item().comment_count() - 1);
                                        self.currentItemComments(item().comments());
                                    }
                                }
                            })
                        }

                    });
                });
            },

            populateItemCommentsModal: function(item, event)
            {
                var self = this;
                var itemComments = $(this.selectors.itemComments);
                var itemCommentsModal = $(this.selectors.itemCommentsModal);

                self.currentItemComments([]);

                $.each(item.comments(), function(index, comment) {
                    self.currentItemComments.push(comment);
                })

                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    modalClass: 'item-comments-modal',
                    title: item.name(),
                    buttons: []
                };

                if(self.hasPermission('odb_quotes_item_comment_edit')) {
                    options.buttons.push({
                        text: $.mage.__('Add Comment'),
                        class: 'modal-save add primary',
                        click: function () {
                            self.addItemComment(item, event)
                        }
                    });
                }

                options.buttons.push({
                    text: $.mage.__('Close'),
                    class: 'modal-close',
                    click: function (){
                        this.closeModal();
                    }
                });

                modal(options, itemCommentsModal);
                itemCommentsModal.modal("openModal");
                $(self.selectors.newItemCommentInput).focus();
            },

            addItemComment: function(item, event)
            {
                var timestamp = + new Date;
                var date = new Date(timestamp);

                var dateFormatted = date.toLocaleString("en-US", {weekday: "short"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {day: "numeric"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {month: "short"}) + ' ';
                dateFormatted += date.toLocaleString("en-US", {year: "numeric"});

                var newTempId = item.comments().length + 1;
                var data = {
                    comment_id: 't-' + newTempId,
                    author_type: 'admin',
                    item_id: item.item_id(),
                    product_id: item.product_id(),
                    contents: $(this.selectors.newItemCommentInput).val(),
                    created_at: dateFormatted
                };

                item.comment_count(item.comment_count() + 1);
                item.comments.push(data);
                this.currentItemComments(item.comments());

                $(this.selectors.newItemCommentInput).val('').focus();
            },


            showItemComments: function(data, event)
            {
                $('.item-comments').trigger('populateItemCommentsModal', [data, event]);
            },

            deleteItemComment: function(data, event)
            {
                var target = $('.item-comments').trigger('deleteItemComment', [data, event])
            },

            editQuoteItem: function(item, updateType)
            {
                self.saveOnBlur(false);
                $.each(this.quoteItems(), function(index, data) {
                    if(item.product_id() == data().product_id()) {
                        var quoteItem = $('.item[data-product-id="' + data().product_id() + '"]');

                        var originalPrice = parseFloat(data().price()).toFixed(2);

                        switch(updateType) {
                            case 'custom_price':
                                var customPrice = parseFloat(data().custom_price()).toFixed(2);
                                var discount = originalPrice - customPrice;
                                var discountPercent = (discount / originalPrice) * 100;
                                var margin = parseFloat(((customPrice - data().cost_price()) / customPrice) * 100).toFixed(2);
                                var rowTotal = customPrice * data().qty();
                                var tax = (rowTotal / 100) * item.tax_percent();

                                data().discount(discount);
                                data().discount_percent(discountPercent);
                                data().row_total(rowTotal);
                                data().margin(margin);
                                data().tax(tax);
                                break;
                            case 'cost_price':
                                var margin = parseFloat(((data().custom_price() - data().cost_price()) / data().custom_price()) * 100).toFixed(2);
                                data().margin(margin);
                                break;
                            case 'discount':
                                var customPrice = originalPrice - data().discount();
                                var discountPercent = ((originalPrice - customPrice) / originalPrice) * 100
                                var margin = parseFloat(((customPrice - data().cost_price()) / customPrice) * 100).toFixed(2);
                                var rowTotal = customPrice * data().qty();
                                var tax = (rowTotal / 100) * item.tax_percent();

                                data().custom_price(customPrice);
                                data().discount_percent(discountPercent > 0 ? discountPercent : '0.00');
                                data().margin(margin);
                                data().row_total(rowTotal);
                                data().tax(tax);
                                break;
                            case 'discount_percent':
                                var discount = (originalPrice / 100) * data().discount_percent();
                                var customPrice = originalPrice - discount;
                                var rowTotal = customPrice * data().qty();
                                var margin = parseFloat(((customPrice - data().cost_price()) / customPrice) * 100).toFixed(2);
                                var tax = (rowTotal / 100) * item.tax_percent();

                                data().custom_price(customPrice);
                                data().discount(discount);
                                data().row_total(rowTotal);
                                data().margin(margin);
                                data().tax(tax);
                                break;
                            case 'qty':
                                var originalPrice = parseFloat(data().price()).toFixed(2);
                                var customPrice = parseFloat(data().custom_price()).toFixed(2);

                                var tierPriceApplied = false;
                                $.each(data().tier_prices(), function(index, tierPrice) {
                                   if(data().qty() >= parseInt(tierPrice.qty)) {
                                       if(parseFloat(tierPrice.value) < customPrice || data().tier_price_applied() || tierPrice.hasOwnProperty('reset')) {
                                           customPrice = parseFloat(tierPrice.value).toFixed(2);
                                           data().tier_price_applied(true);
                                       }
                                       tierPriceApplied = true;
                                   }
                                });

                                var rulePrice;
                                $.each(data().catalog_rules(), function(index, catalogRule) {
                                    switch(catalogRule.operator) {
                                        case 'by_percent':
                                            var percent = 100 - parseFloat(catalogRule.amount);
                                            rulePrice = (price / 100) * percent;
                                            break;
                                        case 'to_percent':
                                            rulePrice = (price / 100) * parseFloat(catalogRule.amount);
                                            break;
                                        case 'by_fixed':
                                            rulePrice = price - parseFloat(catalogRule.amount);
                                            break;
                                        case 'to_fixed':
                                            rulePrice = parseFloat(catalogRule.amount);
                                            break;
                                    }

                                    if(rulePrice < customPrice) {
                                        customPrice = rulePrice;
                                    }
                                });

                                var rowTotal = customPrice * data().qty();
                                var tax = (rowTotal / 100) * item.tax_percent();

                                data().discount(parseFloat(originalPrice - customPrice).toFixed(2));
                                data().discount_percent(parseFloat((data().discount() / originalPrice) * 100).toFixed(2));
                                data().custom_price(customPrice);
                                data().row_total(rowTotal);
                                data().tax(tax);

                                break;
                        }
                    }
                });

                setTimeout(function() {
                    var itemRow = $('.quoteItems .item[data-product-id="' + item.product_id() + '"]');
                    if(itemRow.find('input:focus').length) {
                        self.saveOnBlur(true);
                    } else {
                        self.updateQuote();
                    }
                }, 150);


                $(this.selectors.quoteTotals).trigger('updateQuoteTotals');
            },

            addQuoteItem: function(product, event, configuredOptions = false)
            {
                var newItem = true;
                var tierPriceApplied = false;

                if(!configuredOptions) {
                    var configurableTypes = ['configurable','bundle', 'group'];
                    if($.inArray(product.type_id, configurableTypes) > -1 || product.has_options) {
                        return self.showConfigureItem(product, event);
                    }
                }

                $.each(this.quoteItems(), function(index, data) {
                    if(product.product_id == data().product_id()) {
                        var customOptions = ko.isObservable(data().custom_options) ? data().custom_options() : data().custom_options;
                        if(!customOptions || customOptions == JSON.stringify(self.productCustomOptionsData())) {
                            var qty = product.hasOwnProperty('qty') ? parseInt(data().qty()) +  parseInt(product.qty) : parseInt(data().qty()) + 1;
                            data().qty(qty);

                            var customPrice = data().custom_price();
                            $.each(data().tier_prices(), function(index, tierPrice) {
                               if(data().qty() >= parseInt(tierPrice.qty) && parseInt(tierPrice.value) < customPrice) {
                                   customPrice = parseInt(tierPrice.value).toFixed(2);
                                   data().tier_price_applied(true);
                               }
                            });

                            data().custom_price(customPrice);
                            $('tr.item[data-item-id="' + data().item_id() + '"] input[name="custom_price"]').trigger('change');

                            var rowTotal = data().qty() * data().custom_price();
                            data().row_total(rowTotal);
                            data().tax((rowTotal / 100) * data().tax_percent());

                            newItem = false;
                        }
                    }
                });

                var price = product.special_price ? parseFloat(product.special_price).toFixed(2) : parseFloat(product.price).toFixed(2);
                var custom_price = price;

                if(self.productCustomOptionsData().length) {
                    $.each(self.productCustomOptionsData(), function(index, data) {
                        if(data.value[0]) {
                            var optionPrice = parseFloat(data.price);
                            price = Math.round(price + optionPrice);
                            custom_price = Math.round(custom_price + optionPrice);
                        }
                    })
                }

                var discount = parseFloat(price - custom_price).toFixed(2);
                var discountPercent = parseFloat((discount / price) * 100).toFixed(2);

                if(newItem) {
                    if(product.hasOwnProperty('tier_prices') && product.tier_prices.length) {
                        $.each(product.tier_prices, function(index, tierPrice) {
                            if(tierPrice.qty < 2) {
                                if(tierPrice.value && parseFloat(tierPrice.value) < custom_price) {
                                    custom_price = parseFloat(tierPrice.value).toFixed(2);
                                    discount = parseFloat(price - custom_price).toFixed(2);
                                    discountPercent = parseFloat((discount / price) * 100).toFixed(2);
                                    tierPriceApplied = true;
                                }
                            }
                        })
                    }

                    var rulePrice;
                    if(product.hasOwnProperty('catalog_rules')) {
                            $.each(product.catalog_rules, function(index, catalogRule) {
                                   switch(catalogRule.operator) {
                                       case 'by_percent':
                                           var percent = 100 - parseFloat(catalogRule.amount);
                                           rulePrice = (price / 100) * percent;
                                           break;
                                       case 'to_percent':
                                           rulePrice = (price / 100) * parseFloat(catalogRule.amount);
                                           break;
                                       case 'by_fixed':
                                           rulePrice = price - parseFloat(catalogRule.amount);
                                           break;
                                       case 'to_fixed':
                                           rulePrice = parseFloat(catalogRule.amount);
                                           break;
                                   }

                                   if(rulePrice < custom_price) {
                                       custom_price = rulePrice;
                                       discount = parseFloat(price - custom_price).toFixed(2);
                                       discountPercent = parseFloat((discount / price) * 100).toFixed(2);
                                   }
                            })
                    }

                    var newTempId = this.quoteItems().length;
                    var item = ko.observable({
                        item_id: ko.observable('t-' + newTempId),
                        product_id: ko.observable(product.product_id),
                        sku: ko.observable(self.getDynamicSku(product.product_id,product.sku)),
                        name: ko.observable(product.name),
                        type_id: ko.observable(product.type_id),
                        custom_options: product.has_options ? ko.observable(JSON.stringify(self.productCustomOptionsData())) : false,
                        custom_options_array: ko.observableArray(),
                        image_url: ko.observable(product.image_url),
                        cost_price: ko.observable(product.cost_price),
                        price: ko.observable(product.original_price),
                        custom_price: ko.observable(custom_price),
                        tier_prices: ko.observable(product.tier_prices),
                        tier_price_applied: ko.observable(tierPriceApplied),
                        catalog_rules: ko.observable(product.catalog_rules),
                        discount: ko.observable(discount),
                        discount_percent: ko.observable(discountPercent),
                        tax: ko.observable(product.tax),
                        tax_percent: ko.observable(product.tax_percent),
                        qty: ko.observable(product.hasOwnProperty('qty') ? product.qty : 1),
                        row_total: ko.observable(custom_price),
                        url: ko.observable(product.url),
                        margin: ko.observable(100.00),
                        comments: ko.observableArray([]),
                        comment_count: ko.observable(0)
                    });

                    if(self.productCustomOptionsData()) {
                        $.each(self.productCustomOptionsData(), function(index, data) {
                            if(data.value[0].id) {
                                item().custom_options_array.push({'option': data.title, 'value': data.value[0].title});
                            }
                        });
                    }
                    self.productCustomOptionsData('');

                    var margin = ((item().custom_price() - item().cost_price()) / item().custom_price()) * 100
                    item().margin(parseFloat(margin).toFixed(2));

                    self.quoteItems.push(item);
                }

                $(self.selectors.quoteItems).find('.item[data-product-id="' + product.product_id + '"] input[name="qty"]').each(function(e) {
                    if($(this).prop('disabled') != true) {
                        $(this).focus();
                        return false;
                    }
                });

                self.preventFindProductClose(false);
                self.toggleShowResults(false);

                this.updateQuote();
            },

            saveQuoteOnBlur: function(data, event)
            {
                setTimeout(function() {
                    var itemRow = $(event.target).parents('.item');
                    if(!itemRow.find('input:focus').length) {
                        if(self.saveOnBlur()) {
                            self.updateQuote();
                            self.saveOnBlur(false);
                        }
                    }

                    return;
                }, 150);
            },

            getDynamicSku: function(id, sku)
            {

                var productCount = 0;

                $.each(self.quoteItems(), function(index, data) {
                    if(data().product_id() == id) {
                        productCount++;
                    }
                });

                sku = productCount > 0 ? sku + productCount : sku;

                return sku;
            },

            showCustomProductModal: function()
            {
                self.resetCustomProductForm();

                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    modalClass: 'configure-item-modal',
                    title:  $.mage.__('Create Custom Product'),
                    buttons: [
                        {
                            text: $.mage.__('Close'),
                            class: 'modal-close',
                            click: function (){
                                self.resetCustomProductForm();
                                this.closeModal();
                            }},
                        {
                            text: $.mage.__('Create Product'),
                            class: 'modal-save add primary',
                            click: function (){
                                $('#customProductForm').submit();
                            }
                        }
                    ]
                };

                self.addCustomProductValidation();
                modal(options, $(this.selectors.createProductModal));
                $(this.selectors.createProductModal).modal("openModal");
            },

            setCustomProductSku: function(data, event)
            {
                var sku = '';
                var productName = $(this.selectors.createProductModal).find('.input-name input:first').val();

                if(productName) {
                    sku = productName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, '-');
                }

                $(this.selectors.createProductModal).find('.input-sku input:first').val(sku);
                self.customProductSku(sku);
                self.customProductName(productName);
            },

            addCustomProductValidation: function(data, event)
            {
                var self = this;

                var customProductForm = $('#customProductForm');
                customProductForm.bind('submit', function(event) {
                    event.preventDefault();
                });

                customProductForm.validate({
                    rules: {
                        product_name: 'required',
                        sku: 'required',
                        price: 'required'
                    },
                    messages: {
                        product_name: 'This field is required',
                        sku: 'This field is required',
                        price: 'Enter a valid number'
                    },
                    submitHandler: function(customProductForm) {
                        self.createCustomProduct();
                    }
                });
            },

            resetCustomProductForm: function()
            {
                self.customProductName('');
                self.customProductSku('');
                self.customProductPrice('');
                self.customProductQty('');
                self.customProductMakePermanent(0);
                self.customProductSelectedCategories.removeAll();
                self.customProductVisibility('');
                self.customProductAttributeSet('');
                self.customProductCategoryFilter('');

                $(self.selectors.createProductModal).find('.input-permanent input').prop('checked', false);
                $(self.selectors.createProductModal).find('.select-category').prop('checked', false);
                $(self.selectors.createProductModal).find('label[generated="true"]').remove();
            },

            createCustomProduct: function()
            {
                var product_id = null;
                var productData = {
                    name: self.customProductName(),
                    sku: self.customProductSku(),
                    price: self.customProductPrice(),
                    qty: self.customProductQty(),
                    attribute_set_id: self.customProductAttributeSet(),
                    categories: self.customProductSelectedCategories(),
                    visibility: self.customProductVisibility(),
                    tax_class: self.customProductTaxClass(),
                    form_key: window.FORM_KEY
                };

                if($(self.selectors.createProductModal).find('.input-permanent input').prop('checked')) {
                    productData['make_permanent'] = 1
                }

                $.ajax({
                    url: self.config.urls.create,
                    data: productData,
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function () {
                        $('body').trigger('processStart');
                        $('.filtered-categories').addClass('loading');
                    },
                    success: function (response) {
                        var result = JSON.parse(response);
                        if(!result.hasOwnProperty('error')) {
                            product_id = result.product.product_id;
                            self.addQuoteItem(result.product, false);
                        }
                    },
                    complete: function(response) {
                        $('body').trigger('processStop');
                        $(self.selectors.createProductModal).modal('closeModal');

                        $(self.selectors.quoteItems).find('.item[data-product-id="' + product_id + '"] .costPrice input:first').each(function(e) {
                            if($(this).prop('disabled') != true) {
                                var ele = $(this)
                                setTimeout(function() {
                                    ele.focus();
                                    return false;
                                }, 250)

                            }
                        });
                    }
                });
            },

            selectCustomProductCategory: function(target)
            {
                target = $(target);

                if(target.prop('checked')) {
                    var category = {
                        category_id: target.val(),
                        name: target.siblings('.name:first').text()
                    };

                    $(self.selectors.createProductModal).find('input[value="' +  target.val() + '"]').prop('checked', true);
                    self.customProductSelectedCategories.push(category);
                } else {
                    $(self.selectors.createProductModal).find('input[value="' +  target.val() + '"]').prop('checked', false);
                    $.each(self.customProductSelectedCategories(), function(index, data) {
                        if(data.category_id == target.val()) {
                            self.customProductSelectedCategories.remove(data);
                        }
                    });
                }
            },

            setCustomProductCategoryChecked: function(target)
            {
               var checkbox = $(target).siblings('input[type="checkbox"]');

               if(checkbox.prop('checked')) {
                   checkbox.prop('checked', false);
               }
               else {
                   checkbox.prop('checked', true);
               }

               checkbox.trigger('change');
            },

            removeCustomProductCategory: function(data, event)
            {
                $(self.selectors.createProductModal).find('input[value="' + data.category_id + '"]').prop('checked', false);
                self.customProductSelectedCategories.remove(data);
            },

            canClearCustomProductFilter: function()
            {
                return self.customProductCategoryFilter().length > 0;
            },

            clearCustomProductFilter: function()
            {
                self.customProductCategoryFilter('');
                $(self.selectors.createProductModal).find('.category-filter');

                self.filterCustomProductCategories();
            },

            filterCustomProductCategories: function()
            {
                self.customProductCategoryFilterQueryId(self.customProductCategoryFilterQueryId() + 1);
                $(self.selectors.createProductModal).find('.category-filter').trigger('change');
                var query = $(self.selectors.createProductModal).find('.category-filter').val();

                if(query.length >= 3) {
                    $(self.selectors.createProductModal).find('.categories').hide();
                    $(self.selectors.createProductModal).find('.filtered-categories').show();

                    $.ajax({
                        url: self.config.urls.getFilteredCategories,
                        data: {
                            query: query,
                            query_id: self.customProductCategoryFilterQueryId(),
                            form_key: window.FORM_KEY
                        },
                        dataType: 'JSON',
                        method: 'post',
                        cache: false,
                        beforeSend: function () {
                            self.customProductFilteredCategories.removeAll();
                            $('.filtered-categories').addClass('loading');
                        },
                        success: function (response) {
                            var result = JSON.parse(response);
                            if(!result.hasOwnProperty('error')) {
                                if(result.query_id == self.customProductCategoryFilterQueryId()) {
                                    $(self.selectors.createProductModal).find('.filtered-categories').removeClass('loading');
                                    $(result.categories).each(function(category_id, data) {
                                        self.customProductFilteredCategories.push(data);
                                    });
                                }
                            }

                            $.each(self.customProductSelectedCategories(), function(index, selectedCategory) {
                                $(self.selectors.createProductModal).find('.filtered-categories input[value="' + selectedCategory.category_id + '"]').prop('checked', true);
                            });
                        }
                    });
                } else {
                    $(self.selectors.createProductModal).find('.categories').show();
                    $(self.selectors.createProductModal).find('.filtered-categories').hide();
                }
            },

            toggleShowCustomProductChildCategories: function(target)
            {
                var target = $(target).parents('a');
                var category_id = target.parents('li').data('id');
                var children = target.siblings('.children:first');

                if(target.hasClass('show')) {
                    target.siblings('.name').addClass('open');
                    if(!target.data('got-categories')) {
                        $.ajax({
                            url: self.config.urls.getSubCategories,
                            data: {
                                category_id: category_id,
                                form_key: window.FORM_KEY
                            },
                            dataType: 'JSON',
                            method: 'post',
                            cache: false,

                            beforeSend: function () {
                                children.addClass('loading');
                            },
                            success: function (response) {
                                var result = JSON.parse(response);
                                if(!result.hasOwnProperty('error')) {
                                    $.each(result.children, function(category_id, category) {
                                        var childCategory = $('<li>', {
                                            'data-level': category.level,
                                            'data-has-children': category.has_children,
                                            'data-id': category_id
                                        }).appendTo(children);

                                        $('<span>', {
                                            'class': 'name'
                                        }).appendTo(childCategory).text(category.name);

                                        $('<input>', {
                                            'type': 'checkbox',
                                            'class': 'select-category',
                                            'value': category_id
                                        }).appendTo(childCategory);

                                        if(category.has_children) {
                                            $('<a>', {
                                                'class': 'next-level show',
                                                'title': $.mage.__('Show Categories'),
                                                'href': 'javascript: void(0)',
                                                'data-got-categories': '0'
                                            }).appendTo(childCategory).html('<img className="show" src="/media/odb/arrow.png" width="20" height="20"/>');

                                            $('<ul>', {
                                                'class': 'children closed',
                                                'data-level': parseInt(category.level) + 1
                                            }).appendTo(childCategory);
                                        }
                                    });
                                }
                                target.data('got-categories', 1);
                                children.removeClass('loading');
                                self.bindCustomProductCategories();
                            }
                        });
                    }

                    target.removeClass('show').addClass('hide');
                    children.removeClass('closed').addClass('open');
                    target.attr('title', 'Hide Categories');
                }
                else {
                    target.addClass('show').removeClass('hide');
                    target.siblings('.name').removeClass('open');
                    target.attr('title', 'Show Categories');
                    children.removeClass('open').addClass('closed');
                }
            },

            addConfigurableQuoteItem: function()
            {
                var hasSelections = false;

                $.each(self.configurableProductQuantities, function(index, data) {
                    if(data['qty'] < 1) {
                        return;
                    }
                    self.addQuoteItem(data);
                    hasSelections = true;
                });

                if(hasSelections) {
                    $(this.selectors.configurableProductModal).modal("closeModal");
                }
                else {
                    alert('No Selections');
                }
            },

            showConfigureItem: function(product, event)
            {
                var customOptionsForm = $('#customOptionsForm');
                var productHasAvailableOptions = Object.keys(product.options).length;
                var configurableTypes = ['configurable', 'bundle', 'grouped'];

                this.productCustomOptions.removeAll();

                if($.inArray(product.type_id, configurableTypes) > -1) {
                    self.configureItemDisplayType(product.type_id);
                    self.configureItemModalTitle($.mage.__('Configurable Product') + ': ' + product.name)
                    if(product.has_options && productHasAvailableOptions) {
                        self.configureItemButtonText($.mage.__('Continue'));
                    }
                    else {
                        self.configureItemButtonText($.mage.__('Add To Quote'));
                    }
                }
                else {
                    self.configureItemDisplayType('custom_options');
                    self.configureItemModalTitle($.mage.__('Custom Options') + ': '  + product.name);
                    self.configureItemButtonText($.mage.__('Add To Quote'));
                }

                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    modalClass: 'configure-item-modal',
                    title: self.configureItemModalTitle(),
                    buttons: [
                        {
                            text: $.mage.__('Close'),
                            class: 'modal-close',
                            click: function (){
                                this.closeModal();
                            }},
                        {
                            text: self.configureItemButtonText(),
                            class: 'modal-save add primary',
                            click: function (){
                                var configuredOptions = false;

                                if(product.has_options && productHasAvailableOptions && self.configureItemDisplayType() != 'custom_options') {
                                    self.configureItemDisplayType('custom_options');
                                    self.configureItemModalTitle($.mage.__('Custom Options') + ': '  + product.name);
                                    self.configureItemButtonText($.mage.__('Add To Quote'));
                                    $('configure-item-modal').removeClass('incomplete');
                                }
                                else {
                                    if(product.has_options && productHasAvailableOptions) {
                                        self.configurableItemProduct(product);
                                        customOptionsForm.submit();
                                    }
                                    else {
                                        addToQuote();
                                    }
                                }

                                function addToQuote() {
                                    switch(product.type_id) {
                                        case 'configurable':
                                            self.addConfigurableQuoteItem(event, true);
                                            break;
                                    }
                                }
                            }
                        }
                    ]
                };

                modal(options, $(this.selectors.configurableProductModal));

                if(product.type_id == 'configurable') {
                    $('.configure-item-modal').addClass('incomplete');
                    this.getConfigurableOptions(product, event);
                }
                if(product.has_options && productHasAvailableOptions) {
                    var dateCount = 0;
                    $.each(product.options, function(index, option) {
                        self.productCustomOptions.push(option);
                    });
                    self.bindCustomOptions();
                    self.addCustomOptionValidation(product, event);
                }
                $(this.selectors.configurableProductModal).modal("openModal");
            },

            selectCustomOptionValue: function(event)
            {
                var targetValue = $(event.target);
                var option = targetValue.parents('.attribute');
                var values = targetValue.parents('.options');

                if(values.data('select-type') == 'single') {
                    if(!option.data('is-required') && targetValue.hasClass('selected')) {
                        targetValue.removeClass('selected');
                    }
                    else {
                        values.find('.selected').each(function(element) {
                            $(this).removeClass('selected');
                        });

                        targetValue.addClass('selected');
                    }
                }
                else if(values.data('select-type') == 'multiple') {
                    if(targetValue.hasClass('selected')) {
                        targetValue.removeClass('selected');
                    } else {
                        targetValue.addClass('selected')
                    }
                }

                var valueArray  = [];
                var price = 0;
                values.find('.selected').each(function() {
                    valueArray.push([$(this).data('option-type-id'), $(this).data('data-option-title')]);
                    price += parseFloat($(this).data('price-difference'));
                });

                option.find('input[type="hidden"]:first').val(valueArray.join());
                option.find('input[type="hidden"]:first').data('price-difference', price);

                self.setCustomOptions();
            },

            setCustomOptions: function(event)
            {
                var optionsData = [];

                $('.custom-options .attribute').each(function(e) {
                    var optionId = $(this).data('option-id');
                    var optionType = $(this).data('option-type');
                    var optionTitle = $(this).find('h2:first').text();
                    var values = [];

                    var titles = [];
                    $(this).find('.selected').each(function() {
                        titles.push($(this).data('option-title'));
                    });

                    values.push({
                        id: $(this).find('input:first, textarea:first').val(),
                        title: titles.length ? titles.join(', ') : $(this).find('input:first, textarea:first').val()
                    });

                    var option = {
                        option_id: optionId,
                        title: optionTitle,
                        value: values,
                        price: $(this).find('input:first, textarea:first').data('price-difference')
                    };
                    optionsData.push(option);
                });

                self.productCustomOptionsData(optionsData);
            },

            addCustomOptionValidation: function(event)
            {
                var customOptionsForm = $('#customOptionsForm');

                customOptionsForm.bind('submit', function(e) {
                    e.preventDefault();
                });

                customOptionsForm.find('.attribute[data-is-required="required"]').each(function() {
                    $(this).find('input:first, textarea:first').rules('add', {
                        required: true
                    });
                    if($(this).data('option-type') == 'date') {
                        $(this).find('input:first, textarea:first').rules('add', {
                            date: true
                        });
                    }
                });

                var validationData = {
                    ignore: [],
                    submitHandler: function(customOptionsForm) {
                        self.addQuoteItem(self.configurableItemProduct(), false, true);
                        $(self.selectors.configurableProductModal).modal("closeModal");
                    }
                }

                customOptionsForm.validate(validationData);
            },

            getConfigurableOptions: function(product, event) {
                let self = this;
                let result;

                self.configurableProductQuantities = {};

                $.ajax({
                    url: self.config.urls.getConfigurableOptions,
                    data: {
                        product_id:  product.product_id,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        self.configurableProductSuperAttributes.removeAll();
                        $(self.selectors.configurableProductModal).addClass('loading');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        if(!result.error) {
                            self.configurableProductAttributeCount(Object.keys(result.options.attributes).length);
                            self.configurableProductOptionData({
                                current_level: 0,
                                max_level: Object.keys(result.options.attributes).length - 1,
                                levels: Object.keys(result.options.attributes).length,
                                selection_hash: ''
                            })

                            $.each(result.options.attributes, function(attribute_id, attribute) {
                                self.configurableProductSuperAttributes.push({
                                    'attribute_code': attribute.attribute_code,
                                    'label': attribute.label,
                                    'options': ko.observableArray(attribute.options)
                                })
                            });
                            self.bindConfigurableOptions(result);
                            if(self.configurableProductOptionData().levels == 1) {
                                $('.configure-item-modal').removeClass('incomplete');
                                $.each(result.options.available, function(index, productData) {
                                    var option = $('.options .option[data-option-id="' + index + '"]:first');
                                    option.find('.price').text(self.currencyFormat(productData.price));
                                    option.find('.available').text(parseInt(productData.qty));
                                    option.data('product-data', productData);
                                })
                            }
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $(self.selectors.findProductResults).removeClass('loading');
                    }
                });
            },

            isLastConfigurableAttribute: function(index)
            {
                return (index() + 1) == this.configurableProductAttributeCount();
            },

            toggleSelectedConfigurableOption: function(data, event)
            {
                var target = $(event.target);

                if(target.hasClass('selected')) {
                    target.removeClass('selected');
                    target.parents('.options').find('.option a').each(function(e) {
                        $(this).removeClass('unavailable');
                    });

                }
                else {
                    target.parents('.options').find('.option a').each(function(e) {
                        $(this).removeClass('selected').addClass('unavailable');
                    });
                    target.addClass('selected').removeClass('unavailable');
                }
            },

            configureAttributes: function(event, result)
            {
                var self = this;
                var target = $(event.target);
                var attribute = target.parents('.attribute');
                var optionId = target.data('option-id');

                var currentLevel = attribute.data('index');
                var currentLevelIsFirst = currentLevel == 0;

                var nextLevel = currentLevel + 1;
                var nextLevelIsLast =  nextLevel == self.configurableProductOptionData().max_level;

                var lastLevel = currentLevel - 1;
                var lastLevelIsfirst = lastLevel <= 0;

                if(nextLevelIsLast || self.configurableProductOptionData().levels == 1) {
                    $('.configure-item-modal').removeClass('incomplete');
                } else {
                    $('.configure-item-modal').addClass('incomplete');
                }

                var selectionHash = '';

                attribute.siblings().each(function(e) {
                    if($(this).data('index') < currentLevel) {
                        var selectedOption = $(this).find('.option a.selected:first').data('option-id');
                        selectionHash = selectionHash + selectedOption + '-';
                    }
                });

                selectionHash = selectionHash + optionId;

                if(currentLevel < this.configurableProductOptionData().max_level) {
                    attribute.find('.selected:first').removeClass('selected');
                    target.addClass('selected');

                    if(currentLevel < (this.configurableProductOptionData().max_level - 1)) {
                        // 1 level or more of normal attributes before selection attribute
                        // Reset selection attributes & reset all other attributes except 1 below (if there are more)
                        $('.selection-attribute:last').find('table:first').addClass('unavailable').find('input').each(function(e) {
                            $(this).addClass('unavailable').val(1);
                        })

                        if(currentLevel < (this.configurableProductOptionData().max_level - 2)) {
                            attribute.siblings().each(function(e) {
                                if($(this).data('index') > currentLevel && !$(this).hasClass('selection-attribute')) {
                                    $(this).find('.selected').each(function(ele) {
                                        $(this).removeClass('selected');
                                    });

                                    if($(this).data('index') > (currentLevel + 1)) {
                                        $(this).find('.option a').each(function(ele) {
                                            $(this).addClass('unavailable');
                                        })
                                    }
                                }
                            })
                        }
                    }

                    var nextAttribute = $(this.selectors.configurableProductModal + ' .attribute[data-index="' + (currentLevel + 1) + '"]');
                    nextAttribute.find('.unavailable').each(function(e) {
                        $(this).removeClass('unavailable');
                    });
                    nextAttribute.find('.option').each(function(e) {
                        var thisOptionId;
                        if(nextLevel == self.configurableProductOptionData().max_level) {
                            thisOptionId = $(this).data('option-id');
                        }
                        else {
                            thisOptionId = $(this).find('a:first').data('option-id')
                        }

                        var potentialSelectionHash = selectionHash + '-' + thisOptionId;
                        var thisOptionIsAvailable = false;

                        var thisOption = $(this);
                        $.each(result.options.products, function (index, product) {
                            var optionHash = product.option_hash;

                            if(nextLevelIsLast) {
                                if(potentialSelectionHash == optionHash) {
                                    thisOptionIsAvailable = true;
                                    thisOption.find('.price:first').text(
                                        self.currencyFormat(result.options.available[potentialSelectionHash]['price'], true)
                                    );
                                    thisOption.find('.available:first').text(
                                        parseInt(result.options.available[potentialSelectionHash]['qty_available'])
                                    );
                                }
                                thisOption.data('product-data', result.options.available[potentialSelectionHash]);
                            } else {
                                if(optionHash.indexOf(potentialSelectionHash) > -1) {
                                    thisOptionIsAvailable = true;
                                    return false;
                                }
                            }
                        });



                        var selectionQtyHash = '';
                        $('.attribute .selected').each(function(ele) {
                            selectionQtyHash = $(this).data('option-id') + '-';
                        });

                        selectionQtyHash = selectionQtyHash + $(this).data('option-id');
                            var productData = self.configurableProductQuantities[selectionQtyHash] ?? false;


                        if(!thisOptionIsAvailable) {
                            $(this).addClass('unavailable');
                            $(this).find('.quantity input:first').val(0).prop('disabled', true);
                        } else {
                            $(this).removeClass('unavailable');
                            var optionQty = (productData && productData['is_selected']) ? productData['qty'] : 0;
                            $(this).find('.quantity input:first').val(optionQty).prop('disabled', false);
                        }
                    })
                }
                else {
                    // this is the selection attribute
                }
            },

            bindConfigurableQuantities: function() {
                $('.selection-attribute .option  [name="qty"]').bind('change', function(event) {
                    self.updateConfigurableQuantities(event);
                });
            },

            updateConfigurableQuantities: function(event)
            {
                var selectionHash = '';
                var element = event.target;
                var optionId = $(element).parents('.option').data('option-id');
                var qty = $(element).val();

                var productData = $(element).parents('.option').data('product-data');
                productData['qty'] = qty;

                if(qty > 0) {
                    productData['is_selected'] = true;

                } else {
                    productData['is_selected'] = false;
                }

                $('.attribute .selected').each(function(ele) {
                      selectionHash = $(this).data('option-id') + '-';
                });

                selectionHash = selectionHash + optionId;

                self.configurableProductQuantities[selectionHash] = productData;
            },

            removeQuoteItem: function(data, event)
            {
                var product_id = data.product_id();

                $.each(self.quoteItems(), function(index, item) {
                    try {
                        if(item().product_id() == product_id) {
                            self.quoteItems.remove(item);
                        }
                    } catch(err) {
                    }
                });

                self.updateQuote();
            },

            removeItemConfirmShow: function (data, event)
            {
                var target = $(event.target);

                target.siblings('.remove-confirm').show();
            },

            removeItemConfirmClose: function (data, event)
            {
                var target = $(event.target);

                target.parents('.remove-confirm').hide();
            },

            populateItemTable: function()
            {
                var self = this;

                $.each(window.quote().items, function(item, data) {
                    var item = ko.observable({
                        item_id: ko.observable(data.item_id),
                        product_id: ko.observable(data.product_id),
                        sku: ko.observable(data.sku),
                        name: ko.observable(data.name),
                        custom_options: ko.observable(data.custom_options),
                        custom_options_array: ko.observableArray(data.custom_options_array),
                        image_url: ko.observable(data.image_url),
                        cost_price: ko.observable(data.cost_price),
                        price: ko.observable(data.price),
                        custom_price: ko.observable(data.custom_price),
                        tier_prices: ko.observable(data.tier_prices),
                        tier_price_applied: ko.observable(false),
                        catalog_rules: ko.observable(data.catalog_rules),
                        discount: ko.observable(data.discount),
                        discount_percent: ko.observable(data.discount_percent),
                        tax: ko.observable(data.tax),
                        tax_percent: ko.observable(data.tax_percent),
                        qty: ko.observable(data.qty),
                        margin: ko.observable(parseFloat(((data.custom_price - data.cost_price) / data.custom_price) * 100).toFixed(2)),
                        row_total: ko.observable(data.row_total),
                        comments: ko.observableArray(),
                        comment_count: ko.observable(data.comment_count)
                    });

                    $.each(data.comments, function(index, comment) {
                       item().comments.push(comment);
                    });

                    self.quoteItems.push(item);
                    self.updateQuote(false);
                });
            },


            updateQuote: function(saveQuote = true)
            {
                var self = this;

                window.quote().items = [];
                $.each(this.quoteItems(), function(index, item) {
                    window.quote().items.push(item());
                });

                $(this.selectors.quoteTotals).trigger('updateQuoteTotals');

                if(saveQuote) {
                    $(this.selectors.dashboard).trigger('saveQuote');
                }
            },

            updateQuoteItemOnKeyup: function(data, event)
            {
                var target = $(event.target);
                var updateType = target.attr('name');
                var char = String.fromCharCode(event.which);

                if(isNaN(char)) {
                    var value = target.val();
                    target.val(value.replace(/[^\d.-]/g, ''));
                }

                target.trigger('change');
            },

            updateQuoteItem: function(data, event)
            {
                data[$(event.target).attr('name')]($(event.target).val());
                var updateType = $(event.target).attr('name');

                self.editQuoteItem(data, updateType);
            },

            updateItemValue: function(data, event)
            {
                var input = $(event.target).parents('.admin__field-control').find('.admin__control-text');

                var isIncrement = $(event.target).hasClass('incrementInput');
                var type = input.data('type')
                var value = type == 'integer' ? parseInt(input.val()) : parseFloat(input.val())

                var minValue = type == 'integer' ? parseInt(input.attr('min')) : parseFloat(input.attr('min'));

                if(isIncrement) {
                    value = value + 1;
                }
                else {
                    if(value - 1 >= minValue) {
                       value = value - 1;
                    } else {
                        value = minValue;
                    }
                }

                if(value != input.val()) {
                    data[input.attr('name')](value);
                    input.val(type == 'integer' ? value : value.toFixed(2));
                    input.trigger('change');
                }
            },

            configureResults: function(focusPage = false)
            {
                var self = this;

                this.hasPreviousProductPage(this.currentPage() > 1 ? true : false);
                this.hasNextProductPage(this.currentPage() < this.findProductTotalPages() ? true : false);

                var firstPage = this.getFirstPage();
                var lastPage = this.getLastPage();
                var currentPage = firstPage;

                this.findProductPages.removeAll();

                while(currentPage <= lastPage) {
                    this.findProductPages.push({
                        page: currentPage,
                        selected: currentPage == this.currentPage() ? 'selected' : 'unselected'
                    });

                    currentPage++;
                }

                //configure products
                var firstResult = this.currentPage() == 1 ? 0 : ((this.currentPage() - 1) * this.findProductsPerPage()) + 1;
                var lastResult = this.currentPage() == 1 ? this.findProductsPerPage() : this.currentPage() * this.findProductsPerPage();

                this.findProductQueryPageMatches.removeAll();

                var currentResult = firstResult;
                while(currentResult < lastResult) {
                    if(this.findProductQueryMatches().hasOwnProperty(currentResult)) {
                        this.findProductQueryPageMatches.push(this.findProductQueryMatches()[currentResult]);
                    }
                    currentResult++;
                }

                if(focusPage) {
                    $('.findProductResults .results .result:first .view a').focus();
                }
            },

            getFirstPage: function()
            {
                if(this.currentPage() == 1) {
                    return this.currentPage();
                }

                var pagesEachSide = Math.floor(this.pagesVisibleInPagination() / 2);
                var firstPage = this.currentPage() - pagesEachSide;

                if(firstPage < 1) {
                    firstPage = 1;
                }

                return firstPage;
            },

            getLastPage: function()
            {
                var lastPage = this.getFirstPage() + (this.pagesVisibleInPagination() - 1);

                if(lastPage <= this.findProductTotalPages()) {
                    return lastPage;
                }

                return this.findProductTotalPages();
            },

            findProduct: function(data, event)
            {
                var self = this;
                var result;
                var key = event.which;
                this.findProductQuery($(this.selectors.findProduct).val());

                if(key == 27) {
                    // ESC
                    self.toggleShowResults(false);
                    return;
                }
                if(key == 40) {
                    // Down Arrow
                    if(this.findProductQuery().length >= 3) {
                        self.toggleShowResults(true)
                        $(this.selectors.findProductResults).find('a:first').focus();
                    }
                    return;
                }

                if(this.findProductQuery().length >= 3) {
                    this.toggleShowResults(true);
                }
                else {
                    this.toggleShowResults(false);
                    return;
                }

                this.findProductQueryId(this.findProductQueryId() + 1);

                $.ajax({
                    url: self.config.urls.find,
                    data: {
                        query: self.findProductQuery(),
                        queryId: self.findProductQueryId(),
                        customer_group_id: window.quote().customer.customer_group.hasOwnProperty('group_id') ? window.quote().customer.customer_group.group_id : 0,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $(self.selectors.findProductResults).addClass('loading');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.findProductResultCount(result.results);
                        self.findProductTotalPages(result.pages);
                        if(result.queryId == self.findProductQueryId()) {
                            self.findProductQueryMatches({});
                            if(result.results >= 1) {
                                self.findProductQueryMatches(result.matches);
                                self.currentPage(1);
                            }
                            else {
                                self.currentPage(0)
                            }

                            self.configureResults();
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $(self.selectors.findProductResults).removeClass('loading');
                    }
                });
            },

            closeFindProductResults: function(data, event)
            {
                var key = event.which;
                if(key == 27) {
                    self.toggleShowResults(false);
                    $(self.selectors.findProduct).focus();
                }
            },

            addProductToQuote: function(data, event)
            {
                self.addQuoteItem(data, event);
            },

            removeItemFromQuote: function(data, item)
            {
                $(self.productSelectors.quoteItems).trigger('removeQuoteItem', [data]);
            },

            changeProductResultPage: function(data, event)
            {
                self.currentPage(data.page);
                self.configureResults(true);
            },

            previousProductPage: function(data, event)
            {
                self.currentPage(this.currentPage() - 1);
                self.configureResults(true);
            },

            nextProductPage: function(data, event)
            {
                self.currentPage(parseInt(this.currentPage()) + 1);
                self.configureResults(true);
            },

            firstProductPage: function()
            {
                self.currentPage(1);
                self.configureResults(true);
            },

            lastProductPage: function()
            {
                self.currentPage(this.findProductTotalPages());
                self.configureResults(true);
            },

            toggleShowResultsFocus: function(data, event)
            {
                if($(self.selectors.findProduct).is(":focus")) {
                    let showResults = $(self.selectors.findProduct).val().length >= 3;
                    self.toggleShowResults(showResults);
                }
                else {
                    self.toggleShowResults(false);
                }
            },

            toggleShowResults: function(state)
            {
                var self = this;

                if(state == true) {
                    $(self.selectors.findProductResults).show();
                }
                else {
                    setTimeout(function() {
                        if(!$(self.selectors.findProductResults).find('a:focus,button:focus').length) {
                            if(!self.findProductPreventClose()) {
                                $(self.selectors.findProductResults).hide();
                            }
                        }

                    }, 200);
                }
            },

            openViewProductUrl: function(data, event)
            {
                var url = $(event.target).attr('href');
                window.open(url, '_blank');
            },

            preventFindProductClose: function(data, event)
            {
                if(!self.findProductPreventClose()) {
                    self.findProductPreventClose(true);
                    setTimeout(function() {
                        self.findProductPreventClose(false);
                    }, 200);
                }
            },

            calculateMargin: function(customPrice, costPrice)
            {
                var margin = ((customPrice - costPrice) / customPrice) * 100
                return parseFloat(margin).toFixed(2);
            },

            computeItemMargin: function(data, event)
            {
                var diff = data.cost_price() - data.custom_price();
                var marginPercent = (diff / data.cost_price()) * 100;

                return marginPercent.toFixed(2);
            },

            currencyFormat: function(price, includeSymbol = true)
            {
                if(price != null) {
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
