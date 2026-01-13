var config = {
    deps: [
        'js/main'
    ],

    config: {
        mixins: {
            'Magento_Theme/js/view/breadcrumbs': {
                'js/product/breadcrumbs': true
            }
        }
    },

    paths: {
        // remove jquery migrate
        'jquery/jquery-migrate': 'js/empty'
    },

    map: {
        "*": {
            "productListToolbarForm": "Magento_Catalog/js/product/list/toolbar-simplified"
        }
    }
}
