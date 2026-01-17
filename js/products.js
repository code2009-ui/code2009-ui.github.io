// متغيرات اللايت بوكس
let currentIndex = 0;

// قراءة باراميتر من الرابط
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// إغلاق اللايت بوكس
function closeLightbox() {
    document.getElementById("lightbox").classList.remove("show");
}

// تغيير الصورة في اللايت بوكس
function changeImage(direction) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!lightbox._currentImages) return;
    
    lightbox._currentIndex = (lightbox._currentIndex + direction + lightbox._currentImages.length) % lightbox._currentImages.length;
    lightboxImg.src = lightbox._currentImages[lightbox._currentIndex];
}

// إعداد معرض الصور لكل منتج (الحل النهائي)
function setupImageGallery(container, images) {
    // المسار الصحيح: نرجع للـ root بـ ../ واحد فقط
    container._images = images.map(img => '../' + img);

    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            
            lightboxImg.src = container._images[0];
            lightbox.classList.add('show');
            
            lightbox._currentImages = container._images;
            lightbox._currentIndex = 0;
        };
    }
}

// تحميل المنتجات
async function loadProducts() {
    const category = getUrlParameter('category');
    const categoryTitle = document.getElementById('categoryTitle');
    const productsGrid = document.getElementById('productsGrid');

    if (category) {
        categoryTitle.textContent = decodeURIComponent(category);
    } else {
        categoryTitle.textContent = 'جميع المنتجات';
    }

    try {
        const response = await fetch('../products.json');
        const products = await response.json();

        let filteredProducts = products;
        if (category) {
            const decodedCategory = decodeURIComponent(category);
            filteredProducts = products.filter(product =>
                product.category && product.category.includes(decodedCategory)
            );
        }

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات في هذا القسم حالياً</div>';
        } else {
            productsGrid.innerHTML = '';
            filteredProducts.forEach((product) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                productCard.innerHTML = `
                    <div class="heart-icon" onclick="toggleWishlist(event, '${product.username.replace(/'/g, "\\'")}', '${product.product_name.replace(/'/g, "\\'")}', '${product.images[0]}', '${(product.category || '').replace(/'/g, "\\'")}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
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
                    product.images
                );

                updateHeartState(productCard.querySelector('.heart-icon'), product.images[0]);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<div class="no-products">خطأ في تحميل المنتجات</div>';
    }
}

// باقي الدوال (updateHeartState, updateAllHearts, DOMContentLoaded, أنيميشن) تبقى كما هي في كودك

// أنيميشن تغيير الصورة (احتفظ بيها كما هي)
document.addEventListener('DOMContentLoaded', function() {
    const lightboxImg = document.querySelector('#lightbox-img');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    function animateImageChange(direction) {
        lightboxImg.style.animation = 'none';
        setTimeout(() => {
            if (direction > 0) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
        }, 10);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => animateImageChange(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => animateImageChange(1));
});