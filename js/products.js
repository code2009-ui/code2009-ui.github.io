// =======================
// المتغيرات العامة للـ Products (مختلفة عن app.js)
// =======================
window.productsPage = window.productsPage || {};
window.productsPage.currentProduct = null;
window.productsPage.currentIndex = 0;
window.productsPage.productImages = {};

// قراءة باراميتر من الرابط
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// =======================
// Lightbox للصور في صفحة Products
// =======================
function products_openLightbox(productKey, index) {
    if (!window.productsPage.productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!window.productsPage.productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }
    
    window.productsPage.currentProduct = productKey;
    window.productsPage.currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }
    
    lightboxImg.src = window.productsPage.productImages[productKey][index];
    lightbox.classList.add("show");
}

function products_closeLightbox() {
    document.getElementById("lightbox").classList.remove("show");
}

function products_changeImage(direction) {
    if (!window.productsPage.productImages[window.productsPage.currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = window.productsPage.productImages[window.productsPage.currentProduct];
    window.productsPage.currentIndex = (window.productsPage.currentIndex + direction + imgs.length) % imgs.length;
    
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightboxImg) {
        lightboxImg.src = imgs[window.productsPage.currentIndex];
    }
}

// =======================
// إعداد معرض الصور - نفس طريقة HTML
// =======================
function products_setupImageGallery(container, images, productKey) {
    const processedImages = images.map(img => {
        return '../' + img;
    });

    console.log('✅ Processed images:', processedImages);
    
    window.productsPage.productImages[productKey] = processedImages;
    
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => products_openLightbox(productKey, 0);
    }
}

// =======================
// تحميل المنتجات
// =======================
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
                const productKey = product.username + '_' + product.product_name + '_' + index;

                const heartDiv = document.createElement('div');
                heartDiv.className = 'heart-icon';
                heartDiv.setAttribute('onclick', "toggleWishlist(event, '" + product.username + "', '" + product.product_name + "', '" + product.images[0] + "', '" + product.category + "')");
                heartDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

                const galleryDiv = document.createElement('div');
                galleryDiv.className = 'image-gallery';
                const img = document.createElement('img');
                img.src = '../' + product.images[0];
                img.alt = product.product_name;
                img.className = 'product-image';
                img.onerror = function() { this.src = 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة'; };
                galleryDiv.appendChild(img);

                const infoDiv = document.createElement('div');
                infoDiv.className = 'product-info';
                
                const nameH3 = document.createElement('h3');
                nameH3.className = 'product-name';
                nameH3.textContent = product.product_name || 'منتج بدون اسم';
                
                const descP = document.createElement('p');
                descP.className = 'product-description';
                descP.textContent = product.description || '';
                
                const sellerDiv = document.createElement('div');
                sellerDiv.className = 'product-seller';
                const sellerLink = document.createElement('a');
                sellerLink.href = '../users/' + encodeURIComponent(product.username) + '/profile.html';
                sellerLink.className = 'seller-link';
                sellerLink.textContent = product.username;
                sellerDiv.appendChild(sellerLink);
                
                infoDiv.appendChild(nameH3);
                infoDiv.appendChild(descP);
                infoDiv.appendChild(sellerDiv);

                productCard.appendChild(heartDiv);
                productCard.appendChild(galleryDiv);
                productCard.appendChild(infoDiv);
                productsGrid.appendChild(productCard);

                products_setupImageGallery(galleryDiv, product.images, productKey);
                updateHeartState(heartDiv, product.images[0]);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<div class="no-products">حدث خطأ في تحميل المنتجات</div>';
    }
}

// =======================
// تحديث حالة القلب
// =======================
function updateHeartState(heartIcon, imagePath) {
    if (!heartIcon) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    const isInWishlist = wishlist.some(item => {
        const parts = item.split('|||');
        if (parts.length === 4) {
            const itemImage = parts[2];
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

function updateAllHearts() {
    const allCards = document.querySelectorAll('.product-card');
    allCards.forEach(card => {
        const heart = card.querySelector('.heart-icon');
        const onclick = heart.getAttribute('onclick');
        
        if (onclick) {
            const match = onclick.match(/toggleWishlist\(event,\s*'[^']*',\s*'[^']*',\s*'([^']*)'/);
            if (match) {
                const imagePath = match[1];
                updateHeartState(heart, imagePath);
            }
        }
    });
}

// =======================
// تشغيل عند تحميل الصفحة
// =======================
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setTimeout(updateAllHearts, 100);
    
    window.addEventListener('wishlistUpdated', updateAllHearts);
    window.addEventListener('storage', function(e) {
        if (e.key === 'wishlist') {
            updateAllHearts();
        }
    });
    
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                products_closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                products_closeLightbox();
            }
        });
    }
    
    window.closeLightbox = products_closeLightbox;
    window.changeImage = products_changeImage;
});

document.addEventListener('DOMContentLoaded', function() {
    const lightboxImg = document.querySelector('#lightbox-img');
    const originalChangeImage = window.changeImage;
    
    window.changeImage = function(direction) {
        lightboxImg.style.animation = 'none';
        setTimeout(() => {
            if (direction === 1) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else if (direction === -1) {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
        }, 10);
        
        if (originalChangeImage) {
            originalChangeImage(direction);
        }
    };
});