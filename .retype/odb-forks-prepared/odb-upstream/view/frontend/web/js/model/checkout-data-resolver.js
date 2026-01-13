define([
    'jquery',
    'mage/utils/wrapper',
    'Magento_Customer/js/model/address-list',
    'Magento_Checkout/js/checkout-data',
],function ($, wrapper, addressList,checkoutData){
    'use strict';

    return function (target) {

        var resolveShippingRates = wrapper.wrap(target.resolveShippingRates, function(originalClass, ratesData)
        {
            var odbConfig = window.checkoutConfig.odb_quote;

            if(odbConfig.quote_id) {
                jQuery('.new-address-popup').remove();
                var odbRate = null;
                jQuery.each(ratesData, function(index, rate) {
                    var code = rate.carrier_code + '_' + rate.method_code;
                    if(code == odbConfig.shipping_method) {
                        odbRate = rate;
                    }
                    delete ratesData[index];
                });

                if(odbRate) {
                    ratesData[0] = odbRate;
                    ratesData.length = 1;
                }
            }

            return originalClass(ratesData);
        });

        var getShippingAddressFromCustomerAddressList = wrapper.wrap(target.getShippingAddressFromCustomerAddressList, function(originalClass)
        {
            var odbQuoteData = window.checkoutConfig.odb_quote;

            var shippingAddress;

            if(odbQuoteData.quote_id) {
                jQuery.each(addressList(), function(index, address) {
                    if(odbQuoteData.hasOwnProperty('shipping_postcode') && address.postcode == odbQuoteData.shipping_postcode) {
                        shippingAddress = addressList()[index];
                    }
                });
            } else {
                shippingAddress = _.find(
                    addressList(),
                    function (address) {
                        return checkoutData.getSelectedShippingAddress() == address.getKey() //eslint-disable-line
                    }
                );

                if (!shippingAddress) {
                    shippingAddress = _.find(
                        addressList(),
                        function (address) {
                            return address.isDefaultShipping();
                        }
                    );
                }

                if (!shippingAddress && addressList().length === 1) {
                    shippingAddress = addressList()[0];
                }

            }

            return shippingAddress;
        });

        target.resolveShippingRates = resolveShippingRates;
        target.getShippingAddressFromCustomerAddressList = getShippingAddressFromCustomerAddressList;

        return target;
    };
});
