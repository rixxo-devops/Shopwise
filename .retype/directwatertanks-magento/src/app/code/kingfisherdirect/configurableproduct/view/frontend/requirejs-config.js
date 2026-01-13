var config = {
    config: {
        mixins: {
            'Magento_ConfigurableProduct/js/configurable': {
                'KingfisherDirect_ConfigurableProduct/js/configurable-tier-price': true
            },
            'Magento_Swatches/js/swatch-renderer': {
                'KingfisherDirect_ConfigurableProduct/js/swatch-tier-price': true
            }
        }
    }
}
