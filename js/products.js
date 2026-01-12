// متغيرات اللايت بوكس
let currentProduct = null;
let currentIndex = 0;
let productImages = {};

console.log('🚀 Script loaded!');

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
    productImages[productId] = images;

    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => openLightbox(productId, 0);
    }
}

// تحميل المنتجات
async function loadProducts() {
    console.log('📦 loadProducts() called');
    
    const category = getUrlParameter('category');
    console.log('📂 Category from URL:', category);
    
    const categoryTitle = document.getElementById('categoryTitle');
    const productsGrid = document.getElementById('productsGrid');

    console.log('🎯 categoryTitle element:', categoryTitle);
    console.log('🎯 productsGrid element:', productsGrid);

    // تعيين عنوان الصفحة
    if (categoryTitle) {
        if (category) {
            categoryTitle.textContent = decodeURIComponent(category);
        } else {
            categoryTitle.textContent = 'جميع المنتجات';
        }
    }

    try {
        console.log('🔄 Fetching products.json...');
        
        // تحميل ملف JSON
        const response = await fetch('../products.json');
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('✅ Products loaded:', products.length, 'items');
        console.log('📦 First product:', products[0]);

        // فلترة المنتجات حسب الفئة
        let filteredProducts = products;
        if (category) {
            const decodedCategory = decodeURIComponent(category);
            console.log('🔍 Filtering by category:', decodedCategory);
            
            filteredProducts = products.filter(product => {
                const matches = product.category && 
                               product.category.toLowerCase().includes(decodedCategory.toLowerCase());
                console.log(`Product "${product.product_name}" category "${product.category}" matches:`, matches);
                return matches;
            });
        }

        console.log('✅ Filtered products:', filteredProducts.length);

        // عرض المنتجات
        if (filteredProducts.length === 0) {
            console.log('⚠️ No products found');
            productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات في هذا القسم حالياً</div>';
        } else {
            console.log('🎨 Rendering products...');
            productsGrid.innerHTML = '';
            
            filteredProducts.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                const productId = `product_${index}`;

                const productName = product.product_name && product.product_name.trim() 
                    ? product.product_name 
                    : 'منتج بدون اسم';

                const imagePath = product.images && product.images.length > 0 
                    ? '../' + product.images[0] 
                    : 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة';

                console.log(`Product ${index}: ${productName}, Image: ${imagePath}`);

                productCard.innerHTML = `
                    <div class="image-gallery">
                        <img src="${imagePath}" 
                             alt="${productName}" 
                             class="product-image"
                             onerror="this.src='https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${productName}</h3>
                        <p class="product-description">${product.description || ''}</p>
                        <div class="product-seller">
                            <a href="../users/${encodeURIComponent(product.username)}/profile.html" class="seller-link">
                                ${product.username || 'بائع'}
                            </a>
                        </div>
                    </div>
                `;

                productsGrid.appendChild(productCard);

                if (product.images && product.images.length > 0) {
                    setupImageGallery(
                        productCard.querySelector('.image-gallery'), 
                        product.images.map(img => '../' + img), 
                        productId
                    );
                }
            });
            
            console.log('✅ Products rendered successfully!');
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        console.error('Error details:', error.message);
        productsGrid.innerHTML = `<div class="no-products">حدث خطأ في تحميل المنتجات: ${error.message}</div>`;
    }
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOMContentLoaded fired!');
    
    // إعداد اللايت بوكس
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    // تحميل المنتجات
    console.log('🚀 Calling loadProducts()...');
    loadProducts();
});

// Animation للايت بوكس
const lightboxImg = document.querySelector('#lightbox-img');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

function animateImageChange(direction) {
    if (!lightboxImg) return;
    
    lightboxImg.style.animation = 'none';
    setTimeout(() => {
        if (direction === 'next') {
            lightboxImg.style.animation = 'fadeSlide 0.4s ease';
        } else {
            lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
        }
    }, 10);
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => animateImageChange('prev'));
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => animateImageChange('next'));
}