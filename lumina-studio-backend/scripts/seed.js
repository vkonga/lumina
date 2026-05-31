const pool = require('../config/db');

const seedData = async () => {
  try {
    // Drop only content/product tables — PRESERVE users & cart_items so existing accounts survive!
    await pool.query(`
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS product_sizes, youtube_slides, portfolio_videos, products, hero, services, gallery, testimonial, videos, site_content CASCADE;
    `);

    console.log('Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(10) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        img TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        reference_images TEXT
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS testimonial (
        id SERIAL PRIMARY KEY,
        quote TEXT,
        author VARCHAR(255),
        location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        image VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_sizes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        size VARCHAR(50) NOT NULL,
        price_modifier DECIMAL(10, 2) NOT NULL DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        selected_size VARCHAR(50) NOT NULL DEFAULT '',
        quantity INTEGER NOT NULL DEFAULT 1,
        custom_image TEXT DEFAULT NULL,
        custom_color VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, product_id, selected_size)
      );

      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS youtube_slides (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS portfolio_videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL
      );
    `);

    console.log('Inserting seed data...');

    // Hero
    await pool.query(
      `INSERT INTO hero (title, subtitle, image) VALUES ($1, $2, $3)`,
      ['Elite Perspective', 'Creating Memories, Capturing The Most Breathtaking Views', 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=2070&auto=format&fit=crop']
    );

    // Services
    const services = [
      { 
        id: '01', 
        title: 'Candid Photography', 
        img: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=1000&auto=format&fit=crop',
        price: 75000.00,
        reference_images: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '02', 
        title: 'Videography', 
        img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
        price: 95000.00,
        reference_images: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '03', 
        title: 'Maternity Shoot', 
        img: 'https://images.unsplash.com/photo-1590156546746-c588a113f6f3?q=80&w=1000&auto=format&fit=crop',
        price: 45000.00,
        reference_images: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1590156546746-c588a113f6f3?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '04', 
        title: 'Pre-Wedding', 
        img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
        price: 60000.00,
        reference_images: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '05', 
        title: 'Kids Shoot', 
        img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop',
        price: 35000.00,
        reference_images: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '06', 
        title: 'Traditional Shoots', 
        img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
        price: 50000.00,
        reference_images: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=1000&auto=format&fit=crop'
      },
      { 
        id: '07', 
        title: 'Fashion Shoots', 
        img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        price: 80000.00,
        reference_images: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop,https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
      }
    ];
    for (const service of services) {
      await pool.query(
        `INSERT INTO services (id, title, img, price, reference_images) VALUES ($1, $2, $3, $4, $5)`,
        [service.id, service.title, service.img, service.price, service.reference_images]
      );
    }

    // Gallery
    const gallery = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=1000&auto=format&fit=crop'
    ];
    for (const imgUrl of gallery) {
      await pool.query(
        `INSERT INTO gallery (image_url) VALUES ($1)`,
        [imgUrl]
      );
    }

    // Testimonial
    await pool.query(
      `INSERT INTO testimonial (quote, author, location) VALUES ($1, $2, $3)`,
      [
        "SD Photography didn't just take photos, they captured the soul of our wedding. Every frame feels like a still from a high-end cinematic masterpiece. Truly unparalleled artistry.",
        'SAI & HARIKA',
        'TUNI, ANDHRA PRADESH'
      ]
    );

    // Products Boutique Collection
    const products = [
      {
        title: 'Archival Walnut Frame',
        price: 200,           // Base price = 6X9 size = ₹200
        category: 'Frames',
        description: 'Museum-grade UV protection glass',
        image: 'frame.png'
      },
      {
        title: "The 'Bride' Signature Tee",
        price: 65.00,
        category: 'Apparel',
        description: '100% Pima Cotton, Gold Embroidery',
        image: 'tee.png'
      },
      {
        title: "SD Designer Custom Mug",
        price: 35.00,
        category: 'Gifts',
        description: 'Premium matte ceramic mug, gold accented SD signature engraving',
        image: 'mug.png'
      }
    ];

    // Ensure all kid products are categorized under 'Kids'
    for (const p of products) {
      if (p.title.includes('Kids')) {
        p.category = 'Kids';
      }
    }

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (title, price, category, description, image) VALUES ($1, $2, $3, $4, $5)`,
        [product.title, product.price, product.category, product.description, product.image]
      );
    }

    // Insert Product Sizes (SD Frames actual INR price list)
    // price_modifier = actual_price - base_price(200)
    const archivalWalnutResult = await pool.query("SELECT id FROM products WHERE title = 'Archival Walnut Frame'");
    const archivalWalnutId = archivalWalnutResult.rows[0].id;

    const frameSizes = [
      { product_id: archivalWalnutId, size: '6X9',   price_modifier: 0    },   // ₹200
      { product_id: archivalWalnutId, size: '8X10',  price_modifier: 50   },   // ₹250
      { product_id: archivalWalnutId, size: '8X12',  price_modifier: 150  },   // ₹350
      { product_id: archivalWalnutId, size: '10X12', price_modifier: 200  },   // ₹400
      { product_id: archivalWalnutId, size: '10X15', price_modifier: 250  },   // ₹450
      { product_id: archivalWalnutId, size: '12X15', price_modifier: 300  },   // ₹500
      { product_id: archivalWalnutId, size: '12X18', price_modifier: 300  },   // ₹500
      { product_id: archivalWalnutId, size: '16X20', price_modifier: 800  },   // ₹1000
      { product_id: archivalWalnutId, size: '16X24', price_modifier: 1000 },   // ₹1200
      { product_id: archivalWalnutId, size: '18X24', price_modifier: 1100 },   // ₹1300
      { product_id: archivalWalnutId, size: '20X24', price_modifier: 1300 },   // ₹1500
      { product_id: archivalWalnutId, size: '20X30', price_modifier: 1500 },   // ₹1700
      { product_id: archivalWalnutId, size: '24X30', price_modifier: 2000 },   // ₹2200
      { product_id: archivalWalnutId, size: '24X36', price_modifier: 2244 },   // ₹2444
      { product_id: archivalWalnutId, size: '24X40', price_modifier: 2300 }    // ₹2500
    ];
    for (const fs of frameSizes) {
      await pool.query(
        `INSERT INTO product_sizes (product_id, size, price_modifier) VALUES ($1, $2, $3)`,
        [fs.product_id, fs.size, fs.price_modifier]
      );
    }

    // T-shirt / Apparel sizes
    const brideSignatureTeeResult = await pool.query("SELECT id FROM products WHERE title = 'The ''Bride'' Signature Tee'");
    const brideSignatureTeeId = brideSignatureTeeResult.rows[0]?.id;
    if (brideSignatureTeeId) {
      const teeSizes = [
        { size: 'XS',  price_modifier: 0   },
        { size: 'S',   price_modifier: 0   },
        { size: 'M',   price_modifier: 0   },
        { size: 'L',   price_modifier: 50  },
        { size: 'XL',  price_modifier: 100 },
        { size: 'XXL', price_modifier: 150 },
        { size: '3XL', price_modifier: 200 },
      ];
      for (const ts of teeSizes) {
        await pool.query(
          `INSERT INTO product_sizes (product_id, size, price_modifier) VALUES ($1, $2, $3)`,
          [brideSignatureTeeId, ts.size, ts.price_modifier]
        );
      }
    }

    // Site Content (UI Strings)
    const siteContent = [
      { key: 'services_kicker', value: 'Crafting Excellence' },
      { key: 'services_title', value: 'Our Services' },
      { key: 'gallery_kicker', value: 'The Gallery' },
      { key: 'gallery_title', value: 'Visual Narratives' },
      { key: 'gallery_description', value: 'Every frame is a perfect memory, every shot a masterpiece of storytelling. Explore our recent elite captures.' },
      { key: 'store_title', value: 'The Boutique' },
      { key: 'store_collection', value: 'Collection' },
      { key: 'store_description', value: "Exquisite archival frames, limited edition gift articles, and bespoke apparel designed for the modern visual storyteller. Curated with SD Photography's signature aesthetic." },
      { key: 'newsletter_title', value: 'Exclusive Access' },
      { key: 'newsletter_description', value: 'Subscribe to receive first-look access to limited edition archival prints and new boutique collections.' },
      { key: 'login_title', value: 'Welcome Back' },
      { key: 'login_subtitle', value: 'ELITE STUDIO ACCESS' },
      { key: 'login_hero_title', value: 'The Art of Visual Storytelling.' },
      { key: 'login_hero_subtitle', value: 'Capturing the most intimate chapters of your life with cinematic precision and timeless elegance.' },
      // Added email and contact details
      { key: 'contact_email', value: 'sridurgastudio1@gmail.com' },
      { key: 'contact_phone', value: '9666296956' }
    ];
    for (const item of siteContent) {
      await pool.query(
        `INSERT INTO site_content (key, value) VALUES ($1, $2)`,
        [item.key, item.value]
      );
    }

    // Insert YouTube Slides
    const youtubeSlides = [
      { title: 'SZDAVPpsXvw Tour', url: 'https://www.youtube.com/embed/SZDAVPpsXvw' },
      { title: 'vjPrhw1IWTc Tour', url: 'https://www.youtube.com/embed/vjPrhw1IWTc' },
      { title: 'jO9fZAESPdo Tour', url: 'https://www.youtube.com/embed/jO9fZAESPdo' }
    ];
    for (const slide of youtubeSlides) {
      await pool.query(
        `INSERT INTO youtube_slides (title, url) VALUES ($1, $2)`,
        [slide.title, slide.url]
      );
    }

    // Insert Portfolio Videos (11 dynamic showcases)
    const portfolioVideos = [
      { title: 'Elite Wedding Showcase', url: 'https://www.youtube.com/embed/SZDAVPpsXvw' },
      { title: 'Cinematic Prelude Highlights', url: 'https://www.youtube.com/embed/HATSwlOOWQM' },
      { title: 'Traditional Mandap Ceremonies', url: 'https://www.youtube.com/embed/79T5Q2Vp3yU' },
      { title: 'Sangeet Slow-mo Showcase', url: 'https://www.youtube.com/embed/vjPrhw1IWTc' },
      { title: 'Heritage Venue Symphony', url: 'https://www.youtube.com/embed/62kLL82vxDY' },
      { title: 'Traditional Haldi Teaser', url: 'https://www.youtube.com/embed/qwAk-uh5NyE' },
      { title: 'Post-Wedding Serenades', url: 'https://www.youtube.com/embed/jO9fZAESPdo' },
      { title: 'Breathtaking Reception Glances', url: 'https://www.youtube.com/embed/QyGkcZrh0Rs' },
      { title: 'Candid Emotional Journey', url: 'https://www.youtube.com/embed/6pMEw_TYS5g' },
      { title: 'Traditional Mehndi Prelude', url: 'https://www.youtube.com/embed/Vx4y7iPFD8o' },
      { title: 'Timeless Heirloom Stories', url: 'https://www.youtube.com/embed/0WGOBCyPTGc' }
    ];
    for (const video of portfolioVideos) {
      await pool.query(
        `INSERT INTO portfolio_videos (title, url) VALUES ($1, $2)`,
        [video.title, video.url]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
