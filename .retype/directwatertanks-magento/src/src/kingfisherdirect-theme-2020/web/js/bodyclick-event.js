define([], function setupOverlayClick () {
  document.body.addEventListener('click', function (event) {
    if (event.target === document.body) {
      var event = new Event('bodyclick')
      document.body.dispatchEvent(event)
    }
  })
})
