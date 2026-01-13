/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
], function ($) {
    'use strict';

    return function (widget) {
        $.widget('mage.breadcrumbs', widget, {
            options: {
                categoryUrlSuffix: '',
                useCategoryPathInUrl: false,
                product: '',
                categoryItemSelector: '.header-navigation__item',
                menuContainer: '.header-navigation__list--root'
            },

            /**
             * Find parent menu item for current.
             *
             * @param {Object} menuItem
             * @return {Object|null}
             * @private
             */
            _getParentMenuItem: function (menuItem) {
                var menuLink,
                    parentClass,
                    parentMenuItem = null;

                if (!menuItem) {
                    return null;
                }

                parentMenuItem = menuItem.first().parent()

                do {
                    parentMenuItem = parentMenuItem.parent().closest(this.options.categoryItemSelector)
                    menuLink = parentMenuItem.find('> a');

                    // if href is there and it doesnt end with # char
                    if (menuLink.prop('href') && menuLink.prop('href').indexOf('#', this.length - 1) === -1) {
                        return menuLink
                    }
                } while (parentMenuItem.length > 0);

                return null;
            },

            _resolveCategoryMenuItem: function () {
                var categoryUrl = this._resolveCategoryUrl(),
                    menu = $(this.options.menuContainer),
                    categoryMenuItem = null,
                    categoryMenuItems = null

                if (categoryUrl && menu.length) {
                    var plainMenuElement = menu[0]

                    categoryMenuItems =
                        menu
                            .find(
                                this.options.categoryItemSelector +
                                ' > a:not(.nav-product)[href="' + categoryUrl + '"]'
                            )

                    if (categoryMenuItems.length === 0) {
                        return null
                    }

                    if (categoryMenuItems.length === 1) {
                        return categoryMenuItems
                    }

                    categoryMenuItem = null
                    var lowestNumberOfParents = null

                    categoryMenuItems.each(function (index, item) {
                        var currentNumberOfParents = 0
                        var traversedItem = item

                        while (traversedItem && traversedItem.parentElement !== plainMenuElement) {
                            currentNumberOfParents++
                            traversedItem = traversedItem.parentElement
                        }

                        if (!lowestNumberOfParents || currentNumberOfParents < lowestNumberOfParents) {
                            categoryMenuItem = item
                            lowestNumberOfParents = currentNumberOfParents
                        }
                    })

                    categoryMenuItem = $(categoryMenuItem)
                }

                return categoryMenuItem;
            },
        });

        return $.mage.breadcrumbs;
    };
});
