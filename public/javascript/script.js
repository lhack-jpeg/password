const backdrop = document.querySelector('.backdrop');
const mobileNav = document.querySelector('.mobile-nav');
const toggleButton = document.querySelector('.toggle-button');

toggleButton.addEventListener('click', function () {
    mobileNav.style.display = 'block';
    setTimeout(function () {
        backdrop.style.display = 'block';
    }, 10);
});

backdrop.addEventListener('click', function () {
    mobileNav.style.display = 'none';
    backdrop.style.display = 'none';
});
