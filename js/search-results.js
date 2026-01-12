// متغيرات اللايت بوكس
let currentProduct = null;
let currentIndex = 0;
let productImages = {};

// قراءة باراميتر من الرابط
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// فتح اللايت بوكس
function openLightbox(productId, index) {
    currentProduct = productId;
    currentIndex = index;
    const src = productImages[productId][index];
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox").classList.add("show");
}

// إغلاق اللايت بوكس
function closeLightbox() {
    document.getElementById("lightbox").classList.remove("show");
}

// تغيير الصورة في اللايت بوكس
function changeImage(direction) {
    const imgs = productImages[currentProduct];
    currentIndex = (currentIndex + direction + imgs.length) % imgs.length;
    document.getElementById("lightbox-img").src = imgs[currentIndex];
}

// إعداد معرض الصور لكل منتج
function setupImageGallery(container, images, productId) {
    productImages[productId] = images.map(img => '../' + img);
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => openLightbox(productId, 0);
    }
}

// البحث في المنتجات
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

                    const productId = `product_${index}`;

                    productCard.innerHTML = `
                        <div class="image-gallery">
                            <img src="../${product.images[0]}" 
                                alt="${product.product_name || 'منتج'}" 
                                class="product-image"
                                onerror="this.src='https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة'">
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.product_name || 'منتج بدون اسم'}</h3>
                            <p class="product-description">${product.description || ''}</p>
                            
                            <div class="product-seller">
                                <a href="../users/${encodeURIComponent(product.username)}/profile.html" class="seller-link">
                                    ${product.username}
                                </a>
                            </div>
                        </div>
                    `;

                    productsGrid.appendChild(productCard);

                    setupImageGallery(
                        productCard.querySelector('.image-gallery'),
                        product.images,
                        productId
                    );
                });
            }
        }
    } catch (error) {
        console.error('Error searching products:', error);
        if (resultsCount) resultsCount.textContent = '';
        if (productsGrid) productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات تطابق بحثك. حاول استخدام كلمات مختلفة.</div>';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    if (window.location.pathname.includes('search.html')) {
        searchProducts();
    }
});