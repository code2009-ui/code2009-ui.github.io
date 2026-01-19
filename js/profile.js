// ==================== Profile Page - Enhanced Version ====================
// Namespace للبروفايل لتجنب التعارضات
window.profilePage = window.profilePage || {};
window.profilePage.currentProduct = null;
window.profilePage.currentIndex = 0;
window.profilePage.productImages = {};
window.profilePage.loadedImages = new Set();

// ==================== Preload Adjacent Images ====================
function preloadAdjacentImages(productKey, currentIdx) {
    const images = window.profilePage.productImages[productKey];
    if (!images || images.length <= 1) return;

    const nextIdx = (currentIdx + 1) % images.length;
    const prevIdx = (currentIdx - 1 + images.length) % images.length;

    // Preload next image
    const nextImg = new Image();
    nextImg.onload = () => window.profilePage.loadedImages.add(images[nextIdx]);
    nextImg.src = images[nextIdx];

    // Preload previous image
    const prevImg = new Image();
    prevImg.onload = () => window.profilePage.loadedImages.add(images[prevIdx]);
    prevImg.src = images[prevIdx];
}

// ==================== Open Lightbox ====================
function profile_openLightbox(productKey, index) {
    if (!window.profilePage.productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!window.profilePage.productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }
    
    window.profilePage.currentProduct = productKey;
    window.profilePage.currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.querySelector('.lightbox .prev');
    const nextBtn = document.querySelector('.lightbox .next');
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }

    const images = window.profilePage.productImages[productKey];
    
    // Hide/show navigation buttons based on image count
    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    }
    
    lightboxImg.src = images[index];
    lightbox.classList.add("show");
    
    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    preloadAdjacentImages(productKey, index);
}

// ==================== Close Lightbox ====================
function profile_closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const loadingOverlay = lightbox ? lightbox.querySelector('.loading-overlay') : null;
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
    
    if (lightbox) {
        lightbox.classList.remove("show");
    }
    
    // Re-enable body scroll
    document.body.style.overflow = '';
}

// ==================== Change Image in Lightbox ====================
function profile_changeImage(direction) {
    if (!window.profilePage.productImages[window.profilePage.currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = window.profilePage.productImages[window.profilePage.currentProduct];
    
    if (imgs.length <= 1) return;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) return;

    const newIndex = (window.profilePage.currentIndex + direction + imgs.length) % imgs.length;
    const newImageSrc = imgs[newIndex];

    const isImageCached = window.profilePage.loadedImages.has(newImageSrc);

    if (isImageCached) {
        // Image is cached - instant transition
        window.profilePage.currentIndex = newIndex;
        
        lightboxImg.style.animation = 'none';
        
        requestAnimationFrame(() => {
            if (direction === 1) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
            lightboxImg.src = newImageSrc;
        });

        preloadAdjacentImages(window.profilePage.currentProduct, newIndex);
    } else {
        // Image not cached - show loading
        let loadingOverlay = lightbox.querySelector('.loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            lightbox.appendChild(loadingOverlay);
        }

        loadingOverlay.classList.add('show');
        lightboxImg.style.opacity = '0';

        const tempImg = new Image();
        
        tempImg.onload = function() {
            window.profilePage.currentIndex = newIndex;
            window.profilePage.loadedImages.add(newImageSrc);
            
            lightboxImg.style.animation = 'none';
            
            requestAnimationFrame(() => {
                if (direction === 1) {
                    lightboxImg.style.animation = 'fadeSlide 0.4s ease';
                } else {
                    lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
                }
                lightboxImg.src = newImageSrc;
                lightboxImg.style.opacity = '1';
            });
            
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 100);

            preloadAdjacentImages(window.profilePage.currentProduct, newIndex);
        };

        tempImg.onerror = function() {
            loadingOverlay.classList.remove('show');
            lightboxImg.style.opacity = '1';
            console.error('❌ Failed to load image');
        };

        tempImg.src = newImageSrc;
    }
}

// ==================== Setup Product Images ====================
function profile_setupProductImages() {
    console.log('🔧 Setting up product images...');
    
    // Import productImages from global scope (defined in HTML)
    if (window.productImages) {
        window.profilePage.productImages = window.productImages;
        console.log('✅ Product images loaded:', Object.keys(window.profilePage.productImages).length);
    } else {
        console.warn('⚠️ No productImages found in global scope');
    }
    
    // Preload first images
    Object.keys(window.profilePage.productImages).forEach(key => {
        const images = window.profilePage.productImages[key];
        if (images && images[0]) {
            const firstImg = new Image();
            firstImg.onload = () => window.profilePage.loadedImages.add(images[0]);
            firstImg.src = images[0];
        }
    });
}

