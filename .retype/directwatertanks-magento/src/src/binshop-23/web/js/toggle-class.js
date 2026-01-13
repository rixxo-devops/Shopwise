define(
    ['js/bodyclick-event'],
    function () {
        "use strict";
        return function (config, element) {
            if (!config.targets) {
                config.targets = config.selector
                ? document.querySelectorAll(config.selector)
                : [element]
            } else if (!Array.isArray(config.targets)) {
                config.targets = [config.targets]
            }

            config.class = config.class || "open"

            function toggle () {
                return config.targets.forEach(function (target) {
                    target.classList.toggle(config.class)
                })
            }

            function remove () {
                return config.targets.forEach(function (target) {
                    target.classList.remove(config.class)
                })
            }

            function add () {
                return config.targets.forEach(function (target) {
                    target.classList.add(config.class)
                })
            }

            function clickHandler (event) {
                event.preventDefault()
                toggle()
            }

            function deactivate () {
                element && element.removeEventListener('click', clickHandler)

                if (config.overlayDismiss) {
                    document.body.removeEventListener('bodyclick', remove)
                }
            }

            function activate () {
                element && element.addEventListener('click', clickHandler)

                if (config.overlayDismiss) {
                    document.body.addEventListener('bodyclick', remove)
                }
            }

            activate()

            return {
                remove: remove,
                toggle: toggle,
                add: add,
                deactivate: deactivate,
                activate: activate
            }
        }
    }
);
