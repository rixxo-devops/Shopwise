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
                template: 'Rixxo_Odb/dashboard/customer',
            },
            selectors: {
                dashboard: 'section.odb-dashboard',
                findCustomer: '#findCustomer',
                findCustomerResults: '.findCustomerResults',
                findCustomerResultsCount: '.findCustomerResults .result-count .value',
                findCustomerCreate: '#findCustomerCreate',
                findCustomerResultsCreate: '.findCustomerResultsCreate',
                findCustomerResultsCountCreate: '.findCustomerResultsCreate .result-count .value',
                customerStats: '.find-customer .customer-stats',
                showCreateCustomer: '#showCreateCustomer',
                createCustomerForm: 'form.newCustomerDetailsForm',
                createCustomerEmail: 'form.newCustomerDetailsForm input[name="email"]',
                customerDetails: 'section.customer .customer-details',
                findCompany: '#findCompany',
                findCompanyResults: '.findCompanyResults',
                findCompanyResultsCount: '.findCompanyResults .result-count .value',
                findCompanyReset: '.admin__field-control.company .reset',
                addresses: 'section.addresses .address-wrapper'
            },
            initialize: function (config) {
                self = this;

                this._super();
                this.config = config;

                this.action = parseInt(this.config.quote_id) == 0 ? 'create' : 'edit';

                this.countryData = ko.observableArray();

                this.findQuery = ko.observable();
                this.findQueryId = ko.observable(1);
                this.findQueryMatches = ko.observableArray();
                this.findCustomerResultCount = ko.observable(0);

                this.findQueryCreate = ko.observable();
                this.findQueryIdCreate = ko.observable(1);
                this.findQueryMatchesCreate = ko.observableArray();
                this.findCustomerResultCountCreate = ko.observable(0);

                this.customerId = ko.observable();
                this.customerEmail = ko.observable();
                this.customerFirstname = ko.observable();
                this.customerLastname = ko.observable();
                this.customerTelephone = ko.observable();
                this.customerGroup = ko.observable();
                this.companyId = ko.observable();
                this.company = ko.observable();

                this.customerOpenQuotes = ko.observable('No Open Quotes');
                this.customerOpenOrders = ko.observable('No Open Orders');
                this.customerLastOrderId = ko.observable('No Previous Orders');

                this.findCompanyQuery = ko.observable();
                this.findCompanyQueryId = ko.observable(1);
                this.findCompanyMatches = ko.observableArray();
                this.findCompanyResultCount = ko.observable(0);

                this.createCompanyName = ko.observable();
                this.createCompanyEmail = ko.observable();
                this.createCompanyCustomerGroup = ko.observable();
                this.createCompanyStreet = ko.observable();
                this.createCompanyCity = ko.observable();
                this.createCompanyPostcode = ko.observable();
                this.createCompanyCountry = ko.observable();

                this.customerGroups = ko.observableArray(this.config.customerGroups || []);
                this.createCustomerEmail = ko.observable();
                this.createCustomerFirstname = ko.observable();
                this.createCustomerLastname = ko.observable();
                this.createCustomerGroup = ko.observable();
                this.createCustomerTelephone = ko.observable();
                this.createCustomerCompany = ko.observable();
                this.createCustomerCompanyId = ko.observable(false);

                this.customerAction = ko.observable();

                this.waitForQuote(function(quote) {
                    self.initCustomer();
                });
            },

            addCustomerValidation: function(data, event)
            {
                if(window.quote().modules.Aheadworks_Ca) {
                    $.validator.addMethod("companyIsSelected", function(value, element, arg){
                        if(self.createCustomerCompanyId() !== false) {
                            return true;
                        }

                        return false
                    }, "Please select or create a company");
                }

                var customerForm = $('#newCustomerDetailsForm');
                customerForm.bind('submit', function(event) {
                    event.preventDefault();
                });

                var customerRules = {
                    firstname: 'required',
                    lastname: 'required',
                    email: {
                        required: true,
                        email: true
                    },
                    customer_group: 'required'
                };

                var customerMessages = {
                    firstname: 'This field is required',
                    lastname: 'This field is required',
                    email: 'Enter a valid email',
                    customer_group: 'This field is required',
                    telephone: 'This field is required'
                }

                if(self.config.telephone_required == 'req') {
                    customerRules['telephone'] = 'required';
                }

                if(window.quote().modules.Aheadworks_Ca) {
                    if(self.getCompanyConfigShowField()){
                        if(self.getCompanyConfigIsRequired()) {
                            customerRules['company'] = {
                                required: true
                            }
                            if(self.getCompanyConfigAwCaIntegration()) {
                                customerRules['company'] = {
                                    companyIsSelected: true
                                }
                                customerMessages['company'] = 'Please select or create a company';
                            } else {
                                customerMessages['company'] = 'This field is required';
                            }
                        }
                    }
                }

                customerForm.validate({
                    onkeyup: false,
                    onblur: true,
                    rules: customerRules,
                    customer_group: 'required',
                    messages: customerMessages,
                    submitHandler: function(customerForm) {
                        self.createCustomer();
                    }
                });
            },

            addCompanyValidation: function(data, event)
            {
                if(window.quote().modules.Aheadworks_Ca && self.getCompanyConfigAwCaIntegration()) {

                    var companyForm = $('#companyCreateForm');
                    companyForm.bind('submit', function(event) {
                        event.preventDefault();
                    });

                    companyForm.validate({
                        rules: {
                            name: 'required',
                            email: {
                                email: true,
                                required: true
                            },
                            customer_group: 'required',
                            street: 'required',
                            city: 'required',
                            postcode: 'required',
                            country: 'required'
                        },
                        messages: {
                            name: 'This field is required',
                            email: 'Enter a valid email',
                            customer_group: 'This field is required',
                            street: 'This field is required',
                            city: 'This field is required',
                            postcode: 'This field is required',
                            country: 'This field is required',
                        },
                        submitHandler: function(companyForm) {
                            self.findCompanyQuery(self.createCompanyName());
                            self.createCustomerCompany(self.createCompanyName());
                            self.createCustomerGroup(self.createCompanyCustomerGroup());
                            self.createCustomerEmail(self.createCompanyEmail());
                            self.createCustomerCompanyId(0);

                            setTimeout(function() {
                                $(self.selectors.findCompany).blur().prop('disabled', 'disabled');
                                $(self.selectors.createCustomerEmail).focus();
                                $(self.selectors.findCompanyReset).show();
                            }, 100);

                            $('.create-company-modal-content').modal('closeModal');
                        }
                    });
                }
            },

            initCustomer: function()
            {
                $.each(this.config.countries, function(countryCode, data) {
                    self.countryData.push(data);
                });

                if(window.quote().customer.customer_id) {
                    this.populateCustomerData();
                    $('.actions-toolbar .customer-details').trigger('updateCustomerDetails');
                    this.customerAction('existing');
                }
            },

            waitForQuote: function (callback) {
                if (window.quote) {
                    callback(window.quote);
                } else {
                    setTimeout(function () {
                        this.waitForQuote(callback);
                    }.bind(this), 100);
                }
            },

            populateCustomerData: function()
            {

                let customer = window.quote().customer;
                let stats = window.quote().customer.stats;
                    console.log(2);

                this.customerEmail(customer.customer_email);
                this.customerFirstname(customer.customer_firstname);
                this.customerLastname(customer.customer_lastname);
                this.customerGroup(customer.customer_group.hasOwnProperty('code') ? customer.customer_group.code : '');
                this.customerTelephone(customer.telephone)

                if(window.quote().modules.Aheadworks_Ca) {
                    this.company(customer.company);
                    this.companyId(customer.company_id);
                }

                this.customerOpenOrders(stats.open_orders);
                this.customerOpenQuotes(stats.open_quotes);
                this.customerLastOrderId(stats.last_order_id);

                $(this.selectors.customerStats).show();
                this.closeNewCustomer();
                this.customerAction('existing');
                    console.log(3);

                $(this.selectors.addresses).trigger('updateAddresses');
            },

            addCustomerToQuote: function(data)
            {
                window.quote().customer.customer_id = data.customer_id;
                window.quote().customer.customer_email = data.email;
                window.quote().customer.customer_firstname = data.firstname;
                window.quote().customer.customer_lastname = data.lastname;
                window.quote().customer.customer_group = data.customer_group;
                window.quote().customer.telephone = data.telephone;

                if(window.quote().modules.Aheadworks_Ca) {
                    window.quote().customer.company = data.company;
                    window.quote().customer.company_id = data.company_id;
                }

                window.quote().customer.stats = data.stats;

                $(self.selectors.customerDetails).trigger('customerDataChanged');
                $('.actions-toolbar .customer-details').trigger('updateCustomerDetails');

                $('section.odb-dashboard').trigger('saveQuote',[true]);

                self.toggleShowResults(false);
                $(window.productSelectors.findProduct).focus();
            },

            addCompanyToQuote: function(data)
            {
                if(window.quote().modules.Aheadworks_Ca) {
                    window.quote().customer.company = data.name;
                    window.quote().customer.company_id = data.company_id;

                    $(self.selectors.customerDetails).trigger('customerDataChanged');
                }
            },

            findCustomer: function(data, event)
            {
                var result;
                var key = event.which;
                var target = $(event.target);

                this.findQuery($(self.selectors.findCustomer).val());

                if(this.findQuery().length >= 3) {
                    this.toggleShowResults(true);
                    if(key == 27) {
                        this.toggleShowResults(false);
                    }
                    if(key == 40) {
                        this.toggleShowResults(true);
                        $(this.selectors.findCustomerResults).find('.result > a:first').focus();
                        return;
                    }
                }
                else {
                    this.toggleShowResults(false);
                    return;
                }

                this.findQueryId(this.findQueryId() + 1);

                $.ajax({
                    url: self.config.urls.find,
                    data: {
                        query: self.findQuery(),
                        queryId: self.findQueryId(),
                        form_key: window.FORM_KEY,
                        store_id: window.quote().store_id
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $(self.selectors.findCustomerResults).addClass('loading');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.findCustomerResultCount(result.results);

                        if(result.queryId == self.findQueryId()) {
                            self.findQueryMatches.removeAll();
                            if(result.results >= 1) {
                                $.each(result.matches, function(customerId, data) {
                                    self.findQueryMatches.push(data);
                                });
                            }
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $(self.selectors.findCustomerResults).removeClass('loading');
                    }
                });
            },

            findCustomerCreate: function(data, event)
            {
                var result;
                var key = event.which;
                var target = $(event.target);

                this.findQueryCreate($(self.selectors.createCustomerEmail).val());

                if(this.findQueryCreate().length >= 3) {
                    this.toggleShowResults(true, 'create');
                    if(key == 27) {
                        this.toggleShowResults(false, 'create');
                    }
                    if(key == 40) {
                        this.toggleShowResults(true, 'create');
                        $(this.selectors.findCustomerResultsCreate).find('.result > a:first').focus();
                        return;
                    }
                }
                else {
                    this.toggleShowResults(false, 'create');
                    return;
                }

                this.findQueryIdCreate(this.findQueryIdCreate() + 1);

                $.ajax({
                    url: self.config.urls.find,
                    data: {
                        query: self.findQueryCreate(),
                        queryId: self.findQueryIdCreate(),
                        form_key: window.FORM_KEY,
                        store_id: window.quote().store_id
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $(self.selectors.findCustomerResultsCreate).addClass('loading');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.findCustomerResultCountCreate(result.results);
                        self.findQueryMatchesCreate.removeAll();

                        if(result.queryId == self.findQueryIdCreate()) {
                            if(result.results >= 1) {
                                $.each(result.matches, function(customerId, data) {
                                    self.findQueryMatchesCreate.push(data);
                                });
                            } else {
                                self.toggleShowResults(false, 'create');
                            }
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $(self.selectors.findCustomerResultsCreate).removeClass('loading');
                    }
                });
            },

            closeFindCustomResults: function(data, event)
            {
                var key = event.which;
                if(key == 27) {
                    $(self.selectors.findCustomer).focus();
                    self.toggleShowResults(false);
                }
            },


            findCompany: function(data, event)
            {
                var self = this;
                var result;
                var key = event.which;
                this.findCompanyQuery($(this.selectors.findCompany).val());

                if(this.findCompanyQuery().length >= 3) {
                    if(key == 27) {
                        this.toggleShowCompanyResults(false);
                        return;
                    }
                    if(key == 40) {
                        this.toggleShowCompanyResults(true);
                        $(self.selectors.findCompanyResults).find('.result a:first').focus();
                        return;
                    }
                    this.toggleShowCompanyResults(true);
                }
                else {
                    this.toggleShowCompanyResults(false);
                }

                this.findCompanyQueryId(this.findCompanyQueryId() + 1);

                $.ajax({
                    url: self.config.urls.findCompany,
                    data: {
                        query: self.findCompanyQuery(),
                        queryId: self.findCompanyQueryId(),
                        store_id: window.quote().store_id,
                        form_key: window.FORM_KEY
                    },
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $(self.selectors.findCompanyResults).addClass('loading');
                    },
                    success: function(response) {
                        result = JSON.parse(response);

                        self.findCompanyResultCount(result.results);
                        self.findCompanyMatches.removeAll();
                        if(result.queryId == self.findCompanyQueryId()) {
                            if(result.results >= 1)
                            {
                                $.each(result.matches, function(companyId, data) {
                                    self.findCompanyMatches.push(data);
                                })
                            }
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $(self.selectors.findCompanyResults).removeClass('loading');
                    }
                });
            },

            toggleShowResultsFocus: function(data, event)
            {
                if($(self.selectors.findCustomer).is(":focus")) {
                    let showResults = $(self.selectors.findCustomer).val().length >= 3;
                    this.toggleShowResults(showResults);
                }
                else {
                    var doCloseResults = true;
                    var focused = null;

                    setTimeout(function() {
                        $(self.selectors.findCustomerResults).find('.result > a').each(function(e) {
                            if($(this).is(":focus")) {
                                focused = $(this);
                            }
                        });
                        if(focused) {
                            focused.focus();
                        }
                        else {
                            self.toggleShowResults(false);
                        }
                    }, 200);

                }
            },

            toggleShowResultsFocusCreate: function(data, event)
            {
                if($(self.selectors.findCustomerCreate).is(":focus")) {
                    let showResults = $(self.selectors.findCustomerCreate).val().length >= 3;
                    this.toggleShowResults(showResults, 'create');
                }
                else {
                    var doCloseResults = true;
                    var focused = null;

                    setTimeout(function() {
                        $(self.selectors.findCustomerResultsCreate).find('.result > a').each(function(e) {
                            if($(this).is(":focus")) {
                                focused = $(this);
                            }
                        });
                        if(focused) {
                            focused.focus();
                        }
                        else {
                            self.toggleShowResults(false, 'create');
                        }
                    }, 200);

                }
            },

            toggleShowCompanyResultsFocus: function(data, event)
            {
                if($(self.selectors.findCompany).is(":focus")) {
                    var showResults = $(self.selectors.findCompany).val().length >= 3;
                    self.toggleShowCompanyResults(showResults);
                }
                else {
                    self.toggleShowCompanyResults(false);
                }
            },

            toggleShowCompanyResults: function(state)
            {
                if(state == true) {
                    $(self.selectors.findCompanyResults).show();
                }
                else {
                    setTimeout(function() {
                        var focused = null;
                        $(self.selectors.findCompanyResults).find('.result a').each(function(e) {
                            if($(this).is(':focus')) {
                                focused = $(this);
                            }
                        });
                        if(!focused) {
                            $(self.selectors.findCompanyResults).hide();
                        }
                    }, 200);
                }
            },

            toggleShowResults: function(state, isCreate = false)
            {
                var element = isCreate ? $(this.selectors.findCustomerResultsCreate).show() : $(this.selectors.findCustomerResults).show();

                if(state == true) {
                    element.show();
                }
                else {
                    element.hide();
                }
            },


            showCreateCustomer: function(data, event)
            {
                this.customerAction('new');
                $('#newCustomerDetailsForm input[type="text"]:first').focus();
            },

            createCustomer: function(data, event)
            {
                var result;

                var data = {
                    customer: {
                        email: self.createCustomerEmail(),
                        firstname: self.createCustomerFirstname(),
                        lastname: self.createCustomerLastname(),
                        customer_group: self.createCustomerGroup(),
                        telephone: self.createCustomerTelephone(),
                        store_id: window.quote().store_id
                    },
                    form_key: window.FORM_KEY
                }

                if(window.quote().modules.Aheadworks_Ca) {
                    data['customer']['company'] = self.createCustomerCompany() ?? '';
                    data['customer']['company_id'] = self.createCustomerCompanyId() ?? '';

                    data['company'] = {
                        name: self.createCompanyName(),
                        email: self.createCompanyEmail(),
                        street: self.createCompanyStreet(),
                        city: self.createCompanyCity(),
                        postcode: self.createCompanyPostcode(),
                        country: self.createCompanyCountry(),
                        customer_group: self.createCustomerGroup()
                    }
                }

                $.ajax({
                    url: self.config.urls.createCustomer,
                    data: data,
                    dataType: 'JSON',
                    method: 'post',
                    cache: false,
                    beforeSend: function() {
                        $('body').trigger('processStart');
                    },
                    success: function(response) {
                        result = JSON.parse(response);
                        if(!result.hasOwnProperty('company_error') && result.hasOwnProperty('company') && result.company.hasOwnProperty('company_id')) {
                            result.customer['company_id'] = result.company.company_id;
                            result.customer['company'] = result.company.name;

                        } else {
                            console.log('Could not create company: ' + result.company_error);
                        }


                        if(!result.hasOwnProperty('error')) {
                            self.addCustomerToQuote(result.customer);
                        }else{
                            alert(result.error);
                        }
                    },
                    failure: function(response) {
                        result = JSON.parse(response);
                    },
                    complete: function() {
                        $('body').trigger('processStop');
                    }
                });
            },

            showCreateCompany: function(event, data)
            {
                var options = {
                    type: 'popup',
                    responsive: true,
                    innerScroll: false,
                    modalClass: 'create-company-modal',
                    title: 'Create New Company',
                    buttons: [
                        {
                            text: $.mage.__('Close'),
                            class: 'modal-close',
                            click: function (){
                                this.closeModal();
                            }},
                        {
                            text: $.mage.__('Save'),
                            class: 'modal-save save primary',
                            click: function (){
                                $('#companyCreateForm').trigger('submit');
                            }
                        }
                    ]
                };

                modal(options, $('.create-company-modal-content'));

                this.createCompanyName(this.findCompanyQuery());
                this.createCompanyEmail(this.createCustomerEmail());
                $('.create-company-modal-content').modal("openModal");
            },

            updateCreateCustomerCompany: function(data, event)
            {
                this.createCustomerCompanyId(
                    $(this.selectors.createCustomerCompanyId).val()
                );
                this.createCustomerCompany(
                    $(this.selectors.findCompany).val()
                );
            },

            selectCompany: function(data, event)
            {
                $(self.selectors.findCompany).val(data.name);
                $(self.selectors.createCustomerCompanyId).val(data.company_id);
                self.createCustomerCompanyId(data.company_id);
                self.createCustomerCompany(data.name);

                setTimeout(function() {
                    $(self.selectors.findCompany).blur().prop('disabled', 'disabled');
                    $(self.selectors.findCompanyResults).find('a:focus').blur();
                    $(self.selectors.createCustomerEmail).focus();
                    $(self.selectors.findCompanyReset).show();
                    self.toggleShowCompanyResults(false);
                }, 100);
            },

            resetSelectedCompany: function()
            {
                this.findCompanyQuery('');
                this.createCustomerCompany('');
                this.createCustomerCompanyId(false);

                $(this.selectors.findCompany).removeProp('disabled');
                $(this.selectors.findCompanyReset).hide();
            },

            closeFindCompanyResults: function(data, event)
            {
                var key = event.which;
                if(key == 27) {
                    self.toggleShowCompanyResults(false);
                    $(self.selectors.findCompany).focus();
                }
            },

            closeNewCustomer: function(data, event)
            {
                this.createCustomerEmail('');
                this.createCustomerFirstname('');
                this.createCustomerLastname('');
                this.createCustomerTelephone('')
                this.createCustomerGroup('');

                if(window.quote().modules.Aheadworks_Ca) {
                    this.createCompanyName('');
                    this.createCompanyEmail('');
                    this.createCompanyStreet('');
                    this.createCompanyCity('');
                    this.createCompanyPostcode('');
                    this.createCompanyCountry('');

                    $(this.selectors.findCompany).removeProp('disabled');
                    $(this.selectors.findCompanyReset).hide();
                }

                $(this.selectors.createCustomerForm).find('label.error').each(function(element) {
                    $(this).remove();
                });
                $(this.selectors.createCustomerForm).find('.error').each(function(element) {
                    $(this).removeClass('error');
                });

                if(this.customerId()) {
                    this.customerAction('existing');
                } else {
                    this.customerAction('');
                }

                $(self.selectors.findCustomer).focus();
            },

            getCompanyConfigShowField: function()
            {
                return self.config.companies.show_field;
            },

            getCompanyConfigIsRequired: function()
            {
                return self.config.companies.is_required;
            },

            getCompanyConfigAwCaIntegration: function()
            {
                return self.config.companies.aheadworks_ca_integration;
            },

            getCompanyConfigAttributeCode: function()
            {
                return self.config.companies.attribute_code;
            },

            getAwCaEnabled: function()
            {
                return window.quote().modules.Aheadworks_Ca ?? false;
            }
        });
    }
);
