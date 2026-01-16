// =======================
// المتغيرات العامة للـ Wishlist
// =======================
let wishlist_currentProduct = null;
let wishlist_currentIndex = 0;
let wishlist_productImages = {};

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
// Lightbox للصور في صفحة الـ Wishlist فقط
// =======================
function wishlist_openLightbox(productKey, index) {
    if (!wishlist_productImages || !wishlist_productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!wishlist_productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }

    wishlist_currentProduct = productKey;
    wishlist_currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }
    
    lightboxImg.src = wishlist_productImages[productKey][index];
    lightbox.classList.add("show");
}

function wishlist_closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        lightbox.classList.remove("show");
    }
}

function wishlist_changeImage(direction) {
    if (!wishlist_productImages || !wishlist_productImages[wishlist_currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = wishlist_productImages[wishlist_currentProduct];
    wishlist_currentIndex = (wishlist_currentIndex + direction + imgs.length) % imgs.length;
    
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightboxImg) {
        lightboxImg.src = imgs[wishlist_currentIndex];
    }
}

function setupImageGallery(container, images, productKey) {
    wishlist_productImages[productKey] = images;
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

        wishlistProducts.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const imagesArray = product.images && product.images.length > 0 
                ? product.images 
                : ['https://dummyimage.com/300x300/ccc/fff&text=No+Image'];
            
            const firstImage = imagesArray[0].startsWith('../') 
                ? imagesArray[0] 
                : '../' + imagesArray[0];

            const isActive = isFavorite(product.productKey);

            card.innerHTML = `
                <div class="heart-icon ${isActive ? 'active' : ''}" 
                     onclick="window.toggleWishlist(event, '${product.username}', '${product.product_name}', '${product.images[0]}', '${product.category}')">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div class="image-gallery">
                    <img src="${firstImage}" 
                         alt="${product.product_name}"
                         class="product-image"
                         onerror="this.src='https://dummyimage.com/300x300/ccc/fff&text=No+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.product_name || 'منتج'}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-seller">
                        <a href="../users/${encodeURIComponent(product.username)}/profile.html" class="seller-link">
                            ${product.username}
                        </a>
                    </div>
                </div>
            `;

            wishlistGrid.appendChild(card);
            
            const processedImages = imagesArray.map(img => 
                img.startsWith('../') ? img : '../' + img
            );
            setupImageGallery(card.querySelector('.image-gallery'), processedImages, product.productKey);
        });

    } catch (e) {
        wishlistGrid.innerHTML = '<div class="no-products">خطأ في تحميل المفضلة</div>';
    }
}

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
});