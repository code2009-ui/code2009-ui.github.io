// =======================
// المتغيرات العامة
// =======================
let wishlist_currentProduct = null;
let wishlist_currentIndex = 0;
let wishlist_productImages = {};

console.log('🎯 Wishlist.js loaded!');

// =======================
// المفضلة (Wishlist)
// =======================

// الحصول على المفضلة من localStorage
function getFavorites() {
    try {
        const data = localStorage.getItem('wishlist');
        console.log('📦 Raw localStorage data:', data);
        const favorites = JSON.parse(data || '[]');
        console.log('✅ Parsed favorites:', favorites);
        return favorites;
    } catch (e) {
        console.error('❌ Error reading favorites:', e);
        return [];
    }
}

// حفظ المفضلة في localStorage
function saveFavorites(favorites) {
    try {
        const stringified = JSON.stringify(favorites);
        localStorage.setItem('wishlist', stringified);
        console.log('💾 Saved favorites:', favorites);
        console.log('💾 Stringified:', stringified);
    } catch (e) {
        console.error('❌ Error saving favorites:', e);
    }
}

// التحقق إذا كان المنتج في المفضلة
function isFavorite(productId) {
    const favorites = getFavorites();
    const result = favorites.includes(productId);
    console.log(`🔍 Is "${productId}" favorite?`, result);
    return result;
}

// الدالة التي يستدعيها HTML عند الضغط على القلب
function toggleWishlist(event, username, productName, image, category) {
    console.log('💗 toggleWishlist called with:', { username, productName, image, category });
    
    event.stopPropagation();
    event.preventDefault();
    
    const element = event.currentTarget;
    
    // إنشاء معرف فريد للمنتج
    const productId = `${username}|||${productName}|||${image}|||${category}`;
    console.log('🆔 Product ID:', productId);
    
    toggleFavorite(element, productId);
}

// إضافة أو إزالة من المفضلة
function toggleFavorite(element, productId) {
    console.log('🔄 toggleFavorite called for:', productId);
    
    let favorites = getFavorites();
    console.log('📋 Current favorites:', favorites);

    // إضافة animation
    element.classList.add('animating');
    setTimeout(() => element.classList.remove('animating'), 600);

    if (favorites.includes(productId)) {
        // إزالة من المفضلة
        favorites = favorites.filter(id => id !== productId);
        element.classList.remove('active');
        console.log('➖ Removed from favorites');
    } else {
        // إضافة للمفضلة
        favorites.push(productId);
        element.classList.add('active');
        console.log('➕ Added to favorites');
    }

    saveFavorites(favorites);
    updateWishlistCount();

    // إعادة تحميل صفحة المفضلة إذا كانت مفتوحة
    if (window.location.pathname.includes('wishlist.html')) {
        console.log('🔄 Reloading wishlist page...');
        loadWishlistProducts();
    }
}

// تحديث عداد المفضلة في الهيدر
function updateWishlistCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('wishlist-count');
    
    console.log('🔢 Updating count. Favorites:', favorites.length);
    
    if (!countElement) {
        console.warn('⚠️ wishlist-count element not found');
        return;
    }

    countElement.textContent = favorites.length;
    countElement.style.display = favorites.length > 0 ? 'flex' : 'none';
    
    console.log('✅ Count updated to:', favorites.length);
}

// =======================
// Lightbox للصور
// =======================

function openLightbox(productId, index) {
    console.log('🖼️ Opening lightbox:', productId, index);
    wishlist_currentProduct = productId;
    wishlist_currentIndex = index;
    const imgSrc = wishlist_productImages[productId][index];
    document.getElementById("lightbox-img").src = imgSrc;
    document.getElementById("lightbox").classList.add("show");
}

function closeLightbox() {
    console.log('❌ Closing lightbox');
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
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => openLightbox(productId, 0);
    }
}

// =======================
// تحميل وعرض المنتجات في المفضلة
// =======================
async function loadWishlistProducts() {
    console.log('📥 Loading wishlist products...');
    
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistTitle = document.getElementById('wishlistTitle');
    const wishlistCount = document.getElementById('wishlistCount');
    const favorites = getFavorites();

    console.log('💝 Current favorites:', favorites);

    if (wishlistTitle) wishlistTitle.textContent = 'المفضلة';

    if (favorites.length === 0) {
        console.log('📭 No favorites found');
        wishlistGrid.innerHTML = '<div class="no-products">لم تقم بإضافة أي منتجات للمفضلة بعد</div>';
        if (wishlistCount) wishlistCount.textContent = '';
        return;
    }

    try {
        console.log('🌐 Fetching products.json...');
        const response = await fetch('../products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const allProducts = await response.json();
        console.log('✅ Products loaded:', allProducts.length);
        
        const wishlistProducts = [];

        // البحث عن المنتجات المفضلة
        favorites.forEach(favId => {
            console.log('🔍 Looking for product:', favId);
            
            const parts = favId.split('|||');
            if (parts.length !== 4) {
                console.warn('⚠️ Invalid product ID format:', favId);
                return;
            }
            
            const [username, productName, image, category] = parts;
            
            for (let product of allProducts) {
                // مطابقة المنتج
                const matches = 
                    product.username === username &&
                    product.product_name === productName &&
                    product.images[0] === image &&
                    product.category === category;
                
                if (matches) {
                    console.log('✅ Found matching product:', product.product_name);
                    wishlistProducts.push({ ...product, productId: favId });
                    break;
                }
            }
        });

        console.log('📊 Wishlist products found:', wishlistProducts.length);

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

        console.log('✅ Wishlist rendered successfully!');

    } catch (e) {
        console.error('❌ Error loading wishlist:', e);
        wishlistGrid.innerHTML = '<div class="no-products">خطأ في تحميل المفضلة</div>';
    }
}

// =======================
// تحميل حالة القلوب في صفحات البروفايل
// =======================
function loadHearts() {
    console.log('💗 Loading hearts state...');
    
    const favorites = getFavorites();
    console.log('📋 Favorites for hearts:', favorites);
    
    const hearts = document.querySelectorAll('.heart-icon');
    console.log('💗 Found hearts:', hearts.length);
    
    hearts.forEach((heart, index) => {
        const onclick = heart.getAttribute('onclick');
        if (!onclick) {
            console.warn(`⚠️ Heart ${index} has no onclick`);
            return;
        }
        
        // استخراج المعلومات من onclick
        const match = onclick.match(/toggleWishlist\(event,\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'\)/);
        
        if (match) {
            const [_, username, productName, image, category] = match;
            const productId = `${username}|||${productName}|||${image}|||${category}`;
            
            console.log(`💗 Heart ${index} ID:`, productId);
            
            if (favorites.includes(productId)) {
                heart.classList.add('active');
                console.log(`✅ Heart ${index} set to active`);
            }
        } else {
            console.warn(`⚠️ Heart ${index} onclick doesn't match pattern:`, onclick);
        }
    });
}

// =======================
// عند تحميل الصفحة
// =======================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM Content Loaded!');
    console.log('📍 Current path:', window.location.pathname);
    
    updateWishlistCount();

    if (window.location.pathname.includes('wishlist.html')) {
        console.log('📄 Wishlist page detected, loading products...');
        loadWishlistProducts();
    } else {
        console.log('📄 Profile/other page detected, loading hearts...');
        loadHearts();
    }

    // إعداد Lightbox
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

console.log('✅ Wishlist.js initialized!');