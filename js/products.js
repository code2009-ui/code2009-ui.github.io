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

function setupImageGallery(container, images, productId) {
    // المسار المطلق من root الموقع (صحيح لـ GitHub Pages)
    productImages[productId] = images.map(img => 
        `https://code2009-ui.github.io/${img}`
    );

    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => openLightbox(productId, 0);
    }
}

// تحميل المنتجات
async function loadProducts() {
    const category = getUrlParameter('category');
    const categoryTitle = document.getElementById('categoryTitle');
    const productsGrid = document.getElementById('productsGrid');

    // تعيين عنوان الصفحة
    if (category) {
        categoryTitle.textContent = decodeURIComponent(category);
    } else {
        categoryTitle.textContent = 'جميع المنتجات';
    }

    try {
        // تحميل ملف JSON
        const response = await fetch('../products.json');
        const products = await response.json();

        // فلترة المنتجات حسب الفئة
        let filteredProducts = products;
        if (category) {
            const decodedCategory = decodeURIComponent(category);
            filteredProducts = products.filter(product =>
                product.category && product.category.includes(decodedCategory)
            );
        }

        // عرض المنتجات
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات في هذا القسم حالياً</div>';
        } else {
            productsGrid.innerHTML = '';
            filteredProducts.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                const productId = `product_${index}`;

                // بناء HTML للمنتج مع القلب
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

                // إعداد معرض الصور
                setupImageGallery(
                    productCard.querySelector('.image-gallery'), 
                    product.images, 
                    productId
                );

                // تحديث حالة القلب بناءً على المفضلة
                updateHeartState(productCard.querySelector('.heart-icon'), product.images[0]);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<div class="no-products">لا توجد منتجات في هذا القسم حالياً</div>';
    }
}

// تحديث حالة القلب
function updateHeartState(heartIcon, imagePath) {
    if (!heartIcon) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // البحث عن المنتج في المفضلة بالمسار الصحيح
    const isInWishlist = wishlist.some(item => {
        const parts = item.split('|||');
        if (parts.length === 4) {
            const itemImage = parts[2]; // الصورة هي الجزء الثالث
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

// تحديث جميع القلوب في الصفحة
function updateAllHearts() {
    const allCards = document.querySelectorAll('.product-card');
    allCards.forEach(card => {
        const heart = card.querySelector('.heart-icon');
        const onclick = heart.getAttribute('onclick');
        
        if (onclick) {
            // استخراج مسار الصورة من الـ onclick
            const match = onclick.match(/toggleWishlist\(event,\s*'[^']*',\s*'[^']*',\s*'([^']*)'/);
            if (match) {
                const imagePath = match[1];
                updateHeartState(heart, imagePath);
            }
        }
    });
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إعداد اللايت بوكس
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        // إغلاق عند الضغط خارج الصورة
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // إغلاق بزر ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    // تحميل المنتجات
    loadProducts();

    // بعد تحميل المنتجات، انتظر شوية وحدّث القلوب
    setTimeout(updateAllHearts, 100);

    // الاستماع لتحديثات المفضلة
    window.addEventListener('wishlistUpdated', updateAllHearts);
    
    // الاستماع لتغييرات localStorage من تابات أخرى
    window.addEventListener('storage', function(e) {
        if (e.key === 'wishlist') {
            updateAllHearts();
        }
    });
});

// أنيميشن تغيير الصورة
document.addEventListener('DOMContentLoaded', function() {
    const lightboxImg = document.querySelector('#lightbox-img');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    function animateImageChange(direction) {
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
});