// =======================
// المتغيرات العامة للـ Wishlist
// =======================
window.wishlistPage = window.wishlistPage || {};
window.wishlistPage.currentProduct = null;
window.wishlistPage.currentIndex = 0;
window.wishlistPage.productImages = {};
window.wishlistPage.loadedImages = new Set();

// =======================
// المفضلة (Wishlist) - localStorage
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

function updateWishlistCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('wishlist-count');
    
    if (!countElement) return;

    countElement.textContent = favorites.length;
    countElement.style.display = favorites.length > 0 ? 'flex' : 'none';
}

// =======================
// Preload للصور المجاورة
// =======================
function wishlist_preloadAdjacentImages(productKey, currentIdx) {
    const images = window.wishlistPage.productImages[productKey];
    if (!images || images.length <= 1) return;

    const nextIdx = (currentIdx + 1) % images.length;
    const prevIdx = (currentIdx - 1 + images.length) % images.length;

    const nextImg = new Image();
    nextImg.onload = () => window.wishlistPage.loadedImages.add(images[nextIdx]);
    nextImg.src = images[nextIdx];

    const prevImg = new Image();
    prevImg.onload = () => window.wishlistPage.loadedImages.add(images[prevIdx]);
    prevImg.src = images[prevIdx];
}

// =======================
// Lightbox للصور في صفحة الـ Wishlist
// =======================
function wishlist_openLightbox(productKey, index) {
    if (!window.wishlistPage.productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!window.wishlistPage.productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }
    
    window.wishlistPage.currentProduct = productKey;
    window.wishlistPage.currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.querySelector('.lightbox .prev-btn');
    const nextBtn = document.querySelector('.lightbox .next-btn');
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }

    const images = window.wishlistPage.productImages[productKey];
    
    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    lightboxImg.src = images[index];
    lightbox.classList.add("show");

    wishlist_preloadAdjacentImages(productKey, index);
}

function wishlist_closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const loadingOverlay = lightbox.querySelector('.loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
    
    lightbox.classList.remove("show");
}

function wishlist_changeImage(direction) {
    if (!window.wishlistPage.productImages[window.wishlistPage.currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = window.wishlistPage.productImages[window.wishlistPage.currentProduct];
    
    if (imgs.length <= 1) return;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) return;

    const newIndex = (window.wishlistPage.currentIndex + direction + imgs.length) % imgs.length;
    const newImageSrc = imgs[newIndex];

    const isImageCached = window.wishlistPage.loadedImages.has(newImageSrc);

    if (isImageCached) {
        window.wishlistPage.currentIndex = newIndex;
        
        lightboxImg.style.animation = 'none';
        
        requestAnimationFrame(() => {
            if (direction === 1) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
            lightboxImg.src = newImageSrc;
        });

        wishlist_preloadAdjacentImages(window.wishlistPage.currentProduct, newIndex);
    } else {
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
            window.wishlistPage.currentIndex = newIndex;
            window.wishlistPage.loadedImages.add(newImageSrc);
            
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

            wishlist_preloadAdjacentImages(window.wishlistPage.currentProduct, newIndex);
        };

        tempImg.onerror = function() {
            loadingOverlay.classList.remove('show');
            lightboxImg.style.opacity = '1';
            console.error('فشل تحميل الصورة');
        };

        tempImg.src = newImageSrc;
    }
}

function wishlist_setupImageGallery(container, images, productKey) {
    const processedImages = images.map(img => {
        return img.startsWith('../') ? img : '../' + img;
    });

    console.log('✅ Processed images:', processedImages);
    
    window.wishlistPage.productImages[productKey] = processedImages;
    
    if (processedImages[0]) {
        const firstImg = new Image();
        firstImg.onload = () => window.wishlistPage.loadedImages.add(processedImages[0]);
        firstImg.src = processedImages[0];
    }
    
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => wishlist_openLightbox(productKey, 0);
    }
}

