import os
import json
import shutil

BASE_FOLDER = "users"
TEMP_FOLDER = "temp_images"
JSON_FILE = "products.json"

os.makedirs(BASE_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Load products JSON
if os.path.exists(JSON_FILE):
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        try:
            all_products = json.load(f)
            if not isinstance(all_products, list):
                all_products = []
        except:
            all_products = []
else:
    all_products = []

# User basic info
username = input("Enter username: ").strip()
bio = input("Enter profile bio: ").strip()

# Social links
facebook = input("Facebook link (or leave empty): ").strip()
whatsapp = input("WhatsApp link (or leave empty): ").strip()
instagram = input("Instagram link (or leave empty): ").strip()
tiktok = input("TikTok link (or leave empty): ").strip()

# Prepare paths
user_folder = os.path.join(BASE_FOLDER, username)
images_folder = os.path.join(user_folder, "images")
products_folder = os.path.join(user_folder, "products")

os.makedirs(user_folder, exist_ok=True)
os.makedirs(images_folder, exist_ok=True)
os.makedirs(products_folder, exist_ok=True)

# Function to check if file is image
def is_image(filename):
    return filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'))

# Function to get extension
def get_extension(filename):
    return os.path.splitext(filename)[1].lower()

# Ask for profile + cover
print("\n=== Upload Profile Images ===")
print("Place images in temp_images with the following names:")
print("  - profile.jpg (or .png or .jpeg)")
print("  - cover.jpg (or .png or .jpeg)")
print("Press Enter when done...")
input()

# Find profile and cover images
profile_found = None
cover_found = None

for fname in os.listdir(TEMP_FOLDER):
    if not is_image(fname):
        continue
    
    lower = fname.lower()
    name_without_ext = os.path.splitext(lower)[0]
    
    if name_without_ext == "profile":
        profile_found = fname
    elif name_without_ext == "cover":
        cover_found = fname

# Check if both found
if not profile_found:
    print("⚠️ Warning: profile image not found")
    proceed = input("Continue without profile? (yes/no): ").strip().lower()
    if proceed != "yes":
        exit()

if not cover_found:
    print("⚠️ Warning: cover image not found")
    proceed = input("Continue without cover? (yes/no): ").strip().lower()
    if proceed != "yes":
        exit()

# Move profile and cover
if profile_found:
    src = os.path.join(TEMP_FOLDER, profile_found)
    dst = os.path.join(images_folder, "profile.png")
    shutil.move(src, dst)
    print(f"✓ Moved {profile_found} to images/profile.png")

if cover_found:
    src = os.path.join(TEMP_FOLDER, cover_found)
    dst = os.path.join(images_folder, "cover.png")
    shutil.move(src, dst)
    print(f"✓ Moved {cover_found} to images/cover.png")

# Ask for product images
print("\n=== Upload Product Images ===")
print("Place product images in temp_images:")
print("  1-1.jpg, 1-2.png (product #1)")
print("  2-1.jpg (product #2)")
print("Press Enter when done...")
input()

grouped_images = {}
for fname in sorted(os.listdir(TEMP_FOLDER)):
    if not is_image(fname):
        continue
    
    parts = os.path.splitext(fname)[0].split("-")
    if len(parts) < 2:
        continue
    
    try:
        product_num = int(parts[0])
    except:
        continue
    
    grouped_images.setdefault(product_num, []).append(fname)

# Collect metadata
product_meta = {}

for product_num in sorted(grouped_images.keys()):
    print(f"\n=== Product {product_num} ({len(grouped_images[product_num])} images) ===")
    name = input("Product name: ").strip()
    description = input("Product description: ").strip()
    category = input("Category: ").strip()

    imgs_moved = []
    for img in grouped_images[product_num]:
        src = os.path.join(TEMP_FOLDER, img)
        dst = os.path.join(products_folder, img)
        shutil.move(src, dst)
        imgs_moved.append(f"users/{username}/products/{img}")
        print(f"  ✓ Moved {img}")

    product_meta[product_num] = {
        "product_name": name,
        "description": description,
        "category": category,
        "images": imgs_moved
    }

    all_products.append({
        "username": username,
        "product_name": name,
        "description": description,
        "category": category,
        "images": imgs_moved
    })

# Save JSON
with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(all_products, f, ensure_ascii=False, indent=4)

print(f"\n✓ Data saved to {JSON_FILE}")

# Build product cards
html_products_cards = []
for pnum in sorted(product_meta.keys()):
    meta = product_meta[pnum]
    first_img = os.path.basename(meta["images"][0]) if meta["images"] else "placeholder.png"

    card = f'''    <div class="product-card" data-category="{meta["category"]}">
        <div class="heart-icon" onclick="toggleWishlist(event, '{username}', '{meta["product_name"]}', 'users/{username}/products/{first_img}', '{meta["category"]}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </div>
        <img src="products/{first_img}" alt="{meta["product_name"]}" class="product-image">
        <div class="product-info">
            <h3>{meta["product_name"]}</h3>
            <p>{meta["description"]}</p>
        </div>
    </div>
    '''
    html_products_cards.append(card)

# Build JS product images
# Build JS product images
product_js_entries = []

for pnum in sorted(product_meta.keys()):
    meta = product_meta[pnum]
    
    if not meta["images"]:
        continue
        
    # الصورة الأولى فقط هي التي تُستخدم في الـ onclick وفي مفتاح المنتج
    first_img_basename = os.path.basename(meta["images"][0])
    first_img_path = f"products/{first_img_basename}"
    
    # المفتاح يبقى يعتمد على الصورة الأولى فقط (مهم للتوافق مع الكود الحالي)
    key = f"{username}|||{meta['product_name']}|||users/{username}/products/{first_img_basename}|||{meta['category']}"
    
    # هنا نضع كل الصور الخاصة بالمنتج في المصفوفة
    all_images_for_js = [f"products/{os.path.basename(img_path)}" for img_path in meta["images"]]
    
    # طريقة آمنة وصحيحة نحوياً
    product_js_entries.append(
        f'productImages[{json.dumps(key)}] = {json.dumps(all_images_for_js)};'
    )
# Build social HTML
social_html = ""

if facebook:
    social_html += f'''                    <a href="{facebook}" target="_blank">
                        <div class="icon facebook">
                            <img src="https://img.icons8.com/?size=100&id=118497&format=png&color=ffffff">
                            <span class="tooltip">Facebook</span>
                        </div>
                    </a>
'''

if whatsapp:
    social_html += f'''                    <a href="{whatsapp}" target="_blank">
                        <div class="icon whatsapp">
                            <img src="https://img.icons8.com/?size=100&id=16713&format=png&color=ffffff">
                            <span class="tooltip">WhatsApp</span>
                        </div>
                    </a>
'''

if instagram:
    social_html += f'''                    <a href="{instagram}" target="_blank">
                        <div class="icon instagram">
                            <img src="https://img.icons8.com/?size=100&id=BrU2BBoRXiWq&format=png&color=ffffff">
                            <span class="tooltip">Instagram</span>
                        </div>
                    </a>
'''

if tiktok:
    social_html += f'''                    <a href="{tiktok}" target="_blank">
                        <div class="icon tiktok">
                            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="tiktok">
                            <span class="tooltip">TikTok</span>
                        </div>
                    </a>
'''

# Generate HTML - نفس البروفايل بالضبط
html_template = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>{username} - الملف الشخصي</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="../../style/profile.css">
<link rel="stylesheet" href="../../style/header.css">
<link rel="icon" type="image/png" href="/images/tab-logo.png">

</head>

<body>

<header class="header">
    <div class="logo">
        <a href="../../pages/home.html" class="logo-link">
            <img src="../../images/logo.png" alt="Logo" style="height: 50px; width: auto;">
        </a>
    </div>
 
    <nav class="nav-center">
        <ul class="nav-list">
            <li><a href="../../pages/home.html">الرئيسية</a></li>
            <li><a href="../../pages/about.html">حول المنصة</a></li>
            <li><a href="../../pages/contact.html">تواصل معنا</a></li>
        </ul>
    </nav>
    
    <div class="search-icon-container">
        <button id="search-open-btn" class="search-btn" aria-label="Open search">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
        </button>
    </div>

    <div class="wishlist-icon-container">
        <a href="../../pages/wishlist.html" class="wishlist-link" aria-label="Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="wishlist-count" id="wishlist-count">0</span>
        </a>
    </div>

    <div class="hamburger" id="hamburger">
        <span></span>
        <span></span>
        <span></span>
    </div>

    <div id="search-popup" class="search-popup hidden">
        <div class="search-popup-content">
            <button id="search-close-btn" class="close-btn">✕</button>
            <form id="search-form" action="../../pages/search.html" method="get">
                <input type="text" name="search-term" id="search-popup-field" placeholder="ابحث عن منتج..." required autocomplete="off">
                <button type="submit" class="search-submit-btn">بحث</button>
            </form>
        </div>
    </div>
    
    <div class="mobile-menu" id="mobileMenu">
        <ul>
            <li><a href="../../pages/home.html">الرئيسية</a></li>
            <li><a href="../../pages/about.html">حول المنصة</a></li>
            <li><a href="../../pages/contact.html">تواصل معنا</a></li>
        </ul>
    </div>
</header>

<div class="profile-wrapper">
    <div class="profile-card">
        <div class="profile-cover-box">
            <img src="images/cover.png" alt="Cover">
        </div>

        <div class="profile-image-box">
            <img src="images/profile.png" alt="Profile">
        </div>

        <div class="profile-info-box">
            <div class="name-and-social">
                <h1>{username}</h1>
                <div class="social-icons">
{social_html}                </div>
            </div>
            <p>{bio}</p>
        </div>
    </div>

    <div class="products-container">
    
{''.join(html_products_cards)}
</div>
</div>

<div id="lightbox" class="lightbox">
    <button class="close-btn" onclick="closeLightbox()">×</button>
    <button class="prev" onclick="changeImage(-1)">&#10094;</button>
    <img id="lightbox-img">
    <button class="next" onclick="changeImage(1)">&#10095;</button>
</div>

<script>
// تعريف productImages قبل تحميل app.js - هذا مهم جداً!
window.productImages = window.productImages || {{}};

// إضافة صور المنتجات
{''.join(product_js_entries)}
// ربط الصور بالـ onclick
document.addEventListener('DOMContentLoaded', function() {{
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card) => {{
        const img = card.querySelector('.product-image');
        const heartIcon = card.querySelector('.heart-icon');
        
        if (!img || !heartIcon) return;
        
        const onclick = heartIcon.getAttribute('onclick');
        const match = onclick.match(/toggleWishlist\\(event,\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']+)',\\s*'([^']*)'\\)/);
        
        if (match) {{
            const [_, username, productName, image, category] = match;
            const productKey = `${{username}}|||${{productName}}|||${{image}}|||${{category}}`;
            
            if (productImages[productKey]) {{
                img.style.cursor = 'pointer';
                img.onclick = () => window.openLightbox(productKey, 0);
            }}
        }}
    }});
}});
</script>

<script src="../../js/app.js"></script>
<script src="../../js/search.js"></script>

</body>
</html>
"""

# Write HTML
with open(os.path.join(user_folder, "profile.html"), "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"\n✅ Profile created: {user_folder}/profile.html")
print(f"✅ Products: {len(product_meta)}")