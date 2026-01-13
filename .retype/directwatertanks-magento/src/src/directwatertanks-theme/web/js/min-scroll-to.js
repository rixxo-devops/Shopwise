'use strict';

define([], function () {
  return function (target) {
    var targetRect = target.getBoundingClientRect()

    if (targetRect.top <= 0) {
      return
    }

    window.scrollBy({
      top: targetRect.top,
      behavior: 'smooth',
    })
  }
})
