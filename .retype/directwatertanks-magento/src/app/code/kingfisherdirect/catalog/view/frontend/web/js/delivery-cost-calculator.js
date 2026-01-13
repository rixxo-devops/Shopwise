define(
    ['mage/storage'],
    function (storage) {
        return function (config, node) {
            if (!config.displayDeliveryCostCalculator) {
                return;
            }

            var sku = document.querySelector('[itemprop="sku"]').textContent;

            if (!sku) {
                return;
            }

            var cartId;

            storage.post('rest/V1/guest-carts').done(function (res) {
                cartId = res;
            });

            node.style.display = '';

            var quantityInput = document.getElementById('qty');
            var postcodeInput = node.querySelector('#delivery-cost-input');

            var resultBlock = node.querySelector('.delivery-cost-result');
            var btn = node.querySelector("#delivery-cost-btn");

            btn.addEventListener('click', function (event) {
                event.preventDefault();

                if (!cartId) {
                    return;
                }

                resultBlock.innerHTML = '';

                var quantity = quantityInput.value;
                var postcode = postcodeInput.value;

                if (!quantity || !postcode.trim()) {
                    return;
                }

                btn.disabled = true;

                storage.post('rest/V1/guest-carts/' + cartId + '/items', JSON.stringify({
                    "cartItem": {
                        "sku": sku,
                        "qty": quantity,
                        "quote_id": cartId,
                    }
                })).done(function (res) {
                    var itemId = res['item_id'];
                    storage.post('rest/V1/guest-carts/' + cartId + '/estimate-shipping-methods', JSON.stringify(
                        {
                            "address": {
                                "region": "",
                                "country_id": "GB",
                                "postcode": postcode,
                            }
                        }
                    )).done(function (res) {
                        if (Array.isArray(res) && res.length) {
                            var html = '';
                            for (var i=0; i < res.length; i++) {
                                if (res[i]['error_message'] !== '') {
                                    html = '<span class="error">' + res[i]['error_message'] + '</span>';
                                    break;
                                }
                                html+= '<span class="result[' + i + ']">' + res[i]['method_title'] + '&nbsp;&pound;' + res[i]['price_excl_tax'].toFixed(2) + ' + VAT</span>';
                            }
                            resultBlock.style.display = "block";
                            resultBlock.innerHTML = html;
                        } else {
                            resultBlock.innerHTML = '<span class="error">No shipping methods available for this location.</span>';
                        }
                    }).always(function () {
                        storage.delete('rest/V1/guest-carts/' + cartId + '/items/' + itemId);
                        btn.disabled = false;
                    })
                });
            });

            // Prevent 'add to cart' form being submitted when input is focused and enter is pressed.
            document.addEventListener('keydown', function (event) {
                if (event.keyCode === 13 && postcodeInput === document.activeElement) {
                    event.preventDefault();
                }
            });

            // Remove any existing result when quantity is changed.
            quantityInput.addEventListener('change', function (event) {
                resultBlock.innerHTML = '';
            });
        }
    }
);
