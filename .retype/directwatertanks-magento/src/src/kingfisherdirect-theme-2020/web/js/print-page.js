define([
], function () {
  return function (config, element) {
    element.addEventListener('click', function (event) {
      event.preventDefault()

      if (window.ga) {
        window.ga('send', 'event', 'Page', 'print')
      }

      window.print()
    })
  }
});
