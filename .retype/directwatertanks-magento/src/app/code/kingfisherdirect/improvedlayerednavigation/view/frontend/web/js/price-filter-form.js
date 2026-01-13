define([], function () {
  return function (config, node) {
    if (node.tagName !== 'FORM') {
      return
    }

    node.addEventListener('submit', function (event) {
      event.preventDefault()
      var formData = new FormData(node)
      var range = formData.get('price_min') + '-' + formData.get('price_max')

      if (range === '-') {
        range = ''
      }

      window.location.href = config.formUrl.replace('__price__range__', range)
    });
  }
})
