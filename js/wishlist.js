// =======================
// المتغيرات العامة
// =======================
let wishlist_currentProduct = null;
let wishlist_currentIndex = 0;
let wishlist_productImages = {};

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

function isFavorite(productId) {
    return getFavorites().includes(productId);
}

function toggleWishlist(event, username, productName, image, category) {
    event.stopPropagation();
    event.preventDefault();
    
    const element = event.currentTarget;
    const productId = `${username}|||${productName}|||${image}|||${category}`;
    
    toggleFavorite(element, productId, productName);
}

function toggleFavorite(element, productId, productName) {
    let favorites = getFavorites();

    element.classList.add('animating');
    setTimeout(() => element.classList.remove('animating'), 600);

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        element.classList.remove('active');
        console.log(`تم إزالة "${productName}" من المفضلة`);
    } else {
        favorites.push(productId);
        element.classList.add('active');
        console.log(`تم إضافة "${productName}" إلى المفضلة`);
    }

    saveFavorites(favorites);
    updateWishlistCount();

    if (window.location.pathname.includes('wishlist.html')) {
        loadWishlistProducts();
    }
}

function updateWishlistCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('wishlist-count');
    
    if (!countElement) return;

    countElement.textContent = favorites.length;
    countElement.style.display = favorites.length > 0 ? 'flex' : 'none';
}

// =======================
// Lightbox للصور
// =======================

function openLightbox(productId, index) {
    wishlist_currentProduct = productId;
    wishlist_currentIndex = index;
    document.getElementById("lightbox-img").src = wishlist_productImages[productId][index];
    document.getElementById("lightbox").classList.add("show");
}

function closeLightbox() {
    document.getElementById("lightbox").classList.remove("show");
}

function changeImage(direction) {
    const imgs = wishlist_productImages[wishlist_currentProduct];
    wishlist_currentIndex = (wishlist_currentIndex + direction + imgs.length) % imgs.length;
    document.getElementById("lightbox-img").src = imgs[wishlist_currentIndex];
}

function setupImageGallery(container, images, productId) {
    wishlist_productImages[productId] = images;
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => openLightbox(productId, 0);
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

        favorites.forEach(favId => {
            const parts = favId.split('|||');
            if (parts.length !== 4) return;
            
            const [username, productName, image, category] = parts;
            
            for (let product of allProducts) {
                const matches = 
                    product.username === username &&
                    product.product_name === productName &&
                    product.images[0] === image &&
                    product.category === category;
                
                if (matches) {
                    wishlistProducts.push({ ...product, productId: favId });
                    break;
                }
            }
        });

        if (wishlistCount) {
            wishlistCount.textContent = `${wishlistProducts.length} منتج في المفضلة`;
        }

        if (wishlistProducts.length === 0) {
            wishlistGrid.innerHTML = '<div class="no-products">المنتجات المحفوظة غير متوفرة حالياً</div>';
            return;
        }

        wishlistGrid.innerHTML = '';

        wishlistProducts.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const displayId = `wishlist_${index}`;

            const imagesArray = product.images && product.images.length > 0 
                ? product.images 
                : ['https://dummyimage.com/300x300/ccc/fff&text=No+Image'];
            
            const firstImage = imagesArray[0].startsWith('../') 
                ? imagesArray[0] 
                : '../' + imagesArray[0];

            const isActive = isFavorite(product.productId);

            card.innerHTML = `
                <div class="heart-icon ${isActive ? 'active' : ''}" 
                     onclick="toggleWishlist(event, '${product.username}', '${product.product_name}', '${product.images[0]}', '${product.category}')">
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
            setupImageGallery(card.querySelector('.image-gallery'), processedImages, displayId);
        });

    } catch (e) {
        wishlistGrid.innerHTML = '<div class="no-products">خطأ في تحميل المفضلة</div>';
    }
}

// =======================
// تحميل حالة القلوب في صفحات البروفايل
// =======================
function loadHearts() {
    const favorites = getFavorites();
    const hearts = document.querySelectorAll('.heart-icon');
    
    hearts.forEach(heart => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'\)/);
        
        if (match) {
            const [_, username, productName, image, category] = match;
            const productId = `${username}|||${productName}|||${image}|||${category}`;
            
            if (favorites.includes(productId)) {
                heart.classList.add('active');
            }
        }
    });
}

// =======================
// عند تحميل الصفحة
// =======================
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();

    if (window.location.pathname.includes('wishlist.html')) {
        loadWishlistProducts();
    } else {
        loadHearts();
    }

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

// اجعل الدوال متاحة عالمياً
window.toggleWishlist = toggleWishlist;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeImage = changeImage;