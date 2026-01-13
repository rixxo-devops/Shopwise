define([
  'Magento_Checkout/js/model/quote',
  'Magento_Checkout/js/action/select-shipping-method',
], function (
  quote,
  selectShippingMethodAction
) {
  return function (target) {
    var origResolveShippingRates = target.resolveShippingRates

    target.resolveShippingRates = function (ratesData) {
      if (quote.shippingMethod() === null && ratesData[0] && !window.checkoutConfig.selectedShippingMethod) {
        selectShippingMethodAction(ratesData[0])

        return
      }

      return origResolveShippingRates(ratesData)
    }

    return target
  }
})
