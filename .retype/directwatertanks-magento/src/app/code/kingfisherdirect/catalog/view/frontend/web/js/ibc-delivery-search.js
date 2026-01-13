define(['jquery'], function ($) {
    return function(config, node) {
        var el = $(node);
        var input = $('<input type="text" class="ibc-delivery-search-input" placeholder="Enter the first 3-4 letters/numbers of your postcode...">');
        var rows = el.find('tr');

        var i, x, y, postcodeContainer, postcodesByRow, postcodes, postcode, prefix, val, valPrefix, l, limit;

        el.before(input);

        postcodesByRow = {};

        input.keyup(function() {
            val = input.val().toUpperCase();
            valPrefix = val.match(/^[a-zA-Z]*/)[0];

            for (i = 0; i < rows.length; i++) {

                if (!postcodesByRow.hasOwnProperty(i)) {

                    postcodeContainer = $(rows[i]).find('span.postcodes')[0];

                    if (typeof postcodeContainer === 'undefined') {
                        continue;
                    }

                    postcodes = $(postcodeContainer).text().split(',');

                    for (x = 0; x < postcodes.length; x++) {
                        postcode = postcodes[x] = postcodes[x].trim();

                        if (typeof postcode === 'undefined') {
                            continue;
                        }

                        prefix = postcode.match(/^[a-zA-Z]*/)[0];

                        limit = postcode.slice(prefix.length).split('-');

                        if (limit.length === 1 && limit[0] === "") {
                            postcodes.push(prefix + '*');
                        }

                        if (limit.length === 2) {
                            for (l = parseInt(limit[0]); l <= parseInt(limit[1]); l++) {
                                postcodes.push(prefix + l);
                            }
                        }
                    }

                    // London postcode areas which follow a AA9A or A9A pattern.
                    for (y = 0; y < postcodes.length; y++) {
                        if (['EC1, EC2, EC3', 'EC4', 'SW1', 'W1', 'WC1', 'WC2', 'E1', 'N1', 'NW1', 'SE1'].includes(postcodes[y])) {
                            postcodes.push(postcodes[y] + '*');
                        }
                    }

                    postcodesByRow[i] = postcodes.join(' ');
                }

                if (valPrefix
                    && (postcodesByRow[i].search(new RegExp("\\b(" + val.slice(0, valPrefix.length + 2).trim() + ")")) === -1)
                    && (postcodesByRow[i].search(new RegExp("\\b(" + valPrefix + "\\*)")) === -1)
                    && (postcodesByRow[i].search(new RegExp("\\b(" + val.slice(0, valPrefix.length + 1).trim() + "\\*)")) === -1)
                ) {
                    $(rows[i]).hide();
                } else {
                    $(rows[i]).show();
                }
            }
        });
    };
});
