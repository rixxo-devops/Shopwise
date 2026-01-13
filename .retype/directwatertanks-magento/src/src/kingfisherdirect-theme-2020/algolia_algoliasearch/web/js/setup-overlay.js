'use strict'

define(['algoliaBundle'], function(algoliaBundle) {
  /**
   * I just wanted to say here that I cant believe how shit this Algolia Magento 2
   * module is.
   *
   * For example here, I need to get algolia's jQuery to seutp event listeners
   * instead of relying on default browser api or at least Magentos jQuery
   */
  return function (config, element) {
    var $el = algoliaBundle.$(element)

    $el.on('autocomplete:opened', function () {
      document.body.classList.add('algoliasearch-open')
    })
    $el.on('autocomplete:closed', function () {
      document.body.classList.remove('algoliasearch-open')
    })
  }
})
