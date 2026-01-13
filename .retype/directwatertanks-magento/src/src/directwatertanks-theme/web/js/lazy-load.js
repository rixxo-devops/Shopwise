/**
 * This file causes that elements will keep `lazyLoadClass` until user
 * scrolls so far so it's within the viewport.
 *
 * This can be used to lazily load background images
 */
require([
  'domReady!'
],
function () {
  var lazyLoadClass = 'lazy-load'
  var lazyloadImages = document.querySelectorAll("." + lazyLoadClass);

  if (!"IntersectionObserver" in window) {
    // sorry memory you use ancient browser
    lazyloadImages.forEach(function(img) {
      img.classList.remove(lazyLoadClass)
    })

    return
  }

  var observerOptions = {
    // it will remove the class 100px before it scrolls into view
    rootMargin: "200px"
  }

  var imageObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var image = entry.target;
        image.src = image.dataset.src;
        image.classList.remove(lazyLoadClass);
        imageObserver.unobserve(image);
      }
    });
  }, observerOptions);

  lazyloadImages.forEach(function(image) {
    imageObserver.observe(image);
  })
})
