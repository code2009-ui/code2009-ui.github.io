// =======================
// المتغيرات العامة للـ Search
// =======================
window.searchPage = window.searchPage || {};
window.searchPage.currentProduct = null;
window.searchPage.currentIndex = 0;
window.searchPage.productImages = {};
window.searchPage.loadedImages = new Set();

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// =======================
// Preload Adjacent Images
// =======================
function preloadAdjacentImages(productKey, currentIdx) {
    const images = window.searchPage.productImages[productKey];
    if (!images || images.length <= 1) return;

    const nextIdx = (currentIdx + 1) % images.length;
    const prevIdx = (currentIdx - 1 + images.length) % images.length;

    const nextImg = new Image();
    nextImg.onload = () => window.searchPage.loadedImages.add(images[nextIdx]);
    nextImg.src = images[nextIdx];

    const prevImg = new Image();
    prevImg.onload = () => window.searchPage.loadedImages.add(images[prevIdx]);
    prevImg.src = images[prevIdx];
}

// =======================
// Lightbox Functions
// =======================
function search_openLightbox(productKey, index) {
    if (!window.searchPage.productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!window.searchPage.productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }
    
    window.searchPage.currentProduct = productKey;
    window.searchPage.currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.querySelector('.lightbox .prev-btn');
    const nextBtn = document.querySelector('.lightbox .next-btn');
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }

    const images = window.searchPage.productImages[productKey];
    
    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    lightboxImg.src = images[index];
    lightbox.classList.add("show");

    preloadAdjacentImages(productKey, index);
}

function search_closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const loadingOverlay = lightbox.querySelector('.loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
    
    lightbox.classList.remove("show");
}

function search_changeImage(direction) {
    if (!window.searchPage.productImages[window.searchPage.currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = window.searchPage.productImages[window.searchPage.currentProduct];
    
    if (imgs.length <= 1) return;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) return;

    const newIndex = (window.searchPage.currentIndex + direction + imgs.length) % imgs.length;
    const newImageSrc = imgs[newIndex];

    const isImageCached = window.searchPage.loadedImages.has(newImageSrc);

    if (isImageCached) {
        window.searchPage.currentIndex = newIndex;
        
        lightboxImg.style.animation = 'none';
        
        requestAnimationFrame(() => {
            if (direction === 1) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
            lightboxImg.src = newImageSrc;
        });

        preloadAdjacentImages(window.searchPage.currentProduct, newIndex);
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
            window.searchPage.currentIndex = newIndex;
            window.searchPage.loadedImages.add(newImageSrc);
            
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

            preloadAdjacentImages(window.searchPage.currentProduct, newIndex);
        };

        tempImg.onerror = function() {
            loadingOverlay.classList.remove('show');
            lightboxImg.style.opacity = '1';
            console.error('فشل تحميل الصورة');
        };

        tempImg.src = newImageSrc;
    }
}

// =======================
// Setup Image Gallery
// =======================
function search_setupImageGallery(container, images, productKey) {
    const processedImages = images.map(img => {
        return '../' + img;
    });

    console.log('✅ Processed images:', processedImages);
    
    window.searchPage.productImages[productKey] = processedImages;
    
    if (processedImages[0]) {
        const firstImg = new Image();
        firstImg.onload = () => window.searchPage.loadedImages.add(processedImages[0]);
        firstImg.src = processedImages[0];
    }
    
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => search_openLightbox(productKey, 0);
    }
}

