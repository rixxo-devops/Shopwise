require([],
function() {
    'use strict';

    const navIcon = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-main');
    const mainCategoryTitle = document.querySelectorAll('.nav-main__item');
    const body = document.body;

    navIcon.addEventListener('click', () => {
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    body.addEventListener('click', e => {
        if (e.target === body && nav.classList.contains('active') && body.classList.contains('menu-open')) {
            nav.classList.remove('active');
            body.classList.remove('menu-open');
            mainCategoryTitle.forEach(mainTitle => mainTitle.classList.remove('active'));
        }
    });

    // Controls [mobile] opening & collapasing & [desktop] drop down lists on hover
    mainCategoryTitle.forEach(mainTitle => {
        const tileLink = mainTitle.querySelector('.nav-main__link');
        const innerList = mainTitle.querySelector('.nav-main__inner-list');

        // Collapsing list mobile
        tileLink.addEventListener('click', (e) => {
            // check for mobile and to see if it has children
            if (nav.classList.contains('active') && window.innerWidth < 992 && innerList) {
                e.preventDefault();
                // collapse all other categories apart from self - means clicking on same category can close aswell as open
                mainCategoryTitle.forEach(title => {
                    if (title !== mainTitle) {
                        title.classList.remove('active')
                    }
                });

                mainTitle.classList.toggle('active');
            }
        });
    });
})
