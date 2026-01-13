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
                template: 'Rixxo_Odb/dashboard/addresses',
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                addressWrapper: 'section.addresses .address-wrapper',
                billingAddress: '.address.billing-address',
                billingSavedAddresses:  '.address.billing-address .saved-addresses select',
                billingFirstName: '.address.billing-address .billing-first-name input',
                billingLastName: '.address.billing-address .billing-last-name input',
                billingPostcode: '.address.billing-address .billing-postcode input',
                billingStreet1: '.address.billing-address .billing-street-1 input',
                billingStreet2: '.address.billing-address .billing-street-2 input',
                billingCity:  '.address.billing-address .billing-city input',
                billingTelephone:  '.address.billing-address .billing-telephone input',
                billingCountry: '.address.billing-address .billing-country select',
                useDifferentShipping: '.address.shipping-address #differentShipping',
                shippingFirstName: '.address.shipping-address .shipping-first-name input',
                shippingLastName: '.address.shipping-address .shipping-last-name input',
                shippingPostcode: '.address.shipping-address .shipping-postcode input',
                shippingStreet1: '.address.shipping-address .shipping-street-1 input',
                shippingStreet2: '.address.shipping-address .shipping-street-2 input',
                shippingCity:  '.address.shipping-address .shipping-city input',
                shippingTelephone:  '.address.shipping-address .shipping-telephone input',
                shippingCountry: '.address.shipping-address .shipping-country select',
                orderButton: '.top .button.order'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                window.addressSelectors = this.selectors;

                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';

                this.countryData = ko.observableArray();

                this.customerId = ko.observable();

                this.addresses = ko.observableArray();
                this.selectedBillingAddressId = ko.observable();
                this.billingAddressLookupResults = ko.observableArray();
                this.billingAddressId = ko.observable();
                this.billingFirstName = ko.observable();
                this.billingLastName = ko.observable();
                this.billingPostcode = ko.observable();
                this.billingStreet1 = ko.observable();
                this.billingStreet2 = ko.observable();
                this.billingCity = ko.observable();
                this.billingTelephone = ko.observable();
                this.billingCountry = ko.observable();
                this.billingValidationPassed = ko.observable(false);

                this.selectedShippingAddressId = ko.observable();
                this.useDifferentShipping = ko.observable(false);
                this.shippingAddressLookupResults = ko.observableArray();
                this.shippingAddressId = ko.observable();
                this.shippingFirstName = ko.observable();
                this.shippingLastName = ko.observable();
                this.shippingPostcode = ko.observable();
                this.shippingStreet1 = ko.observable();
                this.shippingStreet2 = ko.observable();
                this.shippingCity = ko.observable();
                this.shippingTelephone = ko.observable();
                this.shippingCountry = ko.observable();
                this.shippingValidationPassed = ko.observable(false);

                this.addressLookupQueryId = ko.observable(1);
                this.preventAddressLookupClosing = ko.observable(false);

                this.preventQuoteUpdate = ko.observable(true);
                this.preventAddressReset = ko.observable(true);

                setTimeout(function () {
                    self.initAddresses();
                    setTimeout(function() {
                        self.preventQuoteUpdate(false);
                    }, 750);
                }, 250);
            },

            initAddresses: function()
            {
                if(this.config.addresses) {
                    if(this.config.addresses.hasOwnProperty('billing')) {
                        var address = this.config.addresses.billing;
                        this.billingFirstName(address.hasOwnProperty('first_name') ? address.first_name : '');
                        this.billingLastName(address.hasOwnProperty('last_name') ? address.last_name : '');
                        this.billingStreet1(address.hasOwnProperty('street_1') ? address.street_1 : '');
                        this.billingStreet2(address.hasOwnProperty('street_2') ? address.street_2 : '');
                        this.billingCity(address.hasOwnProperty('city') ? address.city : '');
                        this.billingPostcode(address.hasOwnProperty('postcode') ? address.postcode : '');
                        this.billingCountry(address.hasOwnProperty('country') ? address.country : '');
                        this.billingTelephone(address.hasOwnProperty('telephone') ? address.telephone : '');

                        $(this.selectors.billingCountry).val(address.country);
                    }

                    if(this.config.addresses.hasOwnProperty('shipping')) {
                        var address = this.config.addresses.shipping;
                        this.shippingFirstName(address.hasOwnProperty('first_name') ? address.first_name : '');
                        this.shippingLastName(address.hasOwnProperty('last_name') ? address.last_name : '');
                        this.shippingStreet1(address.hasOwnProperty('street_1') ? address.street_1 : '');
                        this.shippingStreet2(address.hasOwnProperty('street_2') ? address.street_2 : '');
                        this.shippingCity(address.hasOwnProperty('city') ? address.city : '');
                        this.shippingPostcode(address.hasOwnProperty('postcode') ? address.postcode : '');
                        this.shippingCountry(address.hasOwnProperty('country') ? address.country : '');
                        this.shippingTelephone(address.hasOwnProperty('telephone') ? address.telephone : '');

                        $(this.selectors.shippingCountry).val(address.hasOwnProperty('country') ? address.country : '');
                    }

                    if(this.config.addresses.hasOwnProperty('use_different')) {
                        this.useDifferentShipping(true);
                        $(this.selectors.useDifferentShipping).prop('checked', true);
                    }
                    console.log(this.useDifferentShipping());
                }

                if(window.quote().addresses.billing) {
                    this.selectedBillingAddressId(window.quote().addresses.billing.address_id);
                }

                if(window.quote().addresses.shipping) {
                    this.selectedShippingAddressId(window.quote().addresses.shipping.address_id);
                }

                $.each(this.config.countries, function(countryCode, data) {
                    self.countryData.push(data);
                });
            },

            allowAddressReset: function()
            {
                self.preventAddressReset(false);
            },

            isShippingElementDisabled: function() {
                return (self.useDifferentShipping() === true) ? false : true;
            },

            addBillingAddressValidation: function(data, event)
            {
                var billingAddressForm = $('#billingAddressForm');

                $('button.primary.order').bind('click', function(event) {
                    billingAddressForm.submit();
                });

                billingAddressForm.bind('submit', function(event) {
                    event.preventDefault();
                });

                setTimeout(function() {
                    var billingRules = {
                        billing_first_name: 'required',
                        billing_last_name: 'required',
                        billing_postcode: 'required',
                        billing_street_1: 'required',
                        billing_city: 'required',
                        billing_country: 'required',
                    }

                    if(self.config.telephone_required == 'req') {
                        billingRules['billing_telephone'] = 'required';
                    }

                    billingAddressForm.validate({
                        onkeyup: false,
                        onblur: true,
                        rules: billingRules,
                        messages: {
                            billing_firstname: 'This field is required',
                            billing_last_name: 'This field is required',
                            billing_postcode: 'Enter a valid email',
                            billing_street_1: 'This field is required',
                            billing_city: 'This field is required',
                            billing_telephone: 'This field is required',
                            billing_country: 'This field is required',
                        },
                        submitHandler: function(customerForm) {
                            $('#shippingAddressForm').submit();
                        }
                    });
                },1000);
            },

            addShippingAddressValidation: function(data, event)
            {
                var shippingAddressForm = $('#shippingAddressForm');

                shippingAddressForm.bind('submit', function(event) {
                    event.preventDefault();
                });

                var shippingRules = {
                    shipping_first_name: 'required',
                    shipping_last_name: 'required',
                    shipping_postcode: 'required',
                    shipping_street_1: 'required',
                    shipping_city: 'required',
                    shipping_country: 'required',
                }

                if(self.config.telephone_required == 'req') {
                    shippingRules['shipping_telephone'] = 'required';
                }

                setTimeout(function() {
                    shippingAddressForm.validate({
                        onkeyup: false,
                        onblur: true,
                        rules: shippingRules,
                        messages: {
                            shipping_firstname: 'This field is required',
                            shipping_last_name: 'This field is required',
                            shipping_postcode: 'Enter a valid email',
                            shipping_street_1: 'This field is required',
                            shipping_city: 'This field is required',
                            shipping_telephone: 'This field is required',
                            shipping_country: 'This field is required',
                        },
                        submitHandler: function(customerForm) {
                            $(self.selectors.orderButton).trigger('submitOrder');
                        }
                    });

                },1000);
            },

            bindAddresses: function()
            {
                $(this.selectors.addressWrapper).on('updateAddresses', function(event) {
                    self.updateAddresses();
                });

                $(this.selectors.addressWrapper).on('updateObservables', function(event) {
                    self.billingFirstName($('#billingAddressForm [name="billing_firstname"]').val());
                    self.billingLastName($('#billingAddressForm [name="billing_lastname"]').val());
                    self.billingStreet1($('#billingAddressForm [name="billing_street_1"]').val());
                    self.billingStreet2($('#billingAddressForm [name="billing_street_2"]').val());
                    self.billingCity($('#billingAddressForm [name="billing_city"]').val());
                    self.billingPostcode($('#billingAddressForm [name="billing_postcode"]').val());
                    self.billingTelephone($('#billingAddressForm [name="billing_telephone"]').val());
                    self.billingCountry($('#billingAddressForm [name="billing_country"]').val());

                    if($(self.selectors.useDifferentShipping).prop('checked') == false) {
                        self.shippingFirstName(self.billingFirstName());
                        self.shippingLastName(self.billingLastName());
                        self.shippingStreet1(self.billingStreet1());
                        self.shippingStreet2(self.billingStreet2());
                        self.shippingCity(self.billingCity());
                        self.shippingPostcode(self.billingPostcode());
                        self.shippingTelephone(self.billingTelephone());
                        self.shippingCountry(self.billingCountry());
                    } else {
                        console.log('use different');
                        self.shippingFirstName($('#shippingAddressForm [name="shipping_firstname"]').val());
                        self.shippingLastName($('#shippingAddressForm [name="shipping_lastname"]').val());
                        self.shippingStreet1($('#shippingAddressForm [name="shipping_street_1"]').val());
                        self.shippingStreet2($('#shippingAddressForm [name="shipping_street_2"]').val());
                        self.shippingCity($('#shippingAddressForm [name="shipping_city"]').val());
                        self.shippingPostcode($('#shippingAddressForm [name="shipping_postcode"]').val());
                        self.shippingTelephone($('#shippingAddressForm [name="shipping_telephone"]').val());
                        self.shippingCountry($('#shippingAddressForm [name="shipping_country"]').val());
                    }
                });
            },

            updateQuote: function()
            {
                if(!this.preventQuoteUpdate()) {
                    // window.quote().addresses.billing.address_id = this.selectedBillingAddressId();
                    // window.quote().addresses.shipping.address_id = this.selectedShippingAddressId();
                    setTimeout(function() {
                        $(self.selectors.dashboard).trigger('saveQuote');
                    }, 500);
                }
            },

            updateAddresses: function()
            {
                var result;

                if(window.quote().customer.customer_id) {
                    this.customerId(window.quote().customer.customer_id);
                    this.addresses.removeAll();

                    $.ajax({
                        url: self.config.urls.find,
                        data: {
                            customer_id: self.customerId(),
                            form_key: window.FORM_KEY
                        },
                        dataType: 'JSON',
                        method: 'post',
                        cache: false,
                        beforeSend: function() {
                            $(self.selectors.addressWrapper).addClass('loading');
                        },
                        success: function(response) {
                            result = JSON.parse(response);

                            if(!result.hasOwnProperty('error')) {
                                $.each(result.addresses, function(index, data) {
                                    self.addresses.push(data);
                                });
                            }
                        },
                        failure: function(response) {
                            result = JSON.parse(response);
                        },
                        complete: function() {
                            $(self.selectors.addressWrapper).removeClass('loading');
                        }
                    });
                }
            },

            resetAddress: function(addressType)
            {
                switch(addressType) {
                    case 'billing':
                        this.billingFirstName('');
                        this.billingLastName('');
                        this.billingStreet1('');
                        this.billingStreet2('');
                        this.billingCity('');
                        this.billingPostcode('');
                        this.billingTelephone('');
                        this.billingCountry('');
                        break;
                    case 'shipping':
                        this.shippingFirstName('');
                        this.shippingLastName('');
                        this.shippingStreet1('');
                        this.shippingStreet2('');
                        this.shippingCity('');
                        this.shippingPostcode('');
                        this.shippingTelephone('');
                        this.shippingCountry('');
                        break;
                }
            },

            useSelectedAddress: function(addressType)
            {
                var self = this;

                if(this.preventAddressReset() == false) {
                    var addressId = $('.address.' + addressType + '-address [name="saved-addresses"] option:selected:first').val();
                    if(addressId) {
                        $.each(this.addresses(), function(index, address) {
                            if(address.address_id == addressId) {
                                self.setAddress(addressType, address);
                            }
                        });
                    } else {
                        this.resetAddress(addressType);
                    }

                    this.saveAddresses();
                }

            },

            setAddress: function(addressType, address)
            {
                if(this.preventQuoteUpdate()) {
                    return
                }

                this.preventQuoteUpdate(true);

                switch (addressType) {
                    case 'billing':
                        this.selectedBillingAddressId(address.address_id);
                        this.billingFirstName(address.first_name);
                        this.billingLastName(address.last_name);
                        this.billingStreet1(address.street.hasOwnProperty(0) ? address.street[0] : '');
                        this.billingStreet2(address.street.hasOwnProperty(1) ? address.street[1] : '');
                        this.billingCity(address.city);
                        this.billingPostcode(address.postcode);
                        this.billingTelephone(address.telephone);
                        this.billingCountry(address.country);

                        if(this.useDifferentShipping() !== true) {
                            this.selectedShippingAddressId(address.address_id);

                            this.shippingFirstName(address.first_name);
                            this.shippingLastName(address.last_name);
                            this.shippingStreet1(address.street.hasOwnProperty(0) ? address.street[0] : '');
                            this.shippingStreet2(address.street.hasOwnProperty(1) ? address.street[1] : '');
                            this.shippingCity(address.city);
                            this.shippingPostcode(address.postcode);
                            this.shippingTelephone(address.telephone);
                            this.shippingCountry(address.country);
                            $(this.selectors.shippingCountry).val(this.shippingCountry());
                        }
                        break;
                    case 'shipping':
                        this.selectedShippingAddressId(address.address_id);

                        this.shippingFirstName(address.first_name);
                        $(this.selectors.shippingFirstName).val(this.shippingFirstName());
                        this.shippingLastName(address.last_name);
                        $(this.selectors.shippingLastName).val(this.shippingLastName());

                        this.shippingStreet1(address.street.hasOwnProperty(0) ? address.street[0] : '');
                        this.shippingStreet2(address.street.hasOwnProperty(1) ? address.street[1] : '');
                        this.shippingCity(address.city);
                        this.shippingPostcode(address.postcode);
                        this.shippingTelephone(address.telephone);
                        this.shippingCountry(address.country);
                        $(this.selectors.shippingCountry).val(this.shippingCountry());
                        break;
                }

                this.preventQuoteUpdate(false);
                $(this.selectors.billingPostcode).trigger('change');
            },

            saveAddresses: function(data = null, event = null)
            {
                var result;

                var target = null;

                if(event) {
                    target = $(event.target);
                }

                setTimeout(function(){
                    var addressData = {
                        billing: {
                            address_id: self.billingAddressId(),
                            first_name: self.billingFirstName(),
                            last_name: self.billingLastName(),
                            street_1: self.billingStreet1(),
                            street_2: self.billingStreet2(),
                            city: self.billingCity(),
                            postcode: self.billingPostcode(),
                            telephone: self.billingTelephone(),
                            country: $(self.selectors.billingCountry).val()
                        },
                        shipping: {
                            address_id: self.shippingAddressId(),
                            first_name: self.shippingFirstName(),
                            last_name: self.shippingLastName(),
                            street_1: self.shippingStreet1(),
                            street_2: self.shippingStreet2(),
                            city: self.shippingCity(),
                            postcode: self.shippingPostcode(),
                            telephone: self.shippingTelephone(),
                            country: $(self.selectors.shippingCountry).val()
                        }
                    };

                    $.ajax({
                        url: self.config.urls.save,
                        data: {
                            addresses: addressData,
                            quote_id: window.quote().quote_id,
                            form_key: window.FORM_KEY
                        },
                        dataType: 'JSON',
                        method: 'post',
                        cache: false,
                        beforeSend: function() {
                            $(self.selectors.addressWrapper).addClass('loading');
                        },
                        success: function(response) {
                            result = JSON.parse(response);
                        },
                        failure: function(response) {
                            result = JSON.parse(response);
                        },
                        complete: function() {
                            $(self.selectors.addressWrapper).removeClass('loading');
                            if(target != null) {
                                if(target.attr('name') == 'billing_postcode' || target.attr('name') == 'shipping_postcode'  || target.attr('name') == 'shipping_country' || target.attr('name') == 'billing_country')  {
                                    setTimeout(function() {
                                        $(self.selectors.dashboard).trigger('saveQuote');
                                    }, 500);
                                }
                            }
                        }
                    });
                }, 250);
            },

            updateAddressFields: function(data, event)
            {
                var input = $(event.target);
                var addressType = input.parents('.address').data('address-type');
                var field = input.data('type');


                if(field == 'postcode') {
                    self.lookupAddress(addressType, event);
                }

                self[input.data('key')](input.val());

                if($('.address[data-address-type="shipping"]').find('.use-different:first input').prop('checked') == false) {
                    var updateElement = ($('.address[data-address-type="shipping"]').find('[data-type="' + field + '"]'));
                    updateElement.val(input.val());

                    if(field == 'country') {
                        self.billingCountry(input.val());
                        updateElement.find('option[value="' + input.val() + '"]').each(function() {
                            $(this).prop('selected', 'selected');
                        });
                    }
                }

                $(self.selectors.addressWrapper).trigger('updateObservables');

                // $('v').each(function(element) {
                //     var address = $(this);
                //     if($(this).find('.use-different').length) {
                //         if($(this).find('.use-different:first input').prop('checked') == false) {
                //             var updateElement = address.find('[data-type="' + field + '"]');
                //             updateElement.val(input.val());
                //
                //             // console.log(self[updateElement.data('key')]());
                //
                //             if(field == 'country') {
                //                 self.billingCountry(input.val());
                //                 updateElement.find('option[value="' + input.val() + '"]').each(function() {
                //                     $(this).prop('selected', 'selected');
                //                 });
                //             }
                //
                //         }
                //     }
                //     $(self.selectors.addressWrapper).trigger('updateObservables');
                // })
            },

            updateCountryFields: function(data, event)
            {
                self.updateAddressFields(data, event);
                self.saveAddresses();
                setTimeout(function() {
                    $(self.selectors.dashboard).trigger('saveQuote');
                }, 500);

            },

            getTelephoneClasses: function()
            {
                if(self.config.telephone_required == 'req') {
                    return 'admin__field-label required';
                }

                return 'admin__field-label';
            },

            toggleUseDifferentAddress: function(data, event)
            {
                var self = this;
                var target = $(event.target);
                var addressType = target.data('type');
                var form = target.parents('.address').find('form');

                if(target.prop('checked')) {
                    form.find('input, textarea, select').each(function(element) {
                        $(this).prop('disabled', false).val('');
                    });
                    this.shippingFirstName('');
                    this.shippingLastName('');
                    this.shippingStreet1('');
                    this.shippingStreet2('');
                    this.shippingCity('');
                    this.shippingPostcode('');
                    this.shippingTelephone('');
                    this.shippingCountry('');

                    if(addressType == 'shipping') {
                        this.useDifferentShipping(true);
                    }
                }
                else {
                    this.useDifferentShipping(false);
                    if(addressType == 'shipping') {
                        this.shippingFirstName(self.billingFirstName());
                        $(this.selectors.shippingFirstName).val(self.billingFirstName());
                        this.shippingLastName(self.billingLastName());
                        $(this.selectors.shippingLastName).val(self.billingLastName());
                        this.shippingStreet1(self.billingStreet1());
                        $(this.selectors.shippingStreet1).val(self.billingStreet1());
                        this.shippingStreet2(self.billingStreet2());
                        $(this.selectors.shippingStreet2).val(self.billingStreet2());
                        this.shippingCity(self.billingCity());
                        $(this.selectors.shippingCity).val(self.billingCity());
                        this.shippingPostcode(self.billingPostcode());
                        $(this.selectors.shippingPostcode).val(self.billingPostcode());
                        this.shippingTelephone(self.billingTelephone());
                        $(this.selectors.shippingTelephone).val(self.billingTelephone());
                        this.shippingCountry($(this.selectors.billingCountry).val());
                        $(this.selectors.shippingCountry).val($(this.selectors.billingCountry).val());

                        form.find('input, textarea, select').each(function (element) {
                            if($(this).attr('name') == 'saved-addresses') {
                                $(this).val(self.selectedBillingAddressId())
                            }
                            $(this).prop('disabled', 'disabled');
                        });
                    }

                    self.saveAddresses(data, event);
                }
            },

            lookupAddress: function(addressType, event)
            {
                if(!self.config.address_lookup) {
                    return;
                }

                if(event.key == 'ArrowDown') {
                    if(addressType == 'billing' && self.billingAddressLookupResults().length ||
                        addressType == 'shipping' && self.shippingAddressLookupResults().length) {
                        self.preventAddressLookupClosing(true);
                        $(event.target).siblings('.postcode-lookup-results').find('a:first').focus();
                        setTimeout(function() {
                            self.preventAddressLookupClosing(false);
                        }, 250);

                        return;
                    }
                }

                self.addressLookupQueryId(self.addressLookupQueryId() + 1);

                var query = $('.' + addressType + '-postcode input').val();

                if(query.length >= 3 && query.charAt(query.length - 1) != ' ') {
                    $.ajax({
                        url: self.config.urls.lookup,
                        data: {
                            query: query,
                            query_id: self.addressLookupQueryId(),
                            form_key: window.FORM_KEY
                        },
                        dataType: 'JSON',
                        method: 'POST',
                        cache: false,
                        beforeSend: function() {
                            self[addressType + 'AddressLookupResults'].removeAll();
                            $('.' + addressType + '-postcode .postcode-lookup-results').addClass('loading').show();
                        },
                        success: function (response) {
                            var result = JSON.parse(response);

                            if(!result.hasOwnProperty('error')) {
                                if(result.hasOwnProperty('query_id') && result.query_id == self.addressLookupQueryId()) {
                                    $('.' + addressType + '-postcode .postcode-lookup-results').removeClass('loading');
                                    $.each(result.addresses, function(index, address) {
                                        if(address.hasOwnProperty('terms') && address.terms.length >= 4) {
                                            address['odb_address_type'] = addressType;
                                            self[addressType + 'AddressLookupResults'].push(address);
                                        }
                                    });
                                }
                            }
                        }
                    });
                } else {
                    $('.' + addressType + '-postcode .postcode-lookup-results').hide();
                }
            },

            setLookupAddress: function (data, event)
            {
                var address1 = '';
                var address2 = '';
                var city = '';
                var postcode = '';
                var country = '';

                if(data.terms.length == 4) {
                   address1 = data.terms[0].value;
                   city = data.terms[1].value;
                   postcode = data.terms[2].value;
                   country = data.terms[3].value;
                }
                else {
                    address1 = data.terms[0].value;
                    address2 = data.terms[1].value;
                    city = data.terms[2].value;
                    postcode = data.terms[3].value;
                    country = data.terms[4].value;
                }

                self[data.odb_address_type + 'Street1'](address1);
                $(self.selectors[data.odb_address_type + 'Street1']).val(address1);
                self[data.odb_address_type + 'Street2'](address2);
                $(self.selectors[data.odb_address_type + 'Street2']).val(address2);
                self[data.odb_address_type + 'City'](city);
                $(self.selectors[data.odb_address_type + 'City']).val(city);
                self[data.odb_address_type + 'Postcode'](postcode);
                $(self.selectors[data.odb_address_type + 'Postcode']).val(postcode);
                self[data.odb_address_type + 'Country'](self.convertCountryCode(country));
                $(self.selectors[data.odb_address_type + 'Country']).val(self.convertCountryCode(country));

                if(data.odb_address_type == 'billing' && $('#differentShipping').prop('checked') == false) {
                    self.shippingStreet1(address1);
                    self.shippingStreet2(address2);
                    self.shippingCity(city);
                    self.shippingPostcode(postcode);
                    self.shippingCountry(self.convertCountryCode(country));
                }

                $(self.selectors[data.odb_address_type + 'Street1']).focus();
                self[data.odb_address_type + 'AddressLookupResults'].removeAll();
                $(self.selectors[data.odb_address_type + 'Postcode']).siblings('.postcode-lookup-results').hide();
                self.saveAddresses();
                $(self.selectors[data.odb_address_type + 'Postcode']).trigger('change');
            },

            convertCountryCode: function(code)
            {
                var countryCodes = {
                    'UK': 'GB'
                }

                if(countryCodes.hasOwnProperty(code)) {
                    return countryCodes[code];
                }

                return code;
            },

            toggleAddressLookupResults: function(data, event)
            {
                if(!self.config.address_lookup) {
                    return;
                }

                var input = $(event.target);
                var postcode = input.parents('.admin__field-control');
                var address = input.parents('.address');
                var addressType = address.data('address-type');
                var results = postcode.find('.postcode-lookup-results:first');

                if(input.is(":focus")) {
                    if(input.val().length >= 3) {
                        results.show();
                        self.lookupAddress(addressType, false);
                    }
                }
                else {
                    setTimeout(function() {
                        if(!self.preventAddressLookupClosing()) {
                            results.hide();
                        }
                    }, 100);
                }
            },

            isCountrySelected: function(countryId, addressType)
            {
                if(self.config.addresses.hasOwnProperty(addressType)) {
                    if(countryId == self.config.addresses[addressType].country) {
                        return true;
                    }
                }

                return false;
            }
        })
    }
);
