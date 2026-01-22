// =======================
// المتغيرات العامة للـ Search
// =======================
window.searchPage = window.searchPage || {};
window.searchPage.currentProduct = null;
window.searchPage.currentIndex = 0;
window.searchPage.productImages = {};
window.searchPage.loadedImages = new Set();

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// =======================
// ✅ قاموس ترجمة الأقسام (عربي ⇄ إنجليزي)
// =======================
const categoryTranslations = {
    // كروشي
    'كروشي': ['crochet', 'كروشي', 'كروشيه', 'كروشية'],
    'كروشيه': ['crochet', 'كروشي', 'كروشيه', 'كروشية'],
    'كروشية': ['crochet', 'كروشي', 'كروشيه', 'كروشية'],
    'crochet': ['crochet', 'كروشي', 'كروشيه', 'كروشية'],
    
    // اكسسوارات
    'اكسسوارات': ['accessories', 'اكسسوارات', 'اكسسوار', 'حلي'],
    'اكسسوار': ['accessories', 'اكسسوارات', 'اكسسوار', 'حلي'],
    'حلي': ['accessories', 'اكسسوارات', 'اكسسوار', 'حلي'],
    'accessories': ['accessories', 'اكسسوارات', 'اكسسوار', 'حلي'],
    
    // تطريز
    'تطريز': ['embroidery', 'تطريز', 'تطريزات'],
    'تطريزات': ['embroidery', 'تطريز', 'تطريزات'],
    'embroidery': ['embroidery', 'تطريز', 'تطريزات'],
    
    // طباعة
    'طباعة': ['printing', 'طباعة', 'طباعه', 'طبع'],
    'طباعه': ['printing', 'طباعة', 'طباعه', 'طبع'],
    'طبع': ['printing', 'طباعة', 'طباعه', 'طبع'],
    'printing': ['printing', 'طباعة', 'طباعه', 'طبع'],
    
    // شموع
    'شموع': ['candles', 'شموع', 'شمع', 'شمعة'],
    'شمع': ['candles', 'شموع', 'شمع', 'شمعة'],
    'شمعة': ['candles', 'شموع', 'شمع', 'شمعة'],
    'candles': ['candles', 'شموع', 'شمع', 'شمعة'],
    
    // خرز
    'خرز': ['beads', 'خرز', 'خرزات'],
    'خرزات': ['beads', 'خرز', 'خرزات'],
    'beads': ['beads', 'خرز', 'خرزات'],
    
    // صابون
    'صابون': ['soap', 'صابون', 'صابونة'],
    'صابونة': ['soap', 'صابون', 'صابونة'],
    'soap': ['soap', 'صابون', 'صابونة'],
    
    // بوكسات هدايا
    'بوكسات': ['gift_boxes', 'gift boxes', 'بوكسات', 'بوكسات هدايا', 'هدايا', 'بوكس'],
    'بوكس': ['gift_boxes', 'gift boxes', 'بوكسات', 'بوكسات هدايا', 'هدايا', 'بوكس'],
    'هدايا': ['gift_boxes', 'gift boxes', 'بوكسات', 'بوكسات هدايا', 'هدايا', 'بوكس'],
    'gift_boxes': ['gift_boxes', 'gift boxes', 'بوكسات', 'بوكسات هدايا', 'هدايا', 'بوكس'],
    'gift boxes': ['gift_boxes', 'gift boxes', 'بوكسات', 'بوكسات هدايا', 'هدايا', 'بوكس'],
    
    // تنسيق حفلات
    'تنسيق': ['event_planning', 'event planning', 'تنسيق', 'تنسيق حفلات', 'حفلات'],
    'حفلات': ['event_planning', 'event planning', 'تنسيق', 'تنسيق حفلات', 'حفلات'],
    'event_planning': ['event_planning', 'event planning', 'تنسيق', 'تنسيق حفلات', 'حفلات'],
    'event planning': ['event_planning', 'event planning', 'تنسيق', 'تنسيق حفلات', 'حفلات'],
    
    // مكرمية
    'مكرمية': ['macrame', 'مكرمية', 'مكرميه'],
    'مكرميه': ['macrame', 'مكرمية', 'مكرميه'],
    'macrame': ['macrame', 'مكرمية', 'مكرميه'],
    
    // كونكريت
    'كونكريت': ['concrete', 'كونكريت', 'كونكريتي'],
    'كونكريتي': ['concrete', 'كونكريت', 'كونكريتي'],
    'concrete': ['concrete', 'كونكريت', 'كونكريتي'],
    
    // فن الورق
    'ورق': ['paper_art', 'paper art', 'ورق', 'فن الورق'],
    'فن الورق': ['paper_art', 'paper art', 'ورق', 'فن الورق'],
    'paper_art': ['paper_art', 'paper art', 'ورق', 'فن الورق'],
    'paper art': ['paper_art', 'paper art', 'ورق', 'فن الورق'],
    
    // مسمار و خيط
    'مسمار': ['string_art', 'string art', 'مسمار', 'مسمار و خيط', 'خيط'],
    'خيط': ['string_art', 'string art', 'مسمار', 'مسمار و خيط', 'خيط'],
    'string_art': ['string_art', 'string art', 'مسمار', 'مسمار و خيط', 'خيط'],
    'string art': ['string_art', 'string art', 'مسمار', 'مسمار و خيط', 'خيط'],
    
    // ريزن
    'ريزن': ['resin', 'ريزن', 'ريزين'],
    'ريزين': ['resin', 'ريزن', 'ريزين'],
    'resin': ['resin', 'ريزن', 'ريزين'],
    
    // ديكورات منزلية
    'ديكور': ['homedecor', 'home decor', 'ديكور', 'ديكورات', 'ديكورات منزلية'],
    'ديكورات': ['homedecor', 'home decor', 'ديكور', 'ديكورات', 'ديكورات منزلية'],
    'homedecor': ['homedecor', 'home decor', 'ديكور', 'ديكورات', 'ديكورات منزلية'],
    'home decor': ['homedecor', 'home decor', 'ديكور', 'ديكورات', 'ديكورات منزلية']
};

