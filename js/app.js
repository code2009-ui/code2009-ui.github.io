// =======================
// المتغيرات العامة للـ Lightbox
// =======================
let currentProduct = null;
let currentIndex = 0;
let productImages = {};

// =======================
// Lightbox للصور
// =======================
function openLightbox(productKey, index) {
    if (!productImages || !productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        console.log('Available products:', Object.keys(productImages || {}));
        return;
    }

    if (!productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        console.log('Available images:', productImages[productKey]);
        return;
    }

    currentProduct = productKey;
    currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }
    
    lightboxImg.src = productImages[productKey][index];
    lightbox.classList.add("show");
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        lightbox.classList.remove("show");
    }
}

function changeImage(direction) {
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

// =======================
// المفضلة (Wishlist)
// =======================
function getFavorites() {
    try {
        const data = localStorage.getItem('wishlist');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem('wishlist', JSON.stringify(favorites));
    } catch (e) {
        console.error('Error saving favorites');
    }
}

function isFavorite(productKey) {
    return getFavorites().includes(productKey);
}

function toggleWishlist(event, username, productName, image, category) {
    event.stopPropagation();
    event.preventDefault();
    
    const element = event.currentTarget;
    const productKey = `${username}|||${productName}|||${image}|||${category}`;
    
    let favorites = getFavorites();

    element.classList.add('animating');
    setTimeout(() => element.classList.remove('animating'), 600);

    if (favorites.includes(productKey)) {
        favorites = favorites.filter(key => key !== productKey);
        element.classList.remove('active');
        console.log(`تم إزالة "${productName}" من المفضلة`);
    } else {
        favorites.push(productKey);
        element.classList.add('active');
        console.log(`تم إضافة "${productName}" إلى المفضلة`);
    }

    saveFavorites(favorites);
    updateWishlistCount();
}

function updateWishlistCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('wishlist-count');
    
    if (!countElement) return;

    countElement.textContent = favorites.length;
    countElement.style.display = favorites.length > 0 ? 'flex' : 'none';
}

function loadHearts() {
    const favorites = getFavorites();
    const hearts = document.querySelectorAll('.heart-icon');
    
    hearts.forEach(heart => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'\)/);
        
        if (match) {
            const [_, username, productName, image, category] = match;
            const productKey = `${username}|||${productName}|||${image}|||${category}`;
            
            if (favorites.includes(productKey)) {
                heart.classList.add('active');
            }
        }
    });
}

// =======================
// Animations
// =======================
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

function revealOnScrollDesktop() {
    const perRow = 4;
    const categories = document.querySelectorAll('.category');

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

// =======================
// Header Scroll Effect
// =======================
function handleHeaderScroll() {
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
}

// =======================
// Hamburger Menu
// =======================
function initHamburgerMenu() {
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
}

// =======================
// Lightbox Animation
// =======================
function initLightboxAnimation() {
    const lightboxImg = document.querySelector('#lightbox-img');
    const prevBtn = document.querySelector('.lightbox .prev');
    const nextBtn = document.querySelector('.lightbox .next');

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
}

// =======================
// Event Listeners
// =======================
window.addEventListener('scroll', () => {
    revealOnScrollMobile();
    revealOnScrollDesktop();
    handleHeaderScroll();
});

window.addEventListener('load', () => {
    revealOnScrollMobile();
    revealOnScrollDesktop();
});

document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();
    loadHearts();
    initHamburgerMenu();
    initLightboxAnimation();

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeLightbox();
        });
    }
});

// =======================
// Global Functions
// =======================
window.toggleWishlist = toggleWishlist;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeImage = changeImage;