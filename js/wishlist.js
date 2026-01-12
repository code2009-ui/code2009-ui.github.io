// =======================
// المتغيرات العامة
// =======================
let wishlist_currentProduct = null;
let wishlist_currentIndex = 0;
let wishlist_productImages = {};

// =======================
// المفضلة (Wishlist)
// =======================

// الحصول على المفضلة من localStorage
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
        return [];
    }
}

// حفظ المفضلة في localStorage
function saveFavorites(favorites) {
    localStorage.setItem('wishlist', JSON.stringify(favorites));
}

// التحقق إذا كان المنتج في المفضلة
function isFavorite(productId) {
    return getFavorites().includes(productId);
}

// الدالة التي يستدعيها HTML عند الضغط على القلب
function toggleWishlist(event, username, productName, image, description) {
    event.stopPropagation();
    const element = event.currentTarget;
    const productId = `${username}-${productName}-${image}-${description}`;
    toggleFavorite(element, productId);
}

// إضافة أو إزالة من المفضلة
function toggleFavorite(element, productId) {
    let favorites = getFavorites();

    element.classList.add('animating');
    setTimeout(() => element.classList.remove('animating'), 600);

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        element.classList.remove('active');
    } else {
        favorites.push(productId);
        element.classList.add('active');
    }

    saveFavorites(favorites);
    updateWishlistCount();

    // إعادة تحميل صفحة المفضلة إذا كانت مفتوحة
    if (window.location.pathname.includes('wishlist.html')) {
        loadWishlistProducts();
    }
}

// تحديث عداد المفضلة في الهيدر
function updateWishlistCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('wishlist-count');
    if (!countElement) return;

    countElement.textContent = favorites.length;
    countElement.style.display = favorites.length ? 'flex' : 'none';
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

// إعداد معرض الصور لكل منتج
function setupImageGallery(container, images, productId) {
    wishlist_productImages[productId] = images;
    const imgElement = container.querySelector('.product-image');
    if (imgElement) imgElement.onclick = () => openLightbox(productId, 0);
}

// =======================
// تحميل وعرض المنتجات في المفضلة
// =======================
async function loadWishlistProducts() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistTitle = document.getElementById('wishlistTitle');
    const subtitle = document.querySelector('.wishlist-subtitle');
    const favorites = getFavorites();

    if (subtitle) subtitle.style.display = 'none';
    if (wishlistTitle) wishlistTitle.textContent = 'المفضلة';

    if (favorites.length === 0) {
        wishlistGrid.innerHTML = '<div class="no-products">لم تقم بإضافة أي منتجات للمفضلة بعد</div>';
        return;
    }

    try {
        const response = await fetch('../products.json');
        const allProducts = await response.json();
        const wishlistProducts = [];

        favorites.forEach(favId => {
            for (let product of allProducts) {
                const pid = `${product.username}-${product.product_name}-${product.images[0]}-${product.description || ''}`;
                if (pid === favId) {
                    wishlistProducts.push({ ...product, productId: favId });
                    break;
                }
            }
        });

        if (!wishlistProducts.length) {
            wishlistGrid.innerHTML = '<div class="no-products">المنتجات المحفوظة غير متوفرة</div>';
            return;
        }

        wishlistGrid.innerHTML = '';

        wishlistProducts.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const displayId = `wishlist_${index}`;

            // تأكد من الصور
            const imagesArray = (product.images && product.images.length) ? product.images : ['https://dummyimage.com/300x300/ccc/fff&text=No+Image'];
            const firstImage = imagesArray[0].startsWith('../') ? imagesArray[0] : '../' + imagesArray[0];

            card.innerHTML = `
                <div class="heart-icon ${isFavorite(product.productId) ? 'active' : ''}" 
                     onclick="toggleWishlist(event, '${product.username}', '${product.product_name}', '${firstImage}', '${product.description || ''}')">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div class="image-gallery">
                    <img src="${firstImage}" class="product-image"
                         onerror="this.src='https://dummyimage.com/300x300/ccc/fff&text=No+Image'">
                </div>
                <div class="product-info">
                    <h3>${product.product_name}</h3>
                    <p>${product.description || ''}</p>
                </div>
            `;

            wishlistGrid.appendChild(card);
            setupImageGallery(card.querySelector('.image-gallery'), imagesArray.map(img => img.startsWith('../') ? img : '../' + img), displayId);
        });

    } catch (e) {
        wishlistGrid.innerHTML = '<div class="no-products">خطأ في تحميل المفضلة</div>';
    }
}

// =======================
// تحميل حالة القلوب
// =======================
function loadHearts() {
    const favorites = getFavorites();
    document.querySelectorAll('.heart-icon').forEach(heart => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) return;
        const match = onclick.match(/'([^']+)'/);
        if (match && favorites.includes(match[1])) {
            heart.classList.add('active');
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

// اجعل الدالة toggleWishlist متاحة عالميًا للـ HTML
window.toggleWishlist = toggleWishlist;

