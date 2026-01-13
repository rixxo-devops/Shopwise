// defines a dummy-module that can be used to replace
define('dummy-module', function () {})

var config = {
  map: {
    "*": {
      // remove unneded magento inline translation functionality
      "mage/translate-inline": "dummy-module",
      "jquery/jquery-migrate": "dummy-module",
      "Magento_Theme/js/responsive": "dummy-module",
      "productListToolbarForm": "Magento_Catalog/js/product/list/toolbar-simplified"
    }
  }
};
