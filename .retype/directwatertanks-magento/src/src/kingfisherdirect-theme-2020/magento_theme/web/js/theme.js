'use strict';

define([
    'mage/mage',
    'domReady!',
], function () {
    // navigation
    var navigationOpenClass = 'navigation-open'
    var navigation = document.querySelector('.navigation')
    var togglers = document.querySelectorAll('[data-action=toggle-nav]')

    if (!navigation) {
        return
    }

    function closeAll () {
        document.body.classList.remove(navigationOpenClass)
        document.querySelectorAll('.navigation .item-open').forEach(function (openElement) {
            openElement.classList.remove('item-open')
        })
    }

    function toggleNav () {
        document.body.classList.toggle(navigationOpenClass)
    }

    /**
     * Updates image for list level 1 from element.
     */
    function setCategoryImage (el) {
        var image = el.dataset.categoryImage

        while (el !== navigation) {
            if (el.classList.contains('navigation__list--level-1')) {
                el.style.backgroundImage = 'url(' + image + ')'

                return
            }

            el = el.parentElement
        }
    }

    // open-close main menu (mobile mostly)
    togglers.forEach(function (toggleNavEl) {
        toggleNavEl.addEventListener('click', toggleNav)
    })

    // close all menus when clicked on overlay
    document.body.addEventListener('click', function (event) {
        if (document.body !== event.target) return;

        closeAll()
    })

    // toggle link submenu + add overlay if neccessary
    navigation.addEventListener('click', function (e) {
        var el = e.target

        while (el.tagName !== 'A') {
            if (el === navigation) {
                return
            }

            el = el.parentElement
        }

        // get the LI above
        var parentEl = el.parentElement

        if (!parentEl
            || !parentEl.classList.contains('navigation__item--parent')
            || Number.parseInt(parentEl.dataset.level) >= 2
        ) {
            return
        }

        e.preventDefault()

        var isOpened = parentEl.classList.toggle('item-open')

        // close sibblings
        if (isOpened) {
            parentEl.parentElement.querySelectorAll('.item-open').forEach(function (element) {
                if (element === parentEl) {
                    return
                }
                element.classList.remove('item-open')
            })
        }

        // we check here whether menu is fixed (slided from left really)
        if (window.getComputedStyle(navigation).position === 'fixed') {
            return
        }

        if (document.querySelector('.navigation .item-open')) {
            document.body.classList.add(navigationOpenClass)
        } else {
            document.body.classList.remove(navigationOpenClass)
        }

        if (Number.parseInt(parentEl.dataset.level) === 0) {
            var categoryEl = parentEl.querySelector('[data-category-image]')

            if (categoryEl) {
                setCategoryImage(categoryEl)
            }
        }
    })

    navigation.addEventListener('mouseover', function (event) {
        if (!event.target.dataset.categoryImage) {
            return
        }

        setCategoryImage(event.target)
    })
});
