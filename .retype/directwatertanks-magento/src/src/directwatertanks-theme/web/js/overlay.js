define([], function () {
  var api = {
    open: function () {
      document.body.classList.add('with-overlay')
    },

    close: function () {
      document.body.classList.remove('with-overlay')
    },

    setState: function (state) {
      if (state) {
        this.open()
      } else {
        this.close()
      }
    }
  }

  document.body.addEventListener('click', function (event) {
    if (event.target === document.body) {
      var event = new Event('overlayclick')
      document.body.dispatchEvent(event)

      if (event.defaultPrevented) {
        return
      }

      api.close()
    }
  })

  return api
})
