
window.addEventListener('DOMContentLoaded', function () {
    const headerLinks = document.querySelector('.panel.header > .header.links')

    if (!headerLinks) {
        return
    }

    const navLinks = document.querySelector('#store\\.links')

    if (!navLinks) {
        return
    }

    navLinks.innerHTML = headerLinks.outerHTML
})
