require([
    'jquery',
],
function($) {
  "use strict";

    $(document).ready(function(){
        var lastScrollPageY = 0
        var $body = $(document.body)
        var menu = document.querySelector('.header-navigation')
        var activeItem = null
        var rootList = document.querySelector('.header-navigation__list--root')

        /**
         * indicates whethner root menu was opened because of opening any of descendants
         * or was opened directly
         */
        var isOpenRecursively = false

        function closeMain() {
            $body.removeClass('nav-open')
        }

        /**
         * Closes a submenus.
         */
        function closeSubmenus() {
            var submenu = menu
            activeItem = null

            // if argument passed then we close only descendants of passed element
            if (arguments[0]) {
                submenu = arguments[0]
                var activeParent = $(submenu).closest('.header-navigation__item--active')

                // it's a jquery object
                if (activeParent.length > 0) {
                    activeItem = activeParent[0]
                }
            }

            // just in case we have more than one open
            $(submenu.querySelectorAll('.header-navigation__item--active'))
                .removeClass('header-navigation__item--active')
        }

        function close() {
            closeMain()
            closeSubmenus()
        }

        function updateRootMenu () {
            var openItem = menu.querySelector('.header-navigation__item--active')

            if (!openItem) {
                if (isOpenRecursively) {
                    // top menu was open recursively, so we can close it
                    closeMain()

                    return
                }

                return
            }

            // menu is active
            if ($body.hasClass('nav-open')) {
                // and menu already has open class, so no need for anything
                return
            }

            // submenu opened without opening main menu first (probably desktop)
            isOpenRecursively = true
            $body.addClass('nav-open')
        }

        // ensure passed element is viewport
        function ensureInViewport(el)
        {
            if (!el || !el instanceof Node) {
                return
            }

            var rect = activeItem.getBoundingClientRect()

            if (rect.top < 0) {
                var currentPos = document.documentElement.scrollTop || document.body.scrollTop
                window.scrollTo(0, currentPos + rect.top)
            }
        }

        function itemLinkClickHandler(e) {
            e.preventDefault()

            var item = e.target.parentElement
            var $item = $(item)
            var list = $item.closest('.header-navigation__list')[0]

            // are we going to open or close menu?
            var toOpen = !$item.hasClass('header-navigation__item--active')

            closeSubmenus(list)

            if (toOpen) {
                activeItem = item
                $item.addClass('header-navigation__item--active')
                ensureInViewport(activeItem)
            }

            updateRootMenu()
        }

        // main menu toggle
        $body.on('click', '.nav-toggle', function (e) {
            e.preventDefault()
            $body.toggleClass('nav-open')
            $body.removeClass('search-open')
            $('.aa-dropdown-menu').hide();
            isOpenRecursively = false
        })

        $('.header-navigation').on('click', '.header-navigation__item--parent > .header-navigation__inner-link', itemLinkClickHandler);
        $('.header-navigation').on('click', '.header-navigation__item--parent > .header-navigation__link', itemLinkClickHandler);

        // overlay close
        $('.header-navigation').on('click', function (e) {
            // if directly clicked on header-navigation (it's `after` pseudo after
            // element which is overlay, but after is not event aware)
            if (e.currentTarget === e.target) {
                close()
            }
        })

        document.addEventListener('scroll', function (e) {
            if (!$body.hasClass('nav-open')) {
                // menu is not open, so nothing to close
                return
            }

            // ensure we don't bloat browser with constant checks for menu visibility
            // the further checks will happen only if user scrolled more than 75px
            if (Math.abs(lastScrollPageY - event.pageY) <= 75) {
                return
            }

            lastScrollPageY = event.pageY

            // here we get a current position of the root menu…
            var rootBoundingRect = rootList.getBoundingClientRect()
            var activeBoundingRect = null

            if (activeItem) {
                // …and item relative to current view port
                var activeSubmenu = activeItem.querySelector('.header-navigation__submenu')
                activeBoundingRect = activeSubmenu.getBoundingClientRect()
            }

            // and we check if we scrolled pass main menu and
            // active submenu if it's there
            if (rootBoundingRect.bottom < -25 &&
                (!activeBoundingRect || activeBoundingRect.bottom < -25)
            ) {
                close()
            }
        })

        return

    })

});
