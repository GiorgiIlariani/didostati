// Note: categoryId will be replaced with actual MongoDB IDs during seeding
const products = [
  // Power Tools
  {
    name: 'Bosch Professional Drill',
    description: 'Powerful 750W electric drill with variable speed control. Perfect for drilling in wood, metal, and masonry. Includes carrying case and accessories.',
    price: 189.99,
    originalPrice: 249.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Bosch',
    images: [{
      url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
      alt: 'Bosch Professional Drill'
    }],
    stock: 15,
    inStock: true,
    rating: 4.8,
    reviews: 124,
    badge: 'Best Seller',
    specifications: {
      'Power': '750W',
      'Speed': '0-3000 RPM',
      'Chuck Size': '13mm',
      'Weight': '1.8kg'
    },
    tags: ['power-tools', 'drilling', 'bosch']
  },
  {
    name: 'Makita Angle Grinder 125mm',
    description: 'Compact and powerful 900W angle grinder. Ideal for cutting and grinding metal, stone, and tiles.',
    price: 159.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Makita',
    images: [{
      url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600',
      alt: 'Makita Angle Grinder'
    }],
    stock: 12,
    inStock: true,
    rating: 4.7,
    reviews: 98,
    badge: 'Popular',
    specifications: {
      'Power': '900W',
      'Disc Size': '125mm',
      'Speed': '11000 RPM'
    },
    tags: ['power-tools', 'grinding', 'makita']
  },
  {
    name: 'DeWalt Cordless Impact Driver',
    description: '18V lithium-ion cordless impact driver with 2 batteries and charger. High torque for heavy-duty applications.',
    price: 299.99,
    originalPrice: 349.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'DeWalt',
    images: [{
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600',
      alt: 'DeWalt Impact Driver'
    }],
    stock: 8,
    inStock: true,
    rating: 4.9,
    reviews: 156,
    badge: 'Best Seller',
    specifications: {
      'Voltage': '18V',
      'Torque': '180Nm',
      'Battery': '2x 2.0Ah'
    },
    tags: ['power-tools', 'cordless', 'dewalt']
  },

  // Hand Tools
  {
    name: 'Professional Hammer Set 3pcs',
    description: 'Set of 3 professional hammers: claw hammer, ball-peen hammer, and rubber mallet. Durable fiberglass handles.',
    price: 45.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Stanley',
    images: [{
      url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600',
      alt: 'Hammer Set'
    }],
    stock: 25,
    inStock: true,
    rating: 4.5,
    reviews: 67,
    badge: 'Popular',
    specifications: {
      'Pieces': '3',
      'Handle': 'Fiberglass',
      'Weight': '1.5kg'
    },
    tags: ['hand-tools', 'hammer', 'stanley']
  },
  {
    name: 'Screwdriver Set 24pcs',
    description: 'Complete screwdriver set with magnetic tips. Includes Phillips, flat-head, and Torx bits. Comes with organizing case.',
    price: 34.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Wera',
    images: [{
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600',
      alt: 'Screwdriver Set'
    }],
    stock: 30,
    inStock: true,
    rating: 4.6,
    reviews: 89,
    specifications: {
      'Pieces': '24',
      'Type': 'Magnetic',
      'Case': 'Included'
    },
    tags: ['hand-tools', 'screwdriver', 'wera']
  },
  {
    name: 'Measuring Tape 8m Professional',
    description: 'Heavy-duty 8-meter measuring tape with automatic lock and belt clip. Clear markings in metric and imperial.',
    price: 18.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Stanley',
    images: [{
      url: 'https://images.unsplash.com/photo-1581368076907-9f8cb8f82fc8?w=600',
      alt: 'Measuring Tape'
    }],
    stock: 50,
    inStock: true,
    rating: 4.4,
    reviews: 145,
    badge: 'New',
    specifications: {
      'Length': '8m',
      'Width': '25mm',
      'Lock': 'Automatic'
    },
    tags: ['hand-tools', 'measuring', 'stanley']
  },

  // Paint & Supplies
  {
    name: 'Interior White Paint 10L',
    description: 'Premium quality white interior paint. Easy to apply, quick drying, and long-lasting finish. Coverage: 60-70 sq.m.',
    price: 42.99,
    categoryName: 'საღებავები & საფარები',
    brand: 'Dulux',
    images: [{
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
      alt: 'White Paint'
    }],
    stock: 40,
    inStock: true,
    rating: 4.7,
    reviews: 234,
    badge: 'Best Seller',
    specifications: {
      'Volume': '10L',
      'Coverage': '60-70 sq.m',
      'Drying Time': '2-4 hours',
      'Type': 'Matte'
    },
    tags: ['paint', 'interior', 'dulux']
  },
  {
    name: 'Paint Brush Set Professional 5pcs',
    description: 'High-quality synthetic bristle paint brushes. Sizes: 1", 1.5", 2", 2.5", 3". Perfect for all paint types.',
    price: 29.99,
    categoryName: 'საღებავები & საფარები',
    brand: 'Purdy',
    images: [{
      url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600',
      alt: 'Paint Brushes'
    }],
    stock: 35,
    inStock: true,
    rating: 4.8,
    reviews: 112,
    specifications: {
      'Pieces': '5',
      'Bristle': 'Synthetic',
      'Sizes': '1-3 inches'
    },
    tags: ['paint', 'brushes', 'purdy']
  },

  // Electrical
  {
    name: 'LED Work Light 50W',
    description: 'Portable LED work light with adjustable stand. 5000 lumens brightness, ideal for construction sites and workshops.',
    price: 69.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Brennenstuhl',
    images: [{
      url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600',
      alt: 'LED Work Light'
    }],
    stock: 20,
    inStock: true,
    rating: 4.6,
    reviews: 78,
    badge: 'New',
    specifications: {
      'Power': '50W',
      'Lumens': '5000lm',
      'Cable': '3m',
      'Stand': 'Adjustable'
    },
    tags: ['electrical', 'lighting', 'led']
  },
  {
    name: 'Extension Cable 25m Heavy Duty',
    description: 'Professional grade extension cable reel. 4 sockets, thermal overload protection, IP44 rated for outdoor use.',
    price: 54.99,
    categoryName: 'ინსტრუმენტები & სამუშაო ხელსაწყოები',
    brand: 'Brennenstuhl',
    images: [{
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      alt: 'Extension Cable'
    }],
    stock: 18,
    inStock: true,
    rating: 4.5,
    reviews: 92,
    specifications: {
      'Length': '25m',
      'Sockets': '4',
      'Rating': 'IP44',
      'Load': '3000W'
    },
    tags: ['electrical', 'cable', 'outdoor']
  },

  // Plumbing
  {
    name: 'Adjustable Wrench Set 3pcs',
    description: 'Chrome vanadium steel adjustable wrenches. Sizes: 6", 8", 10". Non-slip comfort grip handles.',
    price: 38.99,
    categoryName: 'სანტექნიკა & წყლის სისტემები',
    brand: 'Bahco',
    images: [{
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600',
      alt: 'Wrench Set'
    }],
    stock: 22,
    inStock: true,
    rating: 4.7,
    reviews: 156,
    badge: 'Popular',
    specifications: {
      'Pieces': '3',
      'Sizes': '6", 8", 10"',
      'Material': 'Chrome Vanadium'
    },
    tags: ['plumbing', 'wrench', 'bahco']
  },
  {
    name: 'PVC Pipe Cutter Professional',
    description: 'Precision pipe cutter for PVC, PE, and rubber hoses. Cuts pipes up to 42mm diameter. Ratchet mechanism for easy cutting.',
    price: 24.99,
    categoryName: 'სანტექნიკა & წყლის სისტემები',
    brand: 'Ridgid',
    images: [{
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600',
      alt: 'Pipe Cutter'
    }],
    stock: 28,
    inStock: true,
    rating: 4.6,
    reviews: 67,
    specifications: {
      'Max Diameter': '42mm',
      'Type': 'Ratchet',
      'Material': 'Hardened Steel'
    },
    tags: ['plumbing', 'cutter', 'pvc']
  },

  // Building Materials
  {
    name: 'Cement Mix 25kg',
    description: 'High-quality Portland cement for general construction use. Suitable for foundations, floors, and walls.',
    price: 12.99,
    categoryName: 'მოსაპირკეთებელი და საშენი ნარევები',
    brand: 'Heidelberg',
    images: [{
      url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=600',
      alt: 'Cement'
    }],
    stock: 100,
    inStock: true,
    rating: 4.5,
    reviews: 189,
    specifications: {
      'Weight': '25kg',
      'Type': 'Portland',
      'Yield': 'Approx 12L'
    },
    tags: ['building', 'cement', 'construction']
  },
  {
    name: 'Insulation Board 100mm 10pcs',
    description: 'Thermal insulation boards for walls and floors. High R-value, moisture resistant. Pack of 10 sheets.',
    price: 89.99,
    categoryName: 'მოსაპირკეთებელი და საშენი ნარევები',
    brand: 'Rockwool',
    images: [{
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600',
      alt: 'Insulation Board'
    }],
    stock: 45,
    inStock: true,
    rating: 4.7,
    reviews: 98,
    badge: 'Popular',
    specifications: {
      'Thickness': '100mm',
      'Pieces': '10',
      'Coverage': '5 sq.m'
    },
    tags: ['building', 'insulation', 'thermal']
  }
];

module.exports = products;
