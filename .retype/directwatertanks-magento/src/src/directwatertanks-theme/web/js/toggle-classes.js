"use strict";

define(
  [
    'js/overlay'
  ],
  function (overlay) {
    return function (config, element) {
      config.toggles = config.toggles || []
      config.toggleClass = config.toggleClass || "open"

      config.toggles.map(function (toggle) {
        toggle.elements = document.querySelectorAll(toggle.selector)
      })

      function isEnabled () {
        return element.classList.contains(config.toggleClass)
      }

      function toggleElementClass () {
        return element.classList.toggle(config.toggleClass)
      }

      function updateOtherElements (enable) {
        config.toggles.forEach(function (toggle) {
          var toggleClass = toggle.toggleClass || config.toggleClass

          for (var i = 0; i < toggle.elements.length; i++) {
            var toggleElement = toggle.elements[i];

            if (enable) {
              toggleElement.classList.add(toggleClass)
              return
            }

            toggleElement.classList.remove(toggleClass)
          }
        })
      }

      function clickHandler (event) {
        if (event && element.tagName === 'A') {
            event.preventDefault()
        }

        var status = toggleElementClass()
        updateOtherElements(status)

        if (config.overlay) {
          overlay.setState(status)
        }

        return true
      }

      element.addEventListener('click', clickHandler)

      if (config.overlay) {
        document.body.addEventListener('overlayclick', function () {
          if (isEnabled()) {
            clickHandler()
          }
        })
      }
    }
  }
)
