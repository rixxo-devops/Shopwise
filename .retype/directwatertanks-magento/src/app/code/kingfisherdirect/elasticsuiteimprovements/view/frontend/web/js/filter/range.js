define([], function () {
    return function (config, element) {
        element.addEventListener('submit', function (event) {
            event.preventDefault()

            var data = new FormData(element)
            var from = +data.get('from')
            var to = +data.get('to')

            if (from > to) {
                // make sure "to" value is always higher than "from" value
                var old_to = to
                to = from
                from = old_to
            }

            var searchParams = new URLSearchParams(window.location.search);
            searchParams.set(config.name, from + "-" + to);
            window.location.search = searchParams.toString();
        })
    }
})