// =======================
// ✅ دالة البحث مع الترجمة التلقائية
// =======================
function getSearchVariants(searchTerm) {
    const lower = searchTerm.toLowerCase().trim();
    const variants = new Set([lower]);
    
    // ابحث في القاموس
    if (categoryTranslations[lower]) {
        categoryTranslations[lower].forEach(variant => {
            variants.add(variant.toLowerCase());
        });
    }
    
    // ابحث أيضاً عن الكلمات المشابهة
    for (const [key, values] of Object.entries(categoryTranslations)) {
        if (lower.includes(key) || key.includes(lower)) {
            values.forEach(variant => variants.add(variant.toLowerCase()));
        }
    }
    
    return Array.from(variants);
}

// =======================
// Preload Adjacent Images
// =======================
function preloadAdjacentImages(productKey, currentIdx) {
    const images = window.searchPage.productImages[productKey];
    if (!images || images.length <= 1) return;

    const nextIdx = (currentIdx + 1) % images.length;
    const prevIdx = (currentIdx - 1 + images.length) % images.length;

    const nextImg = new Image();
    nextImg.onload = () => window.searchPage.loadedImages.add(images[nextIdx]);
    nextImg.src = images[nextIdx];

    const prevImg = new Image();
    prevImg.onload = () => window.searchPage.loadedImages.add(images[prevIdx]);
    prevImg.src = images[prevIdx];
}

// =======================
// Lightbox Functions
// =======================
function search_openLightbox(productKey, index) {
    if (!window.searchPage.productImages[productKey]) {
        console.error('❌ Product not found:', productKey);
        return;
    }

    if (!window.searchPage.productImages[productKey][index]) {
        console.error('❌ Image not found at index:', index);
        return;
    }
    
    window.searchPage.currentProduct = productKey;
    window.searchPage.currentIndex = index;
    
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.querySelector('.lightbox .prev-btn');
    const nextBtn = document.querySelector('.lightbox .next-btn');
    
    if (!lightbox || !lightboxImg) {
        console.error('❌ Lightbox elements not found');
        return;
    }

    const images = window.searchPage.productImages[productKey];
    
    if (images.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    const newImageSrc = images[index];
    const isImageCached = window.searchPage.loadedImages.has(newImageSrc);

    lightbox.classList.add("show");

    if (isImageCached) {
        lightboxImg.src = newImageSrc;
        lightboxImg.style.opacity = '1';
    } else {
        let loadingOverlay = lightbox.querySelector('.loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            lightbox.appendChild(loadingOverlay);
        }

        lightboxImg.style.opacity = '0';
        loadingOverlay.classList.add('show');

        const tempImg = new Image();
        
        tempImg.onload = function() {
            window.searchPage.loadedImages.add(newImageSrc);
            
            lightboxImg.src = newImageSrc;
            lightboxImg.style.opacity = '1';
            
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 100);

            preloadAdjacentImages(productKey, index);
        };

        tempImg.onerror = function() {
            loadingOverlay.classList.remove('show');
            lightboxImg.style.opacity = '1';
            console.error('فشل تحميل الصورة');
        };

        tempImg.src = newImageSrc;
    }

    preloadAdjacentImages(productKey, index);
}

