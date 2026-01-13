require(['jquery'], function($) {
   'use strict';

    $(document).on('ajax:addToCart', function(event, data) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    return function (target) {
        return target
    }
});