// =======================
// تحميل وعرض المنتجات في المفضلة
// =======================
async function loadWishlistProducts() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistTitle = document.getElementById('wishlistTitle');
    const wishlistCount = document.getElementById('wishlistCount');
    const favorites = getFavorites();

    if (wishlistTitle) wishlistTitle.textContent = 'المفضلة';

    if (favorites.length === 0) {
        wishlistGrid.innerHTML = '<div class="no-products">لم تقم بإضافة أي منتجات للمفضلة بعد</div>';
        if (wishlistCount) wishlistCount.textContent = '';
        return;
    }

    try {
        const response = await fetch('../products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const allProducts = await response.json();
        const wishlistProducts = [];

        favorites.forEach(favKey => {
            const parts = favKey.split('|||');
            if (parts.length !== 4) return;
            
            const [username, productName, image, category] = parts;
            
            for (let product of allProducts) {
                const matches = 
                    product.username === username &&
                    product.product_name === productName &&
                    product.images[0] === image &&
                    product.category === category;
                
                if (matches) {
                    wishlistProducts.push({ ...product, productKey: favKey });
                    break;
                }
            }
        });

        if (wishlistCount) {
            wishlistCount.textContent = `${wishlistProducts.length} منتج في المفضلة`;
        }

        if (wishlistProducts.length === 0) {
            wishlistGrid.innerHTML = '<div class="no-products">لا توجد منتجات في المفضلة</div>';
            return;
        }

        wishlistGrid.innerHTML = '';

        wishlistProducts.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const productKey = product.productKey || product.username + '_' + product.product_name + '_' + index;

            const heartDiv = document.createElement('div');
            heartDiv.className = 'heart-icon active';
            heartDiv.setAttribute('onclick', "toggleWishlist(event, '" + product.username + "', '" + product.product_name + "', '" + product.images[0] + "', '" + product.category + "')");
            heartDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

            const galleryDiv = document.createElement('div');
            galleryDiv.className = 'image-gallery';
            
            const spinner = document.createElement('div');
            spinner.className = 'product-spinner';
            spinner.innerHTML = '<div class="spinner-circle"></div>';
            galleryDiv.appendChild(spinner);
            
            const img = document.createElement('img');
            img.dataset.src = '../' + product.images[0];
            img.alt = product.product_name;
            img.className = 'product-image lazy';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23f8f8f8" width="300" height="300"/%3E%3C/svg%3E';
            img.src = placeholder;
            
            img.onerror = function() { 
                this.src = 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة'; 
                this.style.opacity = '1';
                const spinnerEl = this.parentElement.querySelector('.product-spinner');
                if (spinnerEl) spinnerEl.style.display = 'none';
            };
            
            galleryDiv.appendChild(img);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'product-info';
            
            const nameH3 = document.createElement('h3');
            nameH3.className = 'product-name';
            nameH3.textContent = product.product_name || 'منتج بدون اسم';
            
            const descP = document.createElement('p');
            descP.className = 'product-description';
            descP.textContent = product.description || '';
            
            const sellerDiv = document.createElement('div');
            sellerDiv.className = 'product-seller';
            const sellerLink = document.createElement('a');
            sellerLink.href = '../users/' + encodeURIComponent(product.username) + '/profile.html';
            sellerLink.className = 'seller-link';
            sellerLink.textContent = product.username;
            sellerDiv.appendChild(sellerLink);
            
            infoDiv.appendChild(nameH3);
            infoDiv.appendChild(descP);
            infoDiv.appendChild(sellerDiv);

            productCard.appendChild(heartDiv);
            productCard.appendChild(galleryDiv);
            productCard.appendChild(infoDiv);
            wishlistGrid.appendChild(productCard);

            wishlist_setupImageGallery(galleryDiv, product.images, productKey);
        });
        
        wishlist_initLazyLoading();

    } catch (e) {
        console.error('Error loading wishlist:', e);
        wishlistGrid.innerHTML = '<div class="no-products">خطأ في تحميل المفضلة</div>';
    }
}

function wishlist_initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    lazyImages.forEach(img => {
        const realSrc = img.dataset.src;
        const spinner = img.parentElement.querySelector('.product-spinner');
        
        const tempImg = new Image();
        tempImg.onload = function() {
            img.src = realSrc;
            img.style.opacity = '1';
            if (spinner) spinner.style.display = 'none';
            img.classList.remove('lazy');
        };
        tempImg.src = realSrc;
    });
}

// =======================
// تحديث جميع القلوب لمنتج معين
// =======================
function updateHeartIconsForProduct(productKey, isActive) {
    const heartIcons = document.querySelectorAll('.heart-icon');
    
    heartIcons.forEach(heart => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/);
        if (!match) return;
        
        const [, username, productName, image, category] = match;
        const key = `${username}|||${productName}|||${image}|||${category}`;
        
        if (key === productKey) {
            if (isActive) {
                heart.classList.add('active');
            } else {
                heart.classList.remove('active');
            }
        }
    });
}

// =======================
// تحديث حالة جميع القلوب في الصفحة
// =======================
function updateAllHeartIcons() {
    const favorites = getFavorites();
    const heartIcons = document.querySelectorAll('.heart-icon');
    
    heartIcons.forEach(heart => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/);
        if (!match) return;
        
        const [, username, productName, image, category] = match;
        const key = `${username}|||${productName}|||${image}|||${category}`;
        
        if (favorites.includes(key)) {
            heart.classList.add('active');
        } else {
            heart.classList.remove('active');
        }
    });
}

// =======================
// Toggle Wishlist مع أنيميشن الحذف
// =======================
function toggleWishlist(event, username, productName, image, category) {
    event.stopPropagation();
    event.preventDefault();
    
    const key = `${username}|||${productName}|||${image}|||${category || ''}`;
    let favs = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    const heartIcon = event.currentTarget;
    const productCard = heartIcon.closest('.product-card');
    
    if (favs.includes(key)) {
        // إزالة من المفضلة
        favs = favs.filter(k => k !== key);
        
        // تحديث جميع القلوب لهذا المنتج في الصفحة
        updateHeartIconsForProduct(key, false);
        
        if (productCard) {
            productCard.classList.add('removing');
            setTimeout(() => {
                const isWishlistPage = document.getElementById('wishlistGrid') !== null;
                if (isWishlistPage && typeof loadWishlistProducts === 'function') {
                    loadWishlistProducts();
                }
            }, 500);
        }
    } else {
        // إضافة للمفضلة
        favs.push(key);
        
        // تحديث جميع القلوب لهذا المنتج في الصفحة
        updateHeartIconsForProduct(key, true);
        
        heartIcon.classList.add('animating');
        setTimeout(() => heartIcon.classList.remove('animating'), 600);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(favs));
    updateWishlistCount();
}

window.toggleWishlist = toggleWishlist;

// =======================
// تحديث القلوب عند تغيير localStorage من تاب آخر
// =======================
window.addEventListener('storage', function(e) {
    if (e.key === 'wishlist') {
        updateAllHeartIcons();
        updateWishlistCount();
    }
});

// =======================
// عند تحميل صفحة الـ Wishlist
// =======================
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('wishlist.html')) {
        loadWishlistProducts();
        
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', e => {
                if (e.target === lightbox) wishlist_closeLightbox();
            });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') wishlist_closeLightbox();
            });
        }
        
        window.closeLightbox = wishlist_closeLightbox;
        window.changeImage = wishlist_changeImage;
    }
    
    // تحديث العدد عند تحميل أي صفحة
    updateWishlistCount();
});