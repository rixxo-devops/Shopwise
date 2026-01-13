define([], function() {
    'use strict'

    function displayProducts(category, productCategories, productCardElements) {
        productCardElements.forEach(productCardElement => {
            const productName = productCardElement.dataset.name
            if (productCategories[productName].includes(category)) {
                productCardElement.classList.add('active')
            } else {
                productCardElement.classList.remove('active')
            }
        })
    }

    function setCategoryElement(currentCategoryElement, categoryElements) {
        categoryElements.forEach(catEl => catEl.classList.remove('active'))
        currentCategoryElement.classList.add('active')
    }

    return function(config, element) {
        const productCardElements = document.querySelectorAll(config.productCardSelector)
        const categoryListElements = document.querySelectorAll(`.${config.categoriesClass}`)

        element.addEventListener('click', (e) => {
            const element = e.target
            console.log(element)
            if (!element.classList.contains(config.categoriesClass)) return;
            displayProducts(element.innerText, config.productCategories, productCardElements)
            setCategoryElement(element, categoryListElements)
        })
    }
});
