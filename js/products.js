// متغيرات اللايت بوكس
let currentIndex = 0;

// إغلاق اللايت بوكس
function closeLightbox() {
    document.getElementById("lightbox").classList.remove("show");
}

// تغيير الصورة
function changeImage(direction) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!lightbox._images) return;
    
    currentIndex = (currentIndex + direction + lightbox._images.length) % lightbox._images.length;
    lightboxImg.src = lightbox._images[currentIndex];
}

// إعداد الصور لكل كارت (بدون id)
function setupImageGallery(container, images) {
    // المسار الصحيح: ../ للرجوع للـ root
    const correctImages = images.map(img => '../' + img);

    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            
            lightboxImg.src = correctImages[0];
            lightbox.classList.add('show');
            
            lightbox._images = correctImages;
            currentIndex = 0;
        };
    }
}

// تحميل المنتجات (كما هو عندك)
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
            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

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

                setupImageGallery(productCard.querySelector('.image-gallery'), product.images);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// باقي الكود (الـ DOMContentLoaded والأنيميشن والقلوب) خليه زي ما كان