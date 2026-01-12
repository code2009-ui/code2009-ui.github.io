// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchOpenBtn = document.getElementById('search-open-btn');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchPopup = document.getElementById('search-popup');
    const searchForm = document.getElementById('search-form');
    const searchField = document.getElementById('search-popup-field');

    // Open search popup
    if (searchOpenBtn) {
        searchOpenBtn.addEventListener('click', function() {
            searchPopup.classList.remove('hidden');
            searchPopup.classList.add('visible');
            setTimeout(() => {
                if (searchField) searchField.focus();
            }, 100);
        });
    }

    // Close search popup
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', function() {
            searchPopup.classList.remove('visible');
            searchPopup.classList.add('hidden');
        });
    }

    // Close popup when clicking outside
    if (searchPopup) {
        searchPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
                this.classList.add('hidden');
            }
        });
    }

    // Prevent form submission from closing popup
    if (searchForm) {
        searchForm.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// Lightbox Animation - FIXED for both directions
document.addEventListener('DOMContentLoaded', function() {
    const lightboxImg = document.querySelector('#lightbox-img');
    
    // حفظ الدالة الأصلية
    const originalChangeImage = window.changeImage;
    
    // استبدال الدالة بنسخة جديدة مع الأنيميشن
    window.changeImage = function(direction) {
        // إزالة الأنيميشن الحالي
        lightboxImg.style.animation = 'none';
        
        // تطبيق الأنيميشن الجديد بعد delay صغير
        setTimeout(() => {
            if (direction === 1) { 
                // السهم الأيمن - next
                lightboxImg.style.animation = 'fadeSlide 0.4s ease';
            } else if (direction === -1) { 
                // السهم الأيسر - prev
                lightboxImg.style.animation = 'fadeSlideReverse 0.4s ease';
            }
        }, 10);
        
        // تنفيذ الدالة الأصلية لتغيير الصورة
        if (originalChangeImage) {
            originalChangeImage(direction);
        }
    };
});