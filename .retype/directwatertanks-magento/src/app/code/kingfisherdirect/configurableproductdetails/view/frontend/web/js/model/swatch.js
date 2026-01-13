define([
    'jquery',
    'priceUtils'
], function ($, priceUtils) {
    'use strict';
    return function (widget) {
        $.widget('mage.SwatchRenderer', widget, {
            _getOptionDiffs: function () {
                if (this.optionDiffs) {
                    return this.optionDiffs
                }

                const optionDiffs = {};
                const { optionPrices, attributes } = this.options.jsonConfig;

                for (const attribute of attributes) {
                    let cheapestFromAll;
                    // var optionConfig = this.options.jsonSwatchConfig[swatch.id];

                    for (const swatchOption of attribute.options) {
                        let cheapestFromSet;

                        swatchOption.products.forEach(prodId => {
                            // find cheapest from within each swatch options
                            if (!cheapestFromSet) {
                                cheapestFromSet = optionPrices[prodId].basePrice.amount;
                            }

                            if (optionPrices[prodId].basePrice.amount < cheapestFromSet) {
                                cheapestFromSet = optionPrices[prodId].basePrice.amount;
                            }
                        });

                        optionDiffs[swatchOption.id] = cheapestFromSet;

                        // find cheapest from all of swatch options
                        if (!cheapestFromAll) {
                            cheapestFromAll = cheapestFromSet;

                            continue
                        }

                        if (cheapestFromSet < cheapestFromAll) {
                            cheapestFromAll = cheapestFromSet;
                        }
                    }

                    for (const option of attribute.options) {
                        optionDiffs[option.id] -= cheapestFromAll;
                    }
                }

                this.optionDiffs = optionDiffs

                return optionDiffs
            },

            _RenderControls: function () {
                const showTooltip = this.options.showTooltip
                this.options.showTooltip = 0

                const result = this._super()

                const differences = this._getOptionDiffs();
                const { attributes: swatches, priceFormat } = this.options.jsonConfig;

                for (const swatch of swatches) {
                    const optionConfig = this.options.jsonSwatchConfig[swatch.id];

                    if (!optionConfig) {
                        continue
                    }

                    for (const swatchOption of swatch.options) {
                        if (!optionConfig[swatchOption.id]) {
                            continue
                        }

                        var type = parseInt(optionConfig[swatchOption.id].type, 10);

                        if (type === 0 || !type) {
                            continue
                        }

                        const button = this.element[0].querySelector(`[data-option-id="${swatchOption.id}"]`)

                        if (type === 1 || type === 2) {
                            const visual = document.createElement('span')
                            visual.classList.add('swatch-option-visual')
                            // clone css styles
                            Object.values(button.style).forEach((prop) => {
                                visual.style[prop] = button.style[prop];
                            });
                            button.appendChild(visual)

                            button.style = null
                        }

                        button.innerHTML += `<span class="label">${swatchOption.label}</span>`;

                        if (differences[swatchOption.id]) {
                            button.innerHTML += ` <span class="price">+ ${priceUtils.formatPrice(differences[swatchOption.id], priceFormat)}</span>`;
                            if (differences[swatchOption.id] > 0) {
                                button.dataset.optionLabel += " +"
                            }
                            button.dataset.optionLabel += ` ${priceUtils.formatPrice(differences[swatchOption.id], priceFormat)}`
                        }
                    }
                }

                if (showTooltip === 1) {
                    // Connect Tooltip
                    this.element
                        .find('[data-option-type="1"], [data-option-type="2"],' +
                            ' [data-option-type="0"], [data-option-type="3"]')
                        .SwatchRendererTooltip();
                }

                return result
            },

            // this one adds prices to non-swatch dropdowns
            _RenderSwatchSelect: function (config, chooseText) {
                var html;

                if (this.options.jsonSwatchConfig.hasOwnProperty(config.id)) {
                    return '';
                }

                html =
                    '<select class="' + this.options.classes.selectClass + ' ' + config.code + '">' +
                    '<option value="0" data-option-id="0">' + chooseText + '</option>';

                const differences = this._getOptionDiffs();
                const { priceFormat } = this.options.jsonConfig;

                $.each(config.options, function () {
                    var label = this.label,
                        attr = ' value="' + this.id + '" data-option-id="' + this.id + '"';

                    if (!this.hasOwnProperty('products') || this.products.length <= 0) {
                        attr += ' data-option-empty="true"';
                    }

                    html += '<option ' + attr + '>'
                        + label
                        + ' '
                        + (differences[this.id] > 0 ? '+' : '')
                        + (Math.abs(differences[this.id] - 0) >= 0.001
                            ? priceUtils.formatPrice(differences[this.id], priceFormat)
                            : '')
                        + '</option>';
                });

                html += '</select>';

                return html;
            },
        });

        return $.mage.SwatchRenderer;
    }
});