function search_closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const loadingOverlay = lightbox.querySelector('.loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
    
    lightbox.classList.remove("show");
}

function search_changeImage(direction) {
    if (!window.searchPage.productImages[window.searchPage.currentProduct]) {
        console.error('❌ Current product not found');
        return;
    }

    const imgs = window.searchPage.productImages[window.searchPage.currentProduct];
    
    if (imgs.length <= 1) return;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    if (!lightbox || !lightboxImg) return;

    const newIndex = (window.searchPage.currentIndex + direction + imgs.length) % imgs.length;
    const newImageSrc = imgs[newIndex];

    const isImageCached = window.searchPage.loadedImages.has(newImageSrc);

    if (isImageCached) {
        window.searchPage.currentIndex = newIndex;
        
        lightboxImg.style.animation = 'none';
        
        requestAnimationFrame(() => {
            if (direction === 1) {
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else {
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
            lightboxImg.src = newImageSrc;
            lightboxImg.style.opacity = '1';
        });

        preloadAdjacentImages(window.searchPage.currentProduct, newIndex);
    } else {
        let loadingOverlay = lightbox.querySelector('.loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            lightbox.appendChild(loadingOverlay);
        }

        loadingOverlay.classList.add('show');
        lightboxImg.style.opacity = '0';

        const tempImg = new Image();
        
        tempImg.onload = function() {
            window.searchPage.currentIndex = newIndex;
            window.searchPage.loadedImages.add(newImageSrc);
            
            loadingOverlay.classList.remove('show');
            
            lightboxImg.style.animation = 'none';
            
            requestAnimationFrame(() => {
                if (direction === 1) {
                    lightboxImg.style.animation = 'fadeSlide 0.4s ease';
                } else {
                    lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
                }
                lightboxImg.src = newImageSrc;
                lightboxImg.style.opacity = '1';
            });

            preloadAdjacentImages(window.searchPage.currentProduct, newIndex);
        };

        tempImg.onerror = function() {
            loadingOverlay.classList.remove('show');
            lightboxImg.style.opacity = '1';
            console.error('فشل تحميل الصورة');
        };

        tempImg.src = newImageSrc;
    }
}

// =======================
// Setup Image Gallery
// =======================
function search_setupImageGallery(container, images, productKey) {
    const processedImages = images.map(img => {
        return '../' + img;
    });

    console.log('✅ Processed images:', processedImages);
    
    window.searchPage.productImages[productKey] = processedImages;
    
    if (processedImages[0]) {
        const firstImg = new Image();
        firstImg.onload = () => window.searchPage.loadedImages.add(processedImages[0]);
        firstImg.src = processedImages[0];
    }
    
    const imgElement = container.querySelector('.product-image');
    if (imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.onclick = () => search_openLightbox(productKey, 0);
    }
}

// =======================
// Levenshtein Distance (محسنة للسرعة)
// =======================
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    if (a.length > b.length) {
        const tmp = a;
        a = b;
        b = tmp;
    }
    
    const row = Array(a.length + 1);
    
    for (let i = 0; i <= a.length; i++) {
        row[i] = i;
    }
    
    for (let i = 1; i <= b.length; i++) {
        let prev = i;
        
        for (let j = 1; j <= a.length; j++) {
            let val;
            if (b[i-1] === a[j-1]) {
                val = row[j-1];
            } else {
                val = Math.min(row[j-1] + 1, Math.min(prev + 1, row[j] + 1));
            }
            row[j-1] = prev;
            prev = val;
        }
        row[a.length] = prev;
    }
    
    return row[a.length];
}

// =======================
// تحمل الأخطاء الإملائية (مع تحسينات السرعة)
// =======================
function fuzzyMatch(text, searchTerm, maxDistance = 2) {
    text = text.toLowerCase();
    searchTerm = searchTerm.toLowerCase();
    
    if (text.includes(searchTerm)) return true;
    
    if (searchTerm.length < 3) return false;
    if (searchTerm.length > 15) return false;
    
    const words = text.split(/\s+/);
    
    for (const word of words) {
        if (word === searchTerm) return true;
        
        if (Math.abs(word.length - searchTerm.length) > maxDistance) {
            continue;
        }
        
        const distance = levenshtein(word, searchTerm);
        if (distance <= maxDistance) {
            return true;
        }
    }
    
    return false;
}

// =======================
// ✅ Search Products Function (مع الترجمة الذكية)
// =======================
async function searchProducts() {
    const searchTerm = getUrlParameter('search-term');
    const searchQuery = document.getElementById('searchQuery');
    const searchTitle = document.getElementById('searchTitle');
    const resultsCount = document.getElementById('resultsCount');
    const productsGrid = document.getElementById('productsGrid');

       if (searchTerm) {
        document.title = `بحث - ${searchTerm} | حرفجية`;
    } else {
        document.title = 'البحث | حرفجية';
    }

    if (!searchTerm) {
        if (searchTitle) searchTitle.textContent = 'البحث';
        if (searchQuery) searchQuery.textContent = 'الرجاء إدخال كلمة للبحث';
        if (productsGrid) productsGrid.innerHTML = '<div class="no-products">لم تقم بإدخال أي كلمة للبحث</div>';
        return;
    } 

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
        
        // ✅ الحصول على جميع الترجمات والمتغيرات
        const searchVariants = getSearchVariants(searchLower);
        
        console.log('🔍 البحث عن:', searchTerm);
        console.log('✅ المتغيرات:', searchVariants);

        // ✅ البحث في: الاسم، الوصف، اسم البائع، والقسم (مع الترجمة)
        const scoredResults = products.filter(product => {
            const productName = (product.product_name || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            const username = (product.username || '').toLowerCase();
            const category = (product.category || '').toLowerCase();

            // ابحث عن أي من المتغيرات في أي حقل
            return searchVariants.some(variant => 
                productName.includes(variant) ||
                description.includes(variant) ||
                username.includes(variant) ||
                category.includes(variant)
            );
        }).map(product => {
            const productName = (product.product_name || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            const username = (product.username || '').toLowerCase();
            const category = (product.category || '').toLowerCase();

            let score = 0;

            // ✅ البحث بجميع المتغيرات والترجمات
            searchVariants.forEach(variant => {
                // الأولوية للاسم
                if (productName === variant) score += 100;
                else if (productName.startsWith(variant)) score += 80;
                else if (productName.includes(variant)) score += 50;

                // ثم القسم
                if (category === variant) score += 70;
                else if (category.includes(variant)) score += 40;

                // ثم الوصف
                if (description.includes(variant)) score += 20;

                // وأخيراً اسم البائع
                if (username.includes(variant)) score += 10;

                const nameMatches = (productName.match(new RegExp(variant, 'g')) || []).length;
                const descMatches = (description.match(new RegExp(variant, 'g')) || []).length;
                const categoryMatches = (category.match(new RegExp(variant, 'g')) || []).length;
                
                score += (nameMatches * 5) + (descMatches * 2) + (categoryMatches * 3);
            });

            return { product, score };
        }).sort((a, b) => b.score - a.score);

        let exactResults = scoredResults;
        
        // ✅ إذا لم توجد نتائج، جرب البحث الضبابي (مع الترجمات)
        if (exactResults.length === 0) {
            exactResults = products.filter(product => {
                const productName = (product.product_name || '').toLowerCase();
                const description = (product.description || '').toLowerCase();
                const category = (product.category || '').toLowerCase();
                
                return searchVariants.some(variant =>
                    fuzzyMatch(productName, variant) || 
                    fuzzyMatch(description, variant) ||
                    fuzzyMatch(category, variant)
                );
            }).map(product => {
                return { product, score: 25 };
            });
        }

        const distributedResults = [];
        const userLastIndex = {};
        const maxConsecutive = 1;

        let remainingProducts = [...exactResults];
        let round = 0;

        while (remainingProducts.length > 0 && round < 100) {
            let addedInRound = false;

            for (let i = 0; i < remainingProducts.length; i++) {
                const item = remainingProducts[i];
                const username = item.product.username;
                const lastIdx = userLastIndex[username];

                const canAdd = lastIdx === undefined || 
                               (distributedResults.length - lastIdx) > maxConsecutive;

                if (canAdd) {
                    distributedResults.push(item.product);
                    userLastIndex[username] = distributedResults.length - 1;
                    remainingProducts.splice(i, 1);
                    addedInRound = true;
                    break;
                }
            }

            if (!addedInRound && remainingProducts.length > 0) {
                const item = remainingProducts.shift();
                distributedResults.push(item.product);
                userLastIndex[item.product.username] = distributedResults.length - 1;
            }

            round++;
        }

        const results = distributedResults;

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
                    const productKey = product.username + '_' + product.product_name + '_' + index;

                    const heartDiv = document.createElement('div');
                    heartDiv.className = 'heart-icon';
                    heartDiv.setAttribute('onclick', "toggleWishlist(event, '" + product.username + "', '" + product.product_name + "', '" + product.images[0] + "', '" + (product.category || '') + "')");
                    heartDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

                    const galleryDiv = document.createElement('div');
                    galleryDiv.className = 'image-gallery';
                    
                    const spinner = document.createElement('div');
                    spinner.className = 'product-spinner';
                    spinner.innerHTML = '<div class="spinner-circle"></div>';
                    galleryDiv.appendChild(spinner);
                    
                    const img = document.createElement('img');
                    img.dataset.src = '../' + product.images[0];
                    img.alt = product.product_name;
                    img.className = 'product-image lazy';
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23f8f8f8" width="300" height="300"/%3E%3C/svg%3E';
                    img.src = placeholder;
                    
                    img.onerror = function() { 
                        this.src = 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة'; 
                        this.style.opacity = '1';
                        const spinnerEl = this.parentElement.querySelector('.product-spinner');
                        if (spinnerEl) spinnerEl.style.display = 'none';
                    };
                    
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

                    search_setupImageGallery(galleryDiv, product.images, productKey);
                    updateHeartState(heartDiv, product.images[0]);
                });
                
                // تفعيل Lazy Loading الذكي
                initIntersectionObserver();
            }
        }
    } catch (error) {
        console.error('Error searching products:', error);
        if (resultsCount) resultsCount.textContent = '';
        if (productsGrid) productsGrid.innerHTML = '<div class="no-products">حدث خطأ في تحميل المنتجات</div>';
    }
}

