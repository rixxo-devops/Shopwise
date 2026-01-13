define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'jquery/validate'
    ], function ($, Component, ko, modal) {
        'use strict';

        var self;

        return Component.extend({
            defaults: {
                template: 'KingfisherDirect_Odb/dashboard/stores',
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';
                this.stores = ko.observableArray(this.config.stores || []);
                this.selectedStoreId = ko.observable();
                if (typeof window.quote === 'function' && window.quote().store_id) {
                    this.selectedStoreId(window.quote().store_id);
                }

                this.selectedStoreId.subscribe(function (newStoreId) {
                    if (newStoreId) {
                        self.addStoreToQuote(newStoreId);
                    }else{
                        $('section.odb-dashboard').trigger('setStoreId', false);
                    }
                }.bind(this));

                this.getSelectedStoreName = ko.pureComputed(function () {
                    var store = this.stores().find(s => s.id == this.selectedStoreId());
                    return store ? store.name : '';
                }, this);

                return this;
            },

            addStoreToQuote: function(storeId)
            {
                $('section.odb-dashboard').trigger('setStoreId', storeId);
            },
        });
    }
);
