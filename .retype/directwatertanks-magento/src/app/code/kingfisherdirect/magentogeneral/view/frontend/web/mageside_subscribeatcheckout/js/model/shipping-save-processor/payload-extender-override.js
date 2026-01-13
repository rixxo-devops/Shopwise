define(function () {
    'use strict';
    return function (payloadExtender) {
        var newsletterCheckbox = document.querySelector('[name="newsletter-subscribe"]')

        payloadExtender.addressInformation['extension_attributes'] = {
            newsletter_subscribe: newsletterCheckbox ? newsletterCheckbox.checked : false
        };

        return payloadExtender;
    };
});
