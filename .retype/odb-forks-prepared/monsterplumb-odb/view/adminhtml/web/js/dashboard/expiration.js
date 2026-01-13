define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'jquery/validate'
    ], function ($, Component, ko, modal) {
        'use strict';

        let self;

        return Component.extend({
            defaults: {
                template: 'Rixxo_Odb/dashboard/expiration'
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                expirationDate: '.expiration-wrapper input',
                expirationDateWrapper: '.expiration-wrapper .expiration-date',
                expirationDays: '.expiration-wrapper select'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';

                this.expirationDays = ko.observable();
                this.expirationDate = ko.observable();

                setTimeout(function () {
                    self.initExpiration();
                }, 250);
            },

            initExpiration: function() {
                this.expirationDays(window.quote().expiration.days);
                this.expirationDate(window.quote().expiration.date);
                $(this.selectors.expirationDate).val(this.expirationDate())

                if(this.expirationDays() == 'custom') {
                    $(this.selectors.expirationDateWrapper).show();
                }
            },

            bindExpiration: function()
            {

            },

            getExpirationDays: function()
            {
                return this.expirationDays();
            },

            getExpirationDate: function(data, event)
            {
                return this.expirationDate();
            },

            expirationDatepickerInit: function()
            {
                $(this.selectors.expirationDate).datepicker({
                    dateFormat: 'dd/mm/yy',
                    minDate : 0
                });
            },

            epxirationDatePickerKeydown: function(data, event)
            {
                event.preventDefault();
                return false;
            },

            expirationDatePickerReset: function(data, event)
            {
                $(this.selectors.expirationDate).val('');
                $(this.selectors.expirationDate).trigger('change');

                this.updateQuote();
            },

            setExpirationDate: function()
            {
                this.expirationDate($(this.selectors.expirationDate).val())
                this.updateQuote();
            },


            setExpirationDays: function(event, data)
            {
                this.expirationDays($(this.selectors.expirationDays).val());
                if(this.expirationDays() == 'custom') {
                    $(this.selectors.expirationDateWrapper).show();
                } else {
                    $(this.selectors.expirationDate).val('');
                    $(this.selectors.expirationDate).trigger('change');
                    $(this.selectors.expirationDateWrapper).hide();

                    $(self.selectors.dashboard).trigger('saveQuote');
                }
            },

            updateQuote: function()
            {
                window.quote().expiration.days = this.expirationDays();
                window.quote().expiration.date = this.expirationDate();

                $(self.selectors.dashboard).trigger('saveQuote');
            },
        })
    }
);
