define(['jquery'], function ($) {
    'use strict';

    var mixin = {
        open3DModal: function () {
            this.modal = $('<iframe id="' + this.getCode() + '-3Dsecure-iframe" name="' + this.getCode() + '-3Dsecure-iframe"></iframe>').modal({
                modalClass: 'sagepaysuite-modal',
                title: "3D Secure Authentication",
                type: 'popup',
                responsive: false,
                clickableOverlay: false,
                closeOnEscape: false,
                buttons: []
            });
            this.modal.modal('openModal');
        },
    }

    return function (target) {
        return target.extend(mixin)
    }
})