// =======================
// ✅ Lazy Loading الذكي باستخدام Intersection Observer
// =======================
function initIntersectionObserver() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    if (!lazyImages.length) return;

    // إنشاء Observer يراقب الصور
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const realSrc = img.dataset.src;
                const spinner = img.parentElement?.querySelector('.product-spinner');
                
                // تحميل الصورة
                const tempImg = new Image();
                tempImg.onload = function() {
                    img.src = realSrc;
                    img.style.opacity = '1';
                    if (spinner) spinner.style.display = 'none';
                    img.classList.remove('lazy');
                };
                tempImg.onerror = function() {
                    img.src = 'https://dummyimage.com/300x300/ccc/fff&text=صورة+غير+متوفرة';
                    img.style.opacity = '1';
                    if (spinner) spinner.style.display = 'none';
                    img.classList.remove('lazy');
                };
                tempImg.src = realSrc;
                
                // إيقاف مراقبة هذه الصورة
                observer.unobserve(img);
            }
        });
    }, {
        // تحميل الصور قبل ظهورها بـ 400px (حوالي 1-2 صف من المنتجات)
        rootMargin: '400px 0px',
        threshold: 0.01
    });

    // مراقبة كل الصور
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// =======================
// Update Heart State
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
        const onclick = heart?.getAttribute('onclick');
        
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
// Initialize
// =======================
document.addEventListener('DOMContentLoaded', function() {
    searchProducts();
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
                search_closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                search_closeLightbox();
            }
        });
    }
    
    window.closeLightbox = search_closeLightbox;
    window.changeImage = search_changeImage;
}); 