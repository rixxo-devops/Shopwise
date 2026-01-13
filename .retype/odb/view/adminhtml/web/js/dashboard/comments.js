define([
    'jquery',
    'uiComponent',
    'ko',
    'loader'
    ], function ($, Component, ko) {
        'use strict';

        var self;

        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/dashboard/comments',

                commentsContent: ko.observable(),
                deliveryInstructions: ko.observable(),
                warehouseInstructions: ko.observable()
            },
            selectors: {

            },

            initialize: function (config) {
                self = this;

                this._super();
                self.config = config;

                setTimeout(function() {
                    self.initComments();
                }, 250);
            },

            initComments: function() {
                self.commentsContent(window.quote().comments);
                self.deliveryInstructions(window.quote().delivery_instructions);
                self.warehouseInstructions(window.quote().warehouse_instructions);
            },

            saveComments: function(data) {
                var comment = $.trim(self.commentsContent());

                if(comment.length > 0) {
                    window.quote().comments = comment;

                    $('section.odb-dashboard').trigger('saveQuote');
                }
            },
            saveDeliveryInstructions: function(data) {
                var comment = $.trim(self.deliveryInstructions());

                if(comment.length > 0) {
                    window.quote().delivery_instructions = comment;

                    $('section.odb-dashboard').trigger('saveQuote');
                }
            },
            saveWarehouseInstructions: function(data) {
                var comment = $.trim(self.warehouseInstructions());

                if(comment.length > 0) {
                    window.quote().warehouse_instructions = comment;

                    $('section.odb-dashboard').trigger('saveQuote');
                }
            },

            toggleCommentsInstructions: function(item, event)
            {
                var target = $(event.target).parents('.comment-type').first();
                if(target.hasClass('closed')) {
                    target.find('textarea').show();
                    target.addClass('open').removeClass('closed')
                } else {
                    target.find('textarea').hide();
                    target.addClass('closed').removeClass('open')
                }
            },
        });
    }
);
