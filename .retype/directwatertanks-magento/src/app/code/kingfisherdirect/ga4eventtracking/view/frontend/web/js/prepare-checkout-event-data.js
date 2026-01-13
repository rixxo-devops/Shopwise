define(function () {
    return function (quote) {
        var data = {
            value: parseFloat(quote.totals().grand_total),
            currency: quote.totals().quote_currency_code,
            items: [],
        }

        for (const item of window.checkoutConfig.quoteItemData) {
            var item_variant = '';
            for (const option of item.options) {
                if (item_variant) {
                    item_variant += ', ';   // separator for multiple product options
                }
                item_variant += option.value;
            }

            data.items.push({
                item_id: item.sku,
                item_name: item.name,
                coupon: item.applied_rule_ids,
                discount: parseFloat(item.discount_amount),
                index: data.items.length,
                item_variant: item_variant,
                price: parseFloat(item.price_incl_tax),
                quantity: item.qty
            });
        }

        return data
    }
})
