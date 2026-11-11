/**
 * NEXUS COMMERCE - Core Storage & Data Store Layer
 * Handles LocalStorage persistence for Products, Cart, Users, Orders, Coupons, and Wishlist.
 */

const Storage = (() => {
  const KEYS = {
    PRODUCTS: 'nexus_products',
    CART: 'nexus_cart',
    USERS: 'nexus_users',
    CURRENT_USER: 'nexus_current_user',
    ADMIN_USER: 'nexus_admin_user',
    ORDERS: 'nexus_orders',
    COUPONS: 'nexus_coupons',
    THEME: 'nexus_theme',
    WISHLIST: 'nexus_wishlist'
  };

  // Seed product catalog
  const SEED_PRODUCTS = [
    {
      id: 'PROD-101',
      name: 'AcousticPro Wireless Noise-Cancelling Headphones',
      category: 'Electronics',
      price: 299.99,
      originalPrice: 349.99,
      rating: 4.9,
      reviewCount: 184,
      stock: 24,
      featured: true,
      badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Experience studio-grade acoustic clarity with bespoke 40mm beryllium drivers, active hybrid noise cancellation up to 42dB, and ultra-plush memory foam earcups designed for all-day listening sessions. Features 36-hour battery endurance and multipoint Bluetooth 5.3 connectivity.',
      specs: {
        'Driver Size': '40mm Custom Neodymium',
        'Battery Life': 'Up to 36 Hours ANC On',
        'Bluetooth Version': '5.3 with LDAC & aptX HD',
        'Weight': '255g',
        'Warranty': '2 Years Comprehensive'
      },
      reviews: [
        { author: 'Marcus Vance', rating: 5, date: '2026-10-14', title: 'Flawless sound quality', comment: 'The ANC isolates urban traffic seamlessly and the highs remain crisp even at higher volume.' },
        { author: 'Elena Rostova', rating: 5, date: '2026-10-28', title: 'Exceptional craftsmanship', comment: 'Wore these on a 14-hour transpacific flight with zero pressure points or ear fatigue.' }
      ]
    },
    {
      id: 'PROD-102',
      name: 'Apex Precision Chrono Automatic Watch',
      category: 'Fashion',
      price: 489.00,
      originalPrice: 580.00,
      rating: 4.8,
      reviewCount: 92,
      stock: 12,
      featured: true,
      badge: 'Luxury Edition',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Handcrafted with an exhibition sapphire crystal caseback, mechanical self-winding caliber with 42-hour power reserve, 316L surgical stainless steel casing, and hand-stitched Horween leather strap. Water-resistant up to 100 meters.',
      specs: {
        'Movement': 'Automatic Caliber 8215',
        'Case Material': '316L Surgical Stainless Steel',
        'Glass': 'Anti-Reflective Sapphire Crystal',
        'Water Resistance': '10 ATM (100m)',
        'Strap': 'Genuine Italian Calfskin Leather'
      },
      reviews: [
        { author: 'David Sterling', rating: 5, date: '2026-09-12', title: 'Museum quality timekeeper', comment: 'The sweep of the second hand is silky smooth and the dial reflects light majestically.' }
      ]
    },
    {
      id: 'PROD-103',
      name: 'Titan Smartwatch Ultra Gen-4',
      category: 'Electronics',
      price: 349.50,
      originalPrice: 399.00,
      rating: 4.7,
      reviewCount: 142,
      stock: 35,
      featured: true,
      badge: 'New Arrival',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Aerospace-grade titanium bezel housing a brilliant 2000-nit Always-On AMOLED retina display. Precision dual-frequency GPS, ECG monitor, pulse oximetry, 100m water resistance, and an expedition battery delivering up to 72 hours of power.',
      specs: {
        'Display': '1.96-inch AMOLED 480x480 (2000 nits)',
        'Sensors': 'Optical HR, ECG, SpO2, Barometer, Temp',
        'Case': 'Grade 5 Aerospace Titanium',
        'Battery': 'Up to 72 hours normal, 7 days eco',
        'Water Resistance': '10 ATM / Diving Certified'
      },
      reviews: [
        { author: 'Samantha Reed', rating: 5, date: '2026-10-01', title: 'Essential for alpine hiking', comment: 'The GPS lock is instantaneous even in dense forest canyons.' }
      ]
    },
    {
      id: 'PROD-104',
      name: 'Aerolite Carbon Running Shoes',
      category: 'Sports & Fitness',
      price: 189.00,
      originalPrice: 220.00,
      rating: 4.8,
      reviewCount: 210,
      stock: 18,
      featured: true,
      badge: 'Top Rated',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Engineered with a full-length carbon composite propulsive plate embedded within high-rebound supercritical nitrogen-infused foam. Seamless breathable monofilament mesh upper with ergonomic heel lockdown collar.',
      specs: {
        'Weight': '198g (Size US 10)',
        'Heel Drop': '8mm (38mm heel / 30mm forefoot)',
        'Plate': 'Curved Carbon Fiber Launchpad',
        'Outsole': 'Continental High-Traction Rubber',
        'Intended Use': 'Marathon racing & road speedwork'
      },
      reviews: [
        { author: 'Liam Patterson', rating: 5, date: '2026-09-24', title: 'PR achieved on first 10K', comment: 'Noticeable energy return in every single stride. Incredible shoe.' }
      ]
    },
    {
      id: 'PROD-105',
      name: 'Sylvan Heritage Full-Grain Leather Weekender',
      category: 'Fashion',
      price: 245.00,
      originalPrice: 295.00,
      rating: 4.9,
      reviewCount: 78,
      stock: 15,
      featured: false,
      badge: 'Handcrafted',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Tanned in Florence using organic vegetable tannins, this heritage holdall will develop a rich personalized patina over decades of travel. Reinforced brass rivets, Japanese YKK Excella zippers, and padded 16-inch laptop chamber.',
      specs: {
        'Capacity': '45 Liters TSA Carry-on Compliant',
        'Material': 'Full-Grain Tuscan Cowhide Leather',
        'Hardware': 'Antiqued Solid Brass',
        'Dimensions': '52cm x 28cm x 26cm',
        'Lining': '100% Heavy Organic Cotton Canvas'
      },
      reviews: [
        { author: 'Arthur Pendleton', rating: 5, date: '2026-08-19', title: 'Sublime leather aroma & finish', comment: 'Quality is on par with luxury heritage luggage houses costing three times more.' }
      ]
    },
    {
      id: 'PROD-106',
      name: 'Lumina Minimalist Cast Iron Desk Lamp',
      category: 'Home & Living',
      price: 135.00,
      originalPrice: 160.00,
      rating: 4.6,
      reviewCount: 64,
      stock: 22,
      featured: false,
      badge: 'Design Award',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Sculptural architectural desk luminaire with capacitive touch stepless dimming, 98+ CRI museum-grade warm-to-cool circadian LED diode, and a weighted solid matte cast iron base with cable concealment channel.',
      specs: {
        'Color Temperature': '2700K - 6500K Continuous',
        'Color Rendering': 'CRI 98+ (True Tone)',
        'Power Consumption': '12W Max (850 Lumens)',
        'Base Weight': '2.4kg Anti-Tip Solid Base',
        'Cable': '2.0m Braided Textile Cord'
      },
      reviews: [
        { author: 'Claire Delacroix', rating: 5, date: '2026-09-04', title: 'Warm, flicker-free illumination', comment: 'Transformed my drafting desk setup completely.' }
      ]
    },
    {
      id: 'PROD-107',
      name: 'KeyCraft Pro Custom Mechanical Keyboard',
      category: 'Electronics',
      price: 179.99,
      originalPrice: 210.00,
      rating: 4.9,
      reviewCount: 312,
      stock: 40,
      featured: true,
      badge: 'Editor Choice',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'CNC machined anodized aluminum chassis with silicone gasket mounting, pre-lubed Gateron Oil King linear switches, double-shot PBT cherry profile keycaps, sound-dampening PORON acoustic foam, and hot-swap PCB support.',
      specs: {
        'Form Factor': '75% Layout (84 Keys)',
        'Switches': 'Factory Pre-Lubricated Linear',
        'Connectivity': 'Tri-mode: USB-C, 2.4GHz, Bluetooth 5.2',
        'Battery': '4000mAh Rechargable Li-ion',
        'Chassis': '6063 Solid Anodized Aluminum'
      },
      reviews: [
        { author: 'Devin Thorne', rating: 5, date: '2026-10-18', title: 'Thocky sound profile straight out of box', comment: 'No rattle on the spacebar or stabilizers. Highest typing comfort.' }
      ]
    },
    {
      id: 'PROD-108',
      name: 'Botanical Radiance Restorative Facial Serum',
      category: 'Beauty & Wellness',
      price: 68.00,
      originalPrice: 85.00,
      rating: 4.8,
      reviewCount: 156,
      stock: 50,
      featured: false,
      badge: 'Clean Beauty',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608248597359-bb436a56e297?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Cold-pressed bioactive botanical formulation infused with multi-molecular hyaluronic acid, stabilized vitamin C ester (15%), ferulic acid, and organic rosehip extract. Brightens tone and reinforces the cutaneous lipid barrier.',
      specs: {
        'Volume': '50ml / 1.7 fl oz',
        'Active Ingredients': '15% THD Ascorbate, 2% HA, Ferulic',
        'Skin Type': 'All skin types, dermatologist approved',
        'Formulation': '100% Vegan & Cruelty-Free',
        'Packaging': 'Amber UV-blocking Dropper Flask'
      },
      reviews: [
        { author: 'Serena Lin', rating: 5, date: '2026-10-09', title: 'Visible glow in 2 weeks', comment: 'Hydrates deeply without feeling oily or clogging pores.' }
      ]
    },
    {
      id: 'PROD-109',
      name: 'Artisan Ceramic Pour-Over & Coffee Carafe',
      category: 'Home & Living',
      price: 84.00,
      originalPrice: 99.00,
      rating: 4.7,
      reviewCount: 48,
      stock: 19,
      featured: false,
      badge: 'Artisan',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Wheel-thrown speckled stoneware dripper with internal vortex spiral extraction grooves paired with a heat-retaining 750ml borosilicate glass decanter and sustainable walnut wood handle collar.',
      specs: {
        'Capacity': '750ml (3-4 cups)',
        'Dripper': 'High-fired durable stoneware ceramic',
        'Decanter': 'Thermal Shock Borosilicate Glass',
        'Filter Compatibility': 'Standard V60 02 paper or cloth',
        'Care': 'Dishwasher safe carafe'
      },
      reviews: [
        { author: 'Julian Keller', rating: 5, date: '2026-08-30', title: 'Exceptional extraction', comment: 'Brews the sweetest, cleanest cup of light roast coffee.' }
      ]
    },
    {
      id: 'PROD-110',
      name: 'Nordic Cashmere Blend Oversized Knit',
      category: 'Fashion',
      price: 195.00,
      originalPrice: 240.00,
      rating: 4.8,
      reviewCount: 89,
      stock: 14,
      featured: true,
      badge: 'Winter Collection',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Spun from sustainably harvested Mongolian Grade-A cashmere and superfine merino wool. Seamless circular knitting guarantees relaxed drape, featherlight insulating warmth, and natural pill resistance.',
      specs: {
        'Composition': '70% Fine Merino Wool, 30% Grade-A Cashmere',
        'Yarn Gauge': '7GG Heavy Chunky Ribbed Knit',
        'Fit': 'Contemporary Relaxed Oversized Silhouette',
        'Origin': 'Ethically sourced in Inner Mongolia',
        'Care': 'Hand wash cold or gentle dry clean'
      },
      reviews: [
        { author: 'Fiona Gallagher', rating: 5, date: '2026-10-22', title: 'Heavenly soft', comment: 'The feel against the skin is like a cloud. Very cozy and elegant.' }
      ]
    },
    {
      id: 'PROD-111',
      name: 'HydroShield Vacuum Insulated Flask 1.0L',
      category: 'Sports & Fitness',
      price: 45.00,
      originalPrice: 55.00,
      rating: 4.9,
      reviewCount: 380,
      stock: 65,
      featured: false,
      badge: 'Eco Friendly',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Double-wall TempMax vacuum insulation keeps liquids icy cold for 36 hours or piping hot for 18 hours. Fabricated from medical grade 18/8 stainless steel with a scratch-resistant powder coat and leakproof chug lid.',
      specs: {
        'Volume': '1000ml / 34oz',
        'Thermal Retention': '36h Cold / 18h Hot',
        'Steel Grade': '18/8 Pro-Grade Stainless Steel (BPA Free)',
        'Coating': 'Textured Grip Powder-Coat',
        'Lid Type': 'AeroSpout Rapid Drink Cap'
      },
      reviews: [
        { author: 'Zack Brody', rating: 5, date: '2026-09-17', title: 'Ice cubes remained for two full days', comment: 'Best water bottle I have ever owned hands down.' }
      ]
    },
    {
      id: 'PROD-112',
      name: 'Velour Noir Wild Amber & Cedar Soy Candle',
      category: 'Beauty & Wellness',
      price: 38.00,
      originalPrice: 48.00,
      rating: 4.7,
      reviewCount: 95,
      stock: 28,
      featured: false,
      badge: 'Aromatherapy',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Hand-poured 100% pure Midwestern soy wax infused with botanical essential oils of smoky Baltic amber, cedarwood, crushed cardamon, and dark vanilla bean. Dual crackling organic wooden wicks provide a 65-hour clean burn.',
      specs: {
        'Wax': '100% Organic Midwestern Soy Wax',
        'Burn Duration': '65+ Hours Clean Burn',
        'Wick': 'FSC Certified Dual Wood Wicks',
        'Vessel': 'Matte Ceramic with Embossed Oak Lid',
        'Fragrance Notes': 'Amber, Cedar, Cardamom, Bourbon Vanilla'
      },
      reviews: [
        { author: 'Maya Gutierrez', rating: 5, date: '2026-10-11', title: 'Incredible scent throw', comment: 'Fills the entire living room with a relaxing, warm autumnal atmosphere.' }
      ]
    }
  ];

  // Seed customer and admin accounts
  const SEED_USERS = [
    {
      id: 'USR-001',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      password: 'password123',
      phone: '+1 (555) 234-5678',
      role: 'customer',
      createdAt: '2026-01-15',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        zip: '97477',
        country: 'United States'
      }
    },
    {
      id: 'USR-ADMIN',
      fullName: 'Chief Administrator',
      email: 'admin@nexusstore.com',
      password: 'admin123',
      phone: '+1 (555) 999-0000',
      role: 'admin',
      createdAt: '2025-11-01',
      address: {
        street: '100 Nexus Blvd Suite 500',
        city: 'San Francisco',
        state: 'California',
        zip: '94105',
        country: 'United States'
      }
    }
  ];

  // Seed realistic historical orders for Alex Morgan
  const SEED_ORDERS = [
    {
      id: 'ORD-98214',
      userId: 'USR-001',
      customerName: 'Alex Morgan',
      customerEmail: 'alex.morgan@example.com',
      customerPhone: '+1 (555) 234-5678',
      date: '2026-11-03T10:15:00Z',
      status: 'Delivered',
      items: [
        {
          id: 'PROD-101',
          name: 'AcousticPro Wireless Noise-Cancelling Headphones',
          price: 299.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'PROD-111',
          name: 'HydroShield Vacuum Insulated Flask 1.0L',
          price: 45.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
        }
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        zip: '97477',
        country: 'United States'
      },
      paymentMethod: 'Credit Card (Simulated)',
      subtotal: 344.99,
      discount: 34.50,
      couponCode: 'WELCOME10',
      shippingFee: 0.00,
      tax: 24.84,
      total: 335.33,
      trackingNumber: 'NX-98214-US',
      carrier: 'Nexus Express Priority',
      estimatedDelivery: '2026-11-06',
      timeline: [
        { status: 'Order Placed', timestamp: '2026-11-03 10:15 AM', description: 'Order verified and payment authorized.' },
        { status: 'Processing', timestamp: '2026-11-03 02:40 PM', description: 'Items collected and packed at fulfillment hub.' },
        { status: 'Shipped', timestamp: '2026-11-04 09:20 AM', description: 'Package scanned into regional carrier sorting facility.' },
        { status: 'Delivered', timestamp: '2026-11-06 01:15 PM', description: 'Delivered to front porch. Signature on file.' }
      ]
    },
    {
      id: 'ORD-98432',
      userId: 'USR-001',
      customerName: 'Alex Morgan',
      customerEmail: 'alex.morgan@example.com',
      customerPhone: '+1 (555) 234-5678',
      date: '2026-11-08T14:30:00Z',
      status: 'Shipped',
      items: [
        {
          id: 'PROD-104',
          name: 'Aerolite Carbon Running Shoes',
          price: 189.00,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
        }
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        zip: '97477',
        country: 'United States'
      },
      paymentMethod: 'PayPal (Simulated)',
      subtotal: 189.00,
      discount: 0.00,
      couponCode: null,
      shippingFee: 0.00,
      tax: 15.12,
      total: 204.12,
      trackingNumber: 'NX-98432-US',
      carrier: 'Nexus Express Priority',
      estimatedDelivery: '2026-11-12',
      timeline: [
        { status: 'Order Placed', timestamp: '2026-11-08 02:30 PM', description: 'Order confirmed by buyer.' },
        { status: 'Processing', timestamp: '2026-11-09 08:15 AM', description: 'Quality inspection passed and package sealed.' },
        { status: 'Shipped', timestamp: '2026-11-10 11:45 AM', description: 'Departed transit hub in Portland, OR. In transit.' }
      ]
    },
    {
      id: 'ORD-98650',
      userId: 'USR-001',
      customerName: 'Alex Morgan',
      customerEmail: 'alex.morgan@example.com',
      customerPhone: '+1 (555) 234-5678',
      date: '2026-11-10T16:45:00Z',
      status: 'Processing',
      items: [
        {
          id: 'PROD-107',
          name: 'KeyCraft Pro Custom Mechanical Keyboard',
          price: 179.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'PROD-112',
          name: 'Velour Noir Wild Amber & Cedar Soy Candle',
          price: 38.00,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
        }
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        zip: '97477',
        country: 'United States'
      },
      paymentMethod: 'Credit Card (Simulated)',
      subtotal: 255.99,
      discount: 25.60,
      couponCode: 'WELCOME10',
      shippingFee: 0.00,
      tax: 18.43,
      total: 248.82,
      trackingNumber: 'NX-98650-US',
      carrier: 'Nexus Express Priority',
      estimatedDelivery: '2026-11-14',
      timeline: [
        { status: 'Order Placed', timestamp: '2026-11-10 04:45 PM', description: 'Order submitted by customer.' },
        { status: 'Processing', timestamp: '2026-11-11 06:00 AM', description: 'Allocated to warehouse picking team.' }
      ]
    }
  ];

  // Seed coupons
  const SEED_COUPONS = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minSpend: 0, description: '10% off your entire order' },
    { code: 'SAVE20', type: 'percentage', value: 20, minSpend: 150, description: '20% off orders over $150' },
    { code: 'LUXE50', type: 'fixed', value: 50, minSpend: 250, description: '$50 off orders over $250' },
    { code: 'FREESHIP', type: 'shipping', value: 100, minSpend: 0, description: 'Complimentary expedited shipping' }
  ];

  // Safe LocalStorage helpers
  const getRaw = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  };

  const setRaw = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
      return false;
    }
  };

  // Initialize storage with seeds if missing
  const init = () => {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      setRaw(KEYS.PRODUCTS, SEED_PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      setRaw(KEYS.USERS, SEED_USERS);
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      setRaw(KEYS.ORDERS, SEED_ORDERS);
    }
    if (!localStorage.getItem(KEYS.COUPONS)) {
      setRaw(KEYS.COUPONS, SEED_COUPONS);
    }
    if (!localStorage.getItem(KEYS.CART)) {
      setRaw(KEYS.CART, []);
    }
    if (!localStorage.getItem(KEYS.WISHLIST)) {
      setRaw(KEYS.WISHLIST, []);
    }
    // Set default customer logged in if none exists for instant seamless browsing
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      setRaw(KEYS.CURRENT_USER, SEED_USERS[0]);
    }
  };

  init();

  return {
    // PRODUCTS
    getProducts: () => getRaw(KEYS.PRODUCTS, SEED_PRODUCTS),
    saveProducts: (products) => setRaw(KEYS.PRODUCTS, products),
    getProductById: (id) => {
      const products = getRaw(KEYS.PRODUCTS, SEED_PRODUCTS);
      return products.find(p => String(p.id) === String(id)) || null;
    },
    addProduct: (newProd) => {
      const products = getRaw(KEYS.PRODUCTS, SEED_PRODUCTS);
      newProd.id = 'PROD-' + Date.now().toString().slice(-5);
      newProd.rating = newProd.rating || 5.0;
      newProd.reviewCount = newProd.reviewCount || 0;
      newProd.reviews = newProd.reviews || [];
      newProd.gallery = newProd.gallery && newProd.gallery.length ? newProd.gallery : [newProd.image];
      products.unshift(newProd);
      setRaw(KEYS.PRODUCTS, products);
      return newProd;
    },
    updateProduct: (updatedProd) => {
      const products = getRaw(KEYS.PRODUCTS, SEED_PRODUCTS);
      const idx = products.findIndex(p => String(p.id) === String(updatedProd.id));
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updatedProd };
        setRaw(KEYS.PRODUCTS, products);
        return products[idx];
      }
      return null;
    },
    deleteProduct: (id) => {
      let products = getRaw(KEYS.PRODUCTS, SEED_PRODUCTS);
      products = products.filter(p => String(p.id) !== String(id));
      setRaw(KEYS.PRODUCTS, products);
      return true;
    },

    // CART
    getCart: () => getRaw(KEYS.CART, []),
    saveCart: (cart) => setRaw(KEYS.CART, cart),
    addToCart: (productId, quantity = 1, options = {}) => {
      const cart = getRaw(KEYS.CART, []);
      const product = Storage.getProductById(productId);
      if (!product) return { success: false, message: 'Product not found' };

      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          return { success: false, message: `Only ${product.stock} units available in stock.` };
        }
        existingItem.quantity = newQty;
      } else {
        if (quantity > product.stock) {
          return { success: false, message: `Only ${product.stock} units available in stock.` };
        }
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          quantity: quantity,
          stock: product.stock,
          options: options
        });
      }
      setRaw(KEYS.CART, cart);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      return { success: true, cart };
    },
    updateCartItemQuantity: (productId, quantity) => {
      let cart = getRaw(KEYS.CART, []);
      const product = Storage.getProductById(productId);
      const item = cart.find(i => i.id === productId);

      if (!item) return false;

      if (quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
      } else {
        if (product && quantity > product.stock) {
          return { success: false, message: `Maximum available stock is ${product.stock}.` };
        }
        item.quantity = quantity;
      }
      setRaw(KEYS.CART, cart);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      return { success: true, cart };
    },
    removeFromCart: (productId) => {
      let cart = getRaw(KEYS.CART, []);
      cart = cart.filter(item => item.id !== productId);
      setRaw(KEYS.CART, cart);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      return cart;
    },
    clearCart: () => {
      setRaw(KEYS.CART, []);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
    },
    getCartTotals: (couponCode = null) => {
      const cart = getRaw(KEYS.CART, []);
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      let discount = 0;
      let appliedCoupon = null;
      if (couponCode) {
        const coupons = getRaw(KEYS.COUPONS, SEED_COUPONS);
        const match = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
        if (match && subtotal >= match.minSpend) {
          appliedCoupon = match;
          if (match.type === 'percentage') {
            discount = (subtotal * match.value) / 100;
          } else if (match.type === 'fixed') {
            discount = Math.min(match.value, subtotal);
          }
        }
      }

      const taxableAmount = Math.max(0, subtotal - discount);
      // Standard 8% simulated sales tax
      const tax = taxableAmount * 0.08;
      // Free shipping for orders over $100, or flat $12.00
      let shippingFee = subtotal > 100 || (appliedCoupon && appliedCoupon.type === 'shipping') ? 0 : (subtotal > 0 ? 12.00 : 0);
      const total = taxableAmount + tax + shippingFee;

      return {
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        coupon: appliedCoupon,
        tax: parseFloat(tax.toFixed(2)),
        shippingFee: parseFloat(shippingFee.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      };
    },

    // USERS & AUTH
    getUsers: () => getRaw(KEYS.USERS, SEED_USERS),
    getCurrentUser: () => getRaw(KEYS.CURRENT_USER, null),
    setCurrentUser: (user) => {
      setRaw(KEYS.CURRENT_USER, user);
      window.dispatchEvent(new CustomEvent('userAuthChanged', { detail: user }));
    },
    getAdminUser: () => getRaw(KEYS.ADMIN_USER, null),
    setAdminUser: (admin) => {
      setRaw(KEYS.ADMIN_USER, admin);
      window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: admin }));
    },
    logoutUser: () => {
      localStorage.removeItem(KEYS.CURRENT_USER);
      window.dispatchEvent(new CustomEvent('userAuthChanged', { detail: null }));
    },
    logoutAdmin: () => {
      localStorage.removeItem(KEYS.ADMIN_USER);
      window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: null }));
    },
    registerUser: (userData) => {
      const users = getRaw(KEYS.USERS, SEED_USERS);
      const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        return { success: false, message: 'An account with this email address already exists.' };
      }
      const newUser = {
        id: 'USR-' + Date.now().toString().slice(-5),
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0],
        address: userData.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'United States'
        }
      };
      users.push(newUser);
      setRaw(KEYS.USERS, users);
      Storage.setCurrentUser(newUser);
      return { success: true, user: newUser };
    },
    loginUser: (email, password) => {
      const users = getRaw(KEYS.USERS, SEED_USERS);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
      if (!user) {
        return { success: false, message: 'Invalid email address or password.' };
      }
      Storage.setCurrentUser(user);
      return { success: true, user };
    },
    loginAdmin: (email, password) => {
      const users = getRaw(KEYS.USERS, SEED_USERS);
      const admin = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password && u.role === 'admin');
      if (!admin) {
        return { success: false, message: 'Invalid administrator credentials.' };
      }
      Storage.setAdminUser(admin);
      return { success: true, admin };
    },
    updateUserProfile: (updatedFields) => {
      const currentUser = Storage.getCurrentUser();
      if (!currentUser) return { success: false, message: 'No active session' };

      const users = getRaw(KEYS.USERS, SEED_USERS);
      const userIdx = users.findIndex(u => u.id === currentUser.id);
      if (userIdx !== -1) {
        users[userIdx] = { ...users[userIdx], ...updatedFields };
        setRaw(KEYS.USERS, users);
        Storage.setCurrentUser(users[userIdx]);
        return { success: true, user: users[userIdx] };
      }
      return { success: false, message: 'User record not found' };
    },

    // ORDERS
    getOrders: () => getRaw(KEYS.ORDERS, SEED_ORDERS),
    getOrderById: (orderId) => {
      const orders = getRaw(KEYS.ORDERS, SEED_ORDERS);
      return orders.find(o => o.id.toUpperCase() === String(orderId).trim().toUpperCase()) || null;
    },
    getUserOrders: (userId) => {
      const orders = getRaw(KEYS.ORDERS, SEED_ORDERS);
      return orders.filter(o => o.userId === userId);
    },
    createOrder: (orderPayload) => {
      const orders = getRaw(KEYS.ORDERS, SEED_ORDERS);
      const orderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: orderNumber,
        userId: orderPayload.userId || (Storage.getCurrentUser() ? Storage.getCurrentUser().id : 'GUEST'),
        customerName: orderPayload.shippingAddress.fullName,
        customerEmail: orderPayload.shippingAddress.email || (Storage.getCurrentUser() ? Storage.getCurrentUser().email : ''),
        customerPhone: orderPayload.shippingAddress.phone,
        date: new Date().toISOString(),
        status: 'Processing',
        items: orderPayload.items,
        shippingAddress: orderPayload.shippingAddress,
        paymentMethod: orderPayload.paymentMethod,
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount,
        couponCode: orderPayload.couponCode,
        shippingFee: orderPayload.shippingFee,
        tax: orderPayload.tax,
        total: orderPayload.total,
        trackingNumber: 'NX-' + Math.floor(10000 + Math.random() * 90000) + '-US',
        carrier: 'Nexus Express Priority',
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeline: [
          {
            status: 'Order Placed',
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            description: 'Order placed successfully and authorized for processing.'
          },
          {
            status: 'Processing',
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            description: 'Item dispatched to regional fulfillment hub for packaging.'
          }
        ]
      };

      // Reduce product stock accordingly
      const products = Storage.getProducts();
      newOrder.items.forEach(orderItem => {
        const prod = products.find(p => p.id === orderItem.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - orderItem.quantity);
        }
      });
      Storage.saveProducts(products);

      orders.unshift(newOrder);
      setRaw(KEYS.ORDERS, orders);
      Storage.clearCart();
      return newOrder;
    },
    updateOrderStatus: (orderId, newStatus, note = '') => {
      const orders = getRaw(KEYS.ORDERS, SEED_ORDERS);
      const order = orders.find(o => o.id === orderId);
      if (!order) return false;

      order.status = newStatus;
      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      let defaultDesc = `Order status updated to ${newStatus}.`;
      if (newStatus === 'Shipped') defaultDesc = 'Package has departed carrier distribution facility.';
      if (newStatus === 'Delivered') defaultDesc = 'Package securely delivered to recipient.';
      if (newStatus === 'Cancelled') defaultDesc = 'Order cancelled upon request.';

      order.timeline.push({
        status: newStatus,
        timestamp: nowStr,
        description: note || defaultDesc
      });

      setRaw(KEYS.ORDERS, orders);
      return order;
    },

    // COUPONS
    getCoupons: () => getRaw(KEYS.COUPONS, SEED_COUPONS),
    validateCoupon: (code, subtotal) => {
      const coupons = getRaw(KEYS.COUPONS, SEED_COUPONS);
      const match = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!match) {
        return { valid: false, message: 'Invalid promo or coupon code.' };
      }
      if (subtotal < match.minSpend) {
        return { valid: false, message: `Minimum spend of $${match.minSpend} required for this coupon.` };
      }
      return { valid: true, coupon: match };
    },

    // THEME
    getTheme: () => localStorage.getItem(KEYS.THEME) || 'light',
    setTheme: (theme) => {
      localStorage.setItem(KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    },

    // WISHLIST
    getWishlist: () => getRaw(KEYS.WISHLIST, []),
    toggleWishlist: (productId) => {
      let list = getRaw(KEYS.WISHLIST, []);
      const idx = list.indexOf(productId);
      let isAdded = false;
      if (idx !== -1) {
        list.splice(idx, 1);
      } else {
        list.push(productId);
        isAdded = true;
      }
      setRaw(KEYS.WISHLIST, list);
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: list }));
      return isAdded;
    },
    isInWishlist: (productId) => {
      const list = getRaw(KEYS.WISHLIST, []);
      return list.includes(productId);
    }
  };
})();