// =======================
// Search Products Function
// =======================
async function searchProducts() {
    const searchTerm = getUrlParameter('search-term');
    const searchQuery = document.getElementById('searchQuery');
    const searchTitle = document.getElementById('searchTitle');
    const resultsCount = document.getElementById('resultsCount');
    const productsGrid = document.getElementById('productsGrid');

    if (!searchTerm) {
        if (searchTitle) searchTitle.textContent = 'البحث';
        if (searchQuery) searchQuery.textContent = 'الرجاء إدخال كلمة للبحث';
        if (productsGrid) productsGrid.innerHTML = '<div class="no-products">لم تقم بإدخال أي كلمة للبحث</div>';
        return;
    }

    if (searchQuery) searchQuery.textContent = `البحث عن: "${searchTerm}"`;

    try {
        const response = await fetch('../products.json');

        if (!response.ok) {
            throw new Error('فشل تحميل البيانات');
        }

        const products = await response.json();
        const searchLower = searchTerm.toLowerCase().trim();

        const results = products.filter(product => {
            const productName = (product.product_name || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            const username = (product.username || '').toLowerCase();

            return productName.includes(searchLower) ||
                description.includes(searchLower) ||
                username.includes(searchLower);
        }).sort((a, b) => {
            const aName = (a.product_name || '').toLowerCase();
            const aDesc = (a.description || '').toLowerCase();
            const bName = (b.product_name || '').toLowerCase();
            const bDesc = (b.description || '').toLowerCase();

            if (aName.includes(searchLower) && !bName.includes(searchLower)) return -1;
            if (!aName.includes(searchLower) && bName.includes(searchLower)) return 1;
            if (aDesc.includes(searchLower) && !bDesc.includes(searchLower)) return -1;
            if (!aDesc.includes(searchLower) && bDesc.includes(searchLower)) return 1;

            return 0;
        });

        if (results.length === 0) {
            if (resultsCount) resultsCount.textContent = 'لم يتم العثور على نتائج';
            if (productsGrid) productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات تطابق بحثك. حاول استخدام كلمات مختلفة.</div>';
        } else {
            if (resultsCount) resultsCount.textContent = `تم العثور على ${results.length} ${results.length === 1 ? 'منتج' : 'منتجات'}`;
            if (productsGrid) {
                productsGrid.innerHTML = '';
                results.forEach((product, index) => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    const productKey = product.username + '_' + product.product_name + '_' + index;

                    const heartDiv = document.createElement('div');
                    heartDiv.className = 'heart-icon';
                    heartDiv.setAttribute('onclick', "toggleWishlist(event, '" + product.username + "', '" + product.product_name + "', '" + product.images[0] + "', '" + (product.category || '') + "')");
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
                    productsGrid.appendChild(productCard);

                    search_setupImageGallery(galleryDiv, product.images, productKey);
                    updateHeartState(heartDiv, product.images[0]);
                });
                
                initLazyLoading();
            }
        }
    } catch (error) {
        console.error('Error searching products:', error);
        if (resultsCount) resultsCount.textContent = '';
        if (productsGrid) productsGrid.innerHTML = '<div class="no-products">حدث خطأ في تحميل المنتجات</div>';
    }
}

// =======================
// Lazy Loading
// =======================
function initLazyLoading() {
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
// Update Heart State
// =======================
function updateHeartState(heartIcon, imagePath) {
    if (!heartIcon) return;
    
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

function updateAllHearts() {
    const allCards = document.querySelectorAll('.product-card');
    allCards.forEach(card => {
        const heart = card.querySelector('.heart-icon');
        const onclick = heart.getAttribute('onclick');
        
        if (onclick) {
            const match = onclick.match(/toggleWishlist\(event,\s*'[^']*',\s*'[^']*',\s*'([^']*)'/);
            if (match) {
                const imagePath = match[1];
                updateHeartState(heart, imagePath);
            }
        }
    });
}

// =======================
// Initialize
// =======================
document.addEventListener('DOMContentLoaded', function() {
    searchProducts();
    setTimeout(updateAllHearts, 100);
    
    window.addEventListener('wishlistUpdated', updateAllHearts);
    window.addEventListener('storage', function(e) {
        if (e.key === 'wishlist') {
            updateAllHearts();
        }
    });
    
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                search_closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                search_closeLightbox();
            }
        });
    }
    
    window.closeLightbox = search_closeLightbox;
    window.changeImage = search_changeImage;
});