let currentSlide = 0;
let slides = document.querySelectorAll('.slideshow img');
let slideInterval = setInterval(nextSlide, 4000);

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

new fullpage('#fullpage', {
    autocomplete: true
})