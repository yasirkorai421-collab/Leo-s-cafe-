# Photo Replacement Guide - Leo's Café

This document lists all stock photos currently used in the Leo's Café website and provides guidance for replacing them with real photos of your food and café.

**Priority Order:**
1. Hero carousel slides (homepage first impression)
2. Menu item thumbnails (shows actual dishes)
3. About section collage (interior/kitchen)
4. Footer Instagram grid
5. Page hero banners

---

## 📸 PRIORITY 1: Hero Carousel (Homepage)

**Location:** `components/HeroCarousel.tsx`

### Current Stock Photos:
1. **Slide 1 - Pizza**
   - Current: `https://images.unsplash.com/photo-1513104890138-7c749659a591`
   - Replace with: Photo of Leo's Special Pizza or most popular pizza
   - Recommended size: 1920x1080px (landscape)
   
2. **Slide 2 - Burger**
   - Current: `https://images.unsplash.com/photo-1568901346375-23c9450c58cd`
   - Replace with: Photo of Zinger Burger or signature burger
   - Recommended size: 1920x1080px (landscape)
   
3. **Slide 3 - Interior**
   - Current: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4`
   - Replace with: Photo of Leo's Café dining area or counter
   - Recommended size: 1920x1080px (landscape)

---

## 🍕 PRIORITY 2: Menu Items

**Location:** `lib/menu-data.ts`

### Pizza Category (10 items):
1. **Leo's Special Pizza**
   - Current: `photo-1513104890138-7c749659a591`
   - Replace with: Your actual Leo's Special Pizza
   
2. **Café Special Pizza**
   - Current: `photo-1574071318508-1cdbab80d002`
   - Replace with: Your Café Special Pizza
   
3. **Malai Boti Pizza**
   - Current: `photo-1565299624946-b28f40a0ae38`
   - Replace with: Your Malai Boti Pizza
   
4. **Labistro Pizza**
   - Current: `photo-1571997478779-2adcbbe9ab2f`
   - Replace with: Your Labistro Pizza
   
5. **Shahi Pizza**
   - Current: `photo-1534308983496-4fabb1a015ee`
   - Replace with: Your Shahi Pizza
   
6. **Kabab Crust Pizza**
   - Current: `photo-1628840042765-356cda07504e`
   - Replace with: Your Kabab Crust Pizza
   
7. **Mexican Achaari Pizza**
   - Current: `photo-1593560708920-61dd98c46a4e`
   - Replace with: Your Mexican Achaari Pizza
   
8. **Lemon Chicken Pizza**
   - Current: `photo-1574071318508-1cdbab80d002`
   - Replace with: Your Lemon Chicken Pizza
   
9. **Bell Pepper Sauce Pizza**
   - Current: `photo-1565299624946-b28f40a0ae38`
   - Replace with: Your Bell Pepper Sauce Pizza
   
10. **Peri Peri Chicken Pizza**
    - Current: `photo-1571997478779-2adcbbe9ab2f`
    - Replace with: Your Peri Peri Chicken Pizza

### Burgers & Rolls Category (11 items):
1. **Zinger Burger** (Customer Favourite)
   - Current: `photo-1568901346375-23c9450c58cd`
   - Replace with: Your Zinger Burger
   
2. **Grilled Sandwich**
   - Current: `photo-1528735602780-2552fd46c7af`
   - Replace with: Your Grilled Sandwich
   
3. **Chicken Shawarma**
   - Current: `photo-1529006557810-274b9b2fc783`
   - Replace with: Your Chicken Shawarma
   
4. **Fries with Mayo Sauce**
   - Current: `photo-1573080496219-bb080dd4f877`
   - Replace with: Your Fries
   
5. **Tikka Roll**
   - Current: `photo-1626645738196-c2a7c87a8f58`
   - Replace with: Your Tikka Roll
   
6. **Twister Roll**
   - Current: `photo-1623855244339-90fc0b0bbbca`
   - Replace with: Your Twister Roll
   
7. **Chicken Chappli Kebab Roll**
   - Current: `photo-1601050690597-df0568f70950`
   - Replace with: Your Chappli Kebab Roll
   
8. **Chicken Patty Roll**
   - Current: `photo-1639024471283-03518883512d`
   - Replace with: Your Chicken Patty Roll
   
9. **Tamboora Roll**
   - Current: `photo-1630383249896-424e482df921`
   - Replace with: Your Tamboora Roll
   
10. **Shahi Roll**
    - Current: `photo-1626074353765-517a681e40be`
    - Replace with: Your Shahi Roll
    
11. **Seekh Kebab Roll**
    - Current: `photo-1601050690597-df0568f70950`
    - Replace with: Your Seekh Kebab Roll

### Mains & Pasta Category (4 items):
1. **Chicken Alfredo Pasta**
   - Current: `photo-1645112411341-6c4fd023714a`
   - Replace with: Your Chicken Alfredo Pasta
   
2. **Creamy Chicken Steak**
   - Current: `photo-1600891964092-4316c288032e`
   - Replace with: Your Chicken Steak
   
3. **Grilled Chicken with Rice**
   - Current: `photo-1598103442097-8b74394b95c6`
   - Replace with: Your Grilled Chicken with Rice
   
4. **Lemon Chicken**
   - Current: `photo-1594221708779-94832f4320d1`
   - Replace with: Your Lemon Chicken

### Drinks Category (4 items):
1. **Hot Coffee**
   - Current: `photo-1509042239860-f550ce710b93`
   - Replace with: Your Hot Coffee
   
2. **Cold Coffee**
   - Current: `photo-1517487881594-2787fef5ebf7`
   - Replace with: Your Cold Coffee
   
3. **Mint Margarita**
   - Current: `photo-1551538827-9c037cb4f32a`
   - Replace with: Your Mint Margarita
   
4. **Fresh Juices**
   - Current: `photo-1600271886742-f049cd451bba`
   - Replace with: Your Fresh Juice selection

### Desserts Category (3 items):
1. **Molten Lava Cake**
   - Current: `photo-1606313564200-e75d5e30476c`
   - Replace with: Your Molten Lava Cake
   
2. **Chocolate Brownie + Ice Cream**
   - Current: `photo-1564355808539-22fda35bed7e`
   - Replace with: Your Brownie with Ice Cream
   
3. **Cakes & Bakery Items**
   - Current: `photo-1578985545062-69928b1d9587`
   - Replace with: Photo of your bakery display case

---

## 🏠 PRIORITY 3: About Section Collage

**Location:** `app/page.tsx` (lines 80-95)

1. **Left Image - Pizza**
   - Current: `photo-1513104890138-7c749659a591`
   - Replace with: Photo from inside Leo's Café kitchen or pizza oven
   - Recommended size: 800x1200px (portrait)

2. **Right Image - Burger**
   - Current: `photo-1565299624946-b28f40a0ae38`
   - Replace with: Photo of dining area or food preparation
   - Recommended size: 800x1200px (portrait)

**Location:** `app/about/page.tsx` (lines 60-85)

1. **Left Image - Interior**
   - Current: `photo-1517248135467-4c7edcad34c4`
   - Replace with: Leo's Café exterior or signage
   - Recommended size: 800x1200px (portrait)

2. **Right Image - Kitchen**
   - Current: `photo-1556155092-490a1ba16284`
   - Replace with: Kitchen in action or staff preparing food
   - Recommended size: 800x1200px (portrait)

---

## 📱 PRIORITY 4: Footer Instagram Grid

**Location:** `components/Footer.tsx`

Currently shows 6 different food photos. Replace with actual photos from your Instagram (@Leo450.1):

1. Pizza photo
2. Burger photo
3. Pizza slice photo
4. Shawarma photo
5. Dessert photo
6. Drink photo

**How to update:** Replace the URLs in the array at line 58 of Footer.tsx

---

## 🎯 PRIORITY 5: Page Hero Banners

### Menu Page
**Location:** `app/menu/page.tsx` (line 19)
- Current: `photo-1513104890138-7c749659a591`
- Replace with: Wide shot of multiple menu items or Leo's Café signage
- Recommended size: 1920x800px (landscape)

### Contact Page
**Location:** `app/contact/page.tsx` (line 37)
- Current: `photo-1414235077428-338988a2e8c0`
- Replace with: Leo's Café exterior or contact/counter area
- Recommended size: 1920x800px (landscape)

### Reservation Page
**Location:** `components/ReservationForm.tsx` (line 174)
- Current: `photo-1550966871-3ed3cdb5ed0c`
- Replace with: Dining area with set tables
- Recommended size: 1920x800px (landscape)

---

## 📋 Photo Specifications

### Technical Requirements:
- **Format:** JPG or WebP (WebP preferred for smaller file size)
- **Quality:** High resolution, well-lit, in focus
- **Dimensions:** See specific sizes above for each location
- **File Size:** Optimize to <500KB per image for faster loading

### Photography Tips:
1. **Lighting:** Use natural light when possible, avoid harsh shadows
2. **Angle:** Shoot from slightly above for food (45° angle works best)
3. **Background:** Clean, simple backgrounds that don't distract from food
4. **Styling:** Make sure food looks fresh and appetizing
5. **Consistency:** Use similar lighting and style across all photos

### Where to Upload Photos:
Currently, the site uses Unsplash URLs. To replace with your photos:

1. **Option A: Use Cloudinary (Recommended)**
   - Upload photos to your Cloudinary account
   - Replace Unsplash URLs with Cloudinary URLs
   - Benefit: Automatic image optimization and CDN

2. **Option B: Use Vercel Blob Storage**
   - Upload photos to Vercel Blob
   - Replace URLs in the code
   - Benefit: Integrated with your Vercel deployment

3. **Option C: Upload to public folder**
   - Place images in `/public/images/`
   - Update URLs to `/images/filename.jpg`
   - Note: No automatic optimization

---

## 🔄 How to Replace Photos

### Step 1: Take/Collect Photos
- Use a good smartphone camera or DSLR
- Take multiple shots of each item
- Select the best ones

### Step 2: Optimize Photos
- Use tools like TinyPNG or ImageOptim to compress
- Resize to recommended dimensions
- Convert to WebP if possible

### Step 3: Upload Photos
- Upload to Cloudinary, Vercel Blob, or public folder
- Get the URL for each photo

### Step 4: Update Code
- Open the relevant file (see locations above)
- Replace the Unsplash URL with your photo URL
- Test the page to ensure images load correctly

### Step 5: Deploy
- Commit changes to Git
- Push to GitHub
- Vercel will automatically redeploy

---

## 📞 Need Help?

If you need assistance with:
- Taking professional food photos
- Uploading images to Cloudinary
- Updating the code
- Testing the changes

Contact your developer or reach out via:
- **Phone:** +92 336 1171626
- **WhatsApp:** +92 336 1171626

---

## ✅ Completion Checklist

Track your progress replacing photos:

### Hero Carousel
- [ ] Slide 1 - Pizza
- [ ] Slide 2 - Burger
- [ ] Slide 3 - Interior

### Menu Items
- [ ] All 10 Pizza photos
- [ ] All 11 Burger & Roll photos
- [ ] All 4 Mains & Pasta photos
- [ ] All 4 Drink photos
- [ ] All 3 Dessert photos

### About Section
- [ ] Homepage collage (2 photos)
- [ ] About page collage (2 photos)

### Other Locations
- [ ] Footer Instagram grid (6 photos)
- [ ] Menu page hero
- [ ] Contact page hero
- [ ] Reservation page hero

---

**Last Updated:** January 2026  
**Total Stock Photos:** 61  
**Priority 1 (Hero):** 3 photos  
**Priority 2 (Menu):** 32 photos  
**Priority 3 (About):** 4 photos  
**Priority 4 (Footer):** 6 photos  
**Priority 5 (Heroes):** 3 photos

**Note:** Real photos will significantly improve customer engagement and conversion rates. High-quality food photography is one of the best investments you can make for your online presence!
