define([], function () {
    return function(config, galvanisedTankFormContainer) {
        var toggleClass = config.toggleClass || 'open';
        if (!galvanisedTankFormContainer.id) throw new Error("Element must have an id.");

        galvanisedTankFormContainer.style.display = 'none';

        var productName = document.querySelector('[itemprop="name"]').textContent;
        var productPriceBox = document.querySelector('#product_addtocart_form [data-role="priceBox"]');
        var linkText = 'Request a quote for: ' + productName;

        var productNameInput = galvanisedTankFormContainer.querySelector('.field.product-name input');
        if (!productNameInput) throw new Error("Form must have a product name field.");

        productNameInput.value = productName;

        var requestQuoteLink = document.createElement('a');
        requestQuoteLink.appendChild(document.createTextNode('Request A Quote'));
        requestQuoteLink.title = linkText;
        requestQuoteLink.href = "#" + galvanisedTankFormContainer.id;
        requestQuoteLink.className = "galvanised-tank-request-quote-btn";
        productPriceBox.after(requestQuoteLink);

        var toggleLink = document.createElement('a');
        toggleLink.appendChild(document.createTextNode(linkText));
        toggleLink.title = linkText;
        toggleLink.href = "#" + galvanisedTankFormContainer.id;
        toggleLink.className = "galvanised-tank-request-quote-toggle";
        galvanisedTankFormContainer.before(toggleLink);

        toggleLink.classList.remove(toggleClass);

        requestQuoteLink.addEventListener('click', function (e) {
            galvanisedTankFormContainer.style.display = 'block';
            toggleLink.classList.add(toggleClass);
        });

        toggleLink.addEventListener('click', function (e) {
            galvanisedTankFormContainer.style.display = toggleLink.classList.toggle(toggleClass) ? 'block' : 'none';
        });
    };
});