// ==================== Setup Image Click Handlers ====================
function profile_setupImageClickHandlers() {
    const productCards = document.querySelectorAll('.product-card');
    console.log('🔧 Setting up click handlers for', productCards.length, 'products');
    
    productCards.forEach((card, cardIndex) => {
        const img = card.querySelector('.product-image');
        const heartIcon = card.querySelector('.heart-icon');
        
        if (!img || !heartIcon) {
            console.warn('⚠️ Missing image or heart icon in card', cardIndex);
            return;
        }
        
        const onclick = heartIcon.getAttribute('onclick');
        if (!onclick) {
            console.warn('⚠️ No onclick attribute in heart icon', cardIndex);
            return;
        }
        
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'\)/);
        
        if (match) {
            const [_, username, productName, image, category] = match;
            const productKey = `${username}|||${productName}|||${image}|||${category}`;
            
            if (window.profilePage.productImages[productKey]) {
                img.style.cursor = 'pointer';
                img.onclick = () => profile_openLightbox(productKey, 0);
                console.log('✅ Click handler set for:', productName);
            } else {
                console.warn('⚠️ No images found for product:', productName);
            }
        } else {
            console.warn('⚠️ Could not parse onclick attribute:', onclick);
        }
        
        // Update heart state
        updateHeartState(heartIcon, match ? match[3] : null);
    });
}

// ==================== Initialize Lazy Loading ====================
function profile_initLazyLoading() {
    const lazyImages = document.querySelectorAll('.product-card img.product-image');
    console.log('🔧 Initializing lazy loading for', lazyImages.length, 'images');
    
    lazyImages.forEach((img, index) => {
        // Add loading spinner to parent
        const gallery = img.closest('.product-card');
        if (gallery && !gallery.querySelector('.product-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'product-spinner';
            spinner.innerHTML = '<div class="spinner-circle"></div>';
            
            // Insert spinner before image
            img.parentNode.insertBefore(spinner, img);
            
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        }
        
        const realSrc = img.src;
        const spinner = gallery ? gallery.querySelector('.product-spinner') : null;
        
        // Load image
        const tempImg = new Image();
        tempImg.onload = function() {
            img.style.opacity = '1';
            if (spinner) spinner.style.display = 'none';
            console.log(`✅ Image ${index + 1} loaded`);
        };
        
        tempImg.onerror = function() {
            img.src = 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة';
            img.style.opacity = '1';
            if (spinner) spinner.style.display = 'none';
            console.error(`❌ Failed to load image ${index + 1}`);
        };
        
        tempImg.src = realSrc;
    });
}

// ==================== Update Heart State ====================
function updateHeartState(heartIcon, imagePath) {
    if (!heartIcon || !imagePath) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    const isInWishlist = wishlist.some(item => {
        const parts = item.split('|||');
        if (parts.length === 4) {
            const itemImage = parts[2];
            return itemImage === imagePath;
        }
        return false;
    });
    
    if (isInWishlist) {
        heartIcon.classList.add('active');
    } else {
        heartIcon.classList.remove('active');
    }
}

// ==================== Update All Hearts ====================
function updateAllHearts() {
    const allCards = document.querySelectorAll('.product-card');
    allCards.forEach(card => {
        const heart = card.querySelector('.heart-icon');
        if (!heart) return;
        
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/toggleWishlist\(event,\s*'[^']*',\s*'[^']*',\s*'([^']*)'/);
        if (match) {
            const imagePath = match[1];
            updateHeartState(heart, imagePath);
        }
    });
}

// ==================== Setup Keyboard Navigation ====================
function profile_setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !lightbox.classList.contains('show')) return;
        
        if (e.key === 'Escape') {
            profile_closeLightbox();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const direction = e.key === 'ArrowRight' ? -1 : 1; // Reversed for RTL
            profile_changeImage(direction);
        }
    });
}

// ==================== Setup Lightbox Click to Close ====================
function profile_setupLightboxClickClose() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                profile_closeLightbox();
            }
        });
    }
}

// ==================== Main Initialization ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Profile page initializing...');
    
    // Setup product images from global scope
    profile_setupProductImages();
    
    // Setup click handlers for product images
    profile_setupImageClickHandlers();
    
    // Initialize lazy loading
    profile_initLazyLoading();
    
    // Update heart states
    setTimeout(updateAllHearts, 100);
    
    // Setup keyboard navigation
    profile_setupKeyboardNavigation();
    
    // Setup lightbox click to close
    profile_setupLightboxClickClose();
    
    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', updateAllHearts);
    window.addEventListener('storage', function(e) {
        if (e.key === 'wishlist') {
            updateAllHearts();
        }
    });
    
    console.log('✅ Profile page initialized successfully');
});

// ==================== Export Global Functions ====================
// Make functions available globally for HTML onclick handlers
window.openLightbox = profile_openLightbox;
window.closeLightbox = profile_closeLightbox;
window.changeImage = profile_changeImage;