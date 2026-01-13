define([
], function () {
    var optionsProto = {
        orderControl: '[data-role="sorter"]',
        direction: 'product_list_dir',
        order: 'product_list_order',
        directionDefault: 'asc',
        url: ''
    };

    return function (config, element) {
        var options = Object.assign({}, optionsProto, config)

        var orderControl = element.querySelector(options.orderControl)

        orderControl && orderControl.addEventListener("change", function (event) {
            var value = event.target.value

            var valueParts = value.split('.')
            var direction = valueParts.length > 1 ? valueParts.pop() : options.directionDefault
            value = valueParts.join('.')

            var params = {}
            params[options.order] = value
            params[options.direction] = direction || options.directionDefault

            var url = changeUrl(params, options.url)
            location.href = url
        })
    }

    function changeUrl(params, url) {
        var urlParts = url.split("?")
        var baseUrl = urlParts.shift()

        if (!urlParts[0]) {
            return baseUrl + buildQueryString(params)
        }

        urlParts = urlParts[0].split("#")
        var queryString = urlParts.shift()
        var hashPart = urlParts.pop()
        hashPart = hashPart ? "#" + hashPart : ""

        var queryParams = queryString.split("&")
        queryParams = queryParams
            .map(function (value) {
                return value.split("=")
            })
            .reduce(function (params, value) {
                params[value[0]] = value[1]

                return params
            }, {})

        Object.assign(queryParams, params)

        return baseUrl + buildQueryString(queryParams) + hashPart
    }

    function buildQueryString(params) {
        var qs = ""

        for (var prop in params) {
            qs += (qs ? "&" : "?") + prop + "=" + params[prop]
        }

        return qs
    }
})
