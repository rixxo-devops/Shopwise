define([], function () {
    return function(config, websiteQuoteRequest) {
        var toggleClass = config.toggleClass || 'open';
        var productName = document.querySelector('[itemprop="name"]').textContent;
        var productNameInput = websiteQuoteRequest.querySelector('.field.product-name input');
        var productId = document.querySelector(".price-final_price").getAttribute("data-product-id");

        var productPrice = document.getElementById("price-excluding-tax-product-price-" + productId).textContent;
        var productPriceInput = websiteQuoteRequest.querySelector('.field.product-price input');
        if (!productPriceInput) throw new Error("Form must have a product price field.");
        productPriceInput.value = productPrice;
        
        if (!productNameInput) throw new Error("Form must have a product name field.");
        productNameInput.value = productName;

        if (!websiteQuoteRequest.id) throw new Error("Element must have an id.");

        websiteQuoteRequest.hidden = true;

        var toggleLink = document.getElementById('website-quote-toggle');

        toggleLink.classList.remove(toggleClass);

        toggleLink.addEventListener('click', function (e) {
            websiteQuoteRequest.hidden = toggleLink.classList.toggle(toggleClass) ? false : true;
        });
    };
});
