define([], function () {
    return function (config, element) {
        var scrollable = element.querySelector('.carousel-row')
        var pos = {}
        var hasClickListener = false

        for (var draggable of scrollable.querySelectorAll('a, img')) {
            draggable.draggable = false
        }

        scrollable.addEventListener('mousedown', function (e) {
            scrollable.classList.add('scrolling')
            pos = {
                // The current scroll
                left: scrollable.scrollLeft,
                top: scrollable.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            }


            scrollable.addEventListener('mousemove', mouseMoveHandler)
            scrollable.addEventListener('mouseup', mouseUpHandler)
            scrollable.addEventListener('mouseleave', mouseUpHandler)
        })

        function onClickHandler (event) {
            event.preventDefault()
            scrollable.removeEventListener('click', onClickHandler)
            hasClickListener = false
        }

        function mouseMoveHandler (event) {
            // How far the mouse has been moved
            var dx = event.clientX - pos.x
            var dy = event.clientY - pos.y

            if (!hasClickListener && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
                console.log("adding click handler")
                hasClickListener = true
                scrollable.addEventListener('click', onClickHandler)
            }

            // Scroll the element
            scrollable.scrollTop = pos.top - dy
            scrollable.scrollLeft = pos.left - dx
        }

        function mouseUpHandler (event) {
            var dx = event.clientX - pos.x
            var dy = event.clientY - pos.y

            scrollable.removeEventListener('mousemove', mouseMoveHandler);
            scrollable.removeEventListener('mouseup', mouseUpHandler);
            scrollable.removeEventListener('mouseleave', mouseUpHandler);

            scrollable.classList.remove('scrolling')
        }

        var actions = {
            prev (e) {
                e.preventDefault()
                scrollable.scrollBy({
                    left: -1,
                    behavior: 'smooth',
                })
            },

            next (e) {
                e.preventDefault()
                scrollable.scrollBy({
                    left: 1,
                    behavior: 'smooth',
                })
            }
        }

        var controls = element.querySelectorAll('[data-carousel]')

        for (var control of controls) {
            var action = control.dataset.carousel

            if (typeof actions[action] === 'function') {
                control.addEventListener('click', actions[action])
            }
        }
    }
})
