define([], function () {
  'use strict';
  /**
   * Scrolls to an element
   */
  return function (target, config) {
    var targetRect = target.getBoundingClientRect()
    config = config || {}

    if (targetRect.top <= 0 && config.downOnly) {
      return
    }

    window.scrollBy({
      top: targetRect.top,
      behavior: 'smooth',
    })
  }
});
