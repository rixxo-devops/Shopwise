var config = {
  map: {
    "*": {
      "Magento_Ui/js/lib/knockout/bindings/bootstrap": "KingfisherDirect_MagentoGeneral/js/knockout/bindings/bootstrap"
    }
  },
  paths: {
    // please avoid adding js files here, try using mixins

    // this one is for the shitty Checkout newsletter module, to make it actually work
    "Mageside_SubscribeAtCheckout/js/model/shipping-save-processor/payload-extender-override": "KingfisherDirect_MagentoGeneral/Mageside_SubscribeAtCheckout/js/model/shipping-save-processor/payload-extender-override",
    "Mageside_SubscribeAtCheckout/template/form/element/newsletter-subscribe": "KingfisherDirect_MagentoGeneral/Mageside_SubscribeAtCheckout/template/form/element/newsletter-subscribe"
  },
  config: {
    mixins: {
      'Magento_Checkout/js/sidebar': {
        'KingfisherDirect_MagentoGeneral/js/sidebar-mixin': true
      },
      'Magento_Checkout/js/model/checkout-data-resolver': {
        'KingfisherDirect_MagentoGeneral/js/model/checkout-data-resolver-preselect-shipping': true
      },
      'Magento_Checkout/js/view/shipping': {
        'KingfisherDirect_MagentoGeneral/js/view/shipping': true,
      }
    }
  }
};
