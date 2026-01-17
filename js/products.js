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

// إعداد معرض الصور لكل منتج – التصليح هنا فقط
function setupImageGallery(container, images, productId) {
    // نضيف ../ للرجوع للـ root من داخل /pages/
    productImages[productId] = images.map(img => '../' + img);

    const imgElement = container.querySelector('.product-image');
    imgElement.style.cursor = 'pointer';
    imgElement.onclick = () => openLightbox(productId, 0);
}

// باقي الكود (loadProducts وكل حاجة تانية) زي ما كان عندك بالضبط – لا تغيره
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
            filteredProducts.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                const productId = `product_${index}`;

                productCard.innerHTML = `
                    <div class="heart-icon" onclick="toggleWishlist(event, '${product.username}', '${product.product_name}', '${product.images[0]}', '${product.category}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                    <div class="image-gallery">
                        <img src="../${product.images[0]}" 
                             alt="${product.product_name}" 
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

                updateHeartState(productCard.querySelector('.heart-icon'), product.images[0]);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات في هذا القسم حالياً</div>';
    }
}

// باقي الكود (updateHeartState, updateAllHearts, DOMContentLoaded, أنيميشن) ابقيه زي ما هو عندك