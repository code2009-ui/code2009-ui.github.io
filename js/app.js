function openLightbox(product, index) {
    // 🔒 التحقق من وجود المنتج أولاً
    if (!productImages || !productImages[product]) {
        console.error('❌ Product not found:', product);
        console.log('Available products:', Object.keys(productImages || {}));
        return;
    }

    // 🔒 التحقق من وجود الصور
    if (!productImages[product][index]) {
        console.error('❌ Image not found at index:', index);
        console.log('Available images:', productImages[product]);
        return;
    }

    currentProduct = product;
    currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }
    
    lightboxImg.src = productImages[product][index];
    lightbox.classList.add("show");
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        lightbox.classList.remove("show");
    }
}

function changeImage(direction) {
    // 🔒 التحقق من وجود المنتج الحالي
    if (!productImages || !productImages[currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = productImages[currentProduct];
    currentIndex = (currentIndex + direction + imgs.length) % imgs.length;
    
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightboxImg) {
        lightboxImg.src = imgs[currentIndex];
    }
}

// تحديث CSS ديناميكياً
(function(){
    try {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(l => {
            if (l.href && l.href.includes('profile.css')) {
                l.href = l.href.split('?')[0] + '?v=' + Date.now();
            }
        });
    } catch(e) { 
        console.error('CSS refresh error:', e); 
    }
})();

function revealOnScrollMobile() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const categories = document.querySelectorAll('.category');

    for (let i = 0; i < categories.length; i += 2) {
        const left = categories[i];
        const right = categories[i + 1];

        const rect = left.getBoundingClientRect();
        const trigger = rect.top < window.innerHeight - 100;

        if (trigger && !left.classList.contains('visible-left')) {
            left.classList.add('visible-left');
            if (right) right.classList.add('visible-right');
        }
    }
}

const perRow = 4;
const categories = document.querySelectorAll('.category');

function revealOnScrollDesktop() {
    for (let i = 0; i < categories.length; i += perRow) {
        const rowItems = Array.from(categories).slice(i, i + perRow);
        const firstItem = rowItems[0];
        
        if (!firstItem) continue;
        
        const rect = firstItem.getBoundingClientRect();

        if (rect.top >= 0 && rect.top < window.innerHeight - 100) {
            rowItems.forEach((el, index) => {
                if (!el.classList.contains('visible')) {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, index * 200);
                }
            });
        }
    }
}

window.addEventListener('scroll', () => {
    revealOnScrollMobile();
    revealOnScrollDesktop();
});

window.addEventListener('load', () => {
    revealOnScrollMobile();
    revealOnScrollDesktop();
});

window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    
    if (!header) return;

    if (window.scrollY > 10) {
        header.style.transform = 'translateY(20px)';
        header.style.maxWidth = '70%';
        header.style.borderRadius = '40px';
        header.style.backgroundColor = 'rgba(215, 207, 196, 0.70)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.webkitBackdropFilter = 'blur(1px)';
    } else {
        header.style.transform = 'translateY(0)';
        header.style.maxWidth = '100%';
        header.style.borderRadius = '2px';
        header.style.backgroundColor = 'rgb(215, 207, 196)';
        header.style.backdropFilter = 'none';
        header.style.webkitBackdropFilter = 'none';
    }
});

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");

        if (mobileMenu.classList.contains("show")) {
            mobileMenu.classList.remove("show");
            mobileMenu.classList.add("hide");
        } else {
            mobileMenu.classList.remove("hide");
            mobileMenu.classList.add("show");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const lightboxImg = document.querySelector('.lightbox img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    function animateImageChange(direction) {
        if (!lightboxImg) return;
        
        lightboxImg.style.animation = 'none';
        setTimeout(() => {
            if (direction === 'next') {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
        }, 10);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => animateImageChange('prev'));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => animateImageChange('next'));
    }
});