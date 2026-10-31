// Salon EyeLines - Services & Treatments Catalog
// Complete price list, durations, and details tailored for Aluthgama, Sri Lanka

const SALON_SERVICES = [
  // --- SIGNATURE EYELINES & LASH LOUNGE ---
  {
    id: "eye-01",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    name: "Signature Precision Eyeliner Definition",
    tagline: "Salon EyeLines Signature Craft",
    duration: "45 mins",
    durationMin: 45,
    priceLKR: 3500,
    popular: true,
    image: "assets/images/service_eyelines.jpg",
    description: "Flawless custom eyeliner styling tailored to your eye anatomy. Precision application with long-lasting smudge-proof mineral pigmentation and winged perfection."
  },
  {
    id: "eye-02",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    name: "Luxury Keratin Lash Lift & Tint",
    tagline: "Natural Flutter & Volume",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 5500,
    popular: true,
    image: "assets/images/service_eyelines.jpg",
    description: "Nourishing keratin infusion that curls and defines your natural eyelashes from root to tip, complete with an intense deep-gloss black tint lasting 6-8 weeks."
  },
  {
    id: "eye-03",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    name: "Bespoke Eyebrow Micro-Sculpting & Henna Tint",
    tagline: "High-Definition Brow Architecture",
    duration: "45 mins",
    durationMin: 45,
    priceLKR: 3000,
    popular: false,
    image: "assets/images/service_eyelines.jpg",
    description: "Golden-ratio mapping, precise threading, and gentle herbal henna shading to create symmetrical, naturally fuller, velvety eyebrows."
  },
  {
    id: "eye-04",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    name: "Russian Volume Silk Lash Extensions",
    tagline: "Dramatic Featherlight Glamour",
    duration: "90 mins",
    durationMin: 90,
    priceLKR: 8500,
    popular: false,
    image: "assets/images/service_eyelines.jpg",
    description: "Ultra-fine multi-dimensional silk lash fans handcrafted and applied to individual lashes for an ethereal, full-glamour eye look."
  },

  // --- BRIDAL COUTURE & DRESSING ---
  {
    id: "bride-01",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    name: "Royal Kandyan Bridal Dressing Package",
    tagline: "Traditional Splendor & Modern Perfection",
    duration: "240 mins",
    durationMin: 240,
    priceLKR: 75000,
    popular: true,
    image: "assets/images/service_bridal.jpg",
    description: "Complete royal bridal makeover including traditional Osariya drape, antique headpiece (Nalalpatiya) placement, 7-necklace setting, HD waterproof makeup, and floral hair design."
  },
  {
    id: "bride-02",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    name: "Modern Western / Christian Bridal Suite",
    tagline: "Graceful Luminous Elegance",
    duration: "210 mins",
    durationMin: 210,
    priceLKR: 65000,
    popular: true,
    image: "assets/images/service_bridal.jpg",
    description: "Dewy glass-skin bridal makeup, bespoke European veil & tiara arrangement, couture hair styling, manicured hand polish, and luxury dressing assistance."
  },
  {
    id: "bride-03",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    name: "Homecoming & Engagement Glamour Package",
    tagline: "Radiant Evening Transformation",
    duration: "180 mins",
    durationMin: 180,
    priceLKR: 45000,
    popular: false,
    image: "assets/images/service_bridal.jpg",
    description: "Sophisticated red carpet evening look, saree/lehenga draping, airbrush HD makeup, and long-lasting textured hair waves."
  },
  {
    id: "bride-04",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    name: "Bridal Party & Bridesmaid Elegance",
    tagline: "Coordinated Bridal Entourage Glow",
    duration: "90 mins",
    durationMin: 90,
    priceLKR: 18000,
    popular: false,
    image: "assets/images/service_bridal.jpg",
    description: "Camera-ready soft glam makeup, professional hair updo or soft curls, and expert saree or gown dressing for bridesmaids and mothers of the bride."
  },

  // --- SKINCARE & RADIANCE FACIALS ---
  {
    id: "skin-01",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    name: "EyeLines Diamond Radiance Facial",
    tagline: "Ultimate Youthful Luminous Glow",
    duration: "75 mins",
    durationMin: 75,
    priceLKR: 8500,
    popular: true,
    image: "assets/images/service_facial.jpg",
    description: "Diamond microdermabrasion exfoliation, deep ultrasonic pore cleansing, gold peptide infusion serum, and a soothing cooling algae peel-off mask."
  },
  {
    id: "skin-02",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    name: "Deep Hydration Herbal Glow Facial",
    tagline: "Ayurvedic Botanical Nourishment",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 5500,
    popular: false,
    image: "assets/images/service_facial.jpg",
    description: "Infused with pure organic aloe vera, sandalwood, and rose extract. Restores moisture balance, soothes sun damage, and revives tired skin."
  },
  {
    id: "skin-03",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    name: "Anti-Acne Purifying & Clarifying Therapy",
    tagline: "Pore Clearing & Skin Balancing",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 6500,
    popular: false,
    image: "assets/images/service_facial.jpg",
    description: "Salicylic & tea-tree antibacterial treatment with high-frequency therapy, targeted extractions, and pore-tightening botanical compresses."
  },
  {
    id: "skin-04",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    name: "High-Frequency Collagen Lifting Treatment",
    tagline: "Non-Invasive Sculpting & Tightening",
    duration: "90 mins",
    durationMin: 90,
    priceLKR: 12000,
    popular: true,
    image: "assets/images/service_facial.jpg",
    description: "Targeted micro-current stimulation with bio-collagen ampoules to lift cheekbones, tighten jawlines, and minimize fine lines."
  },

  // --- HAIR DESIGN, COLOR & TREATMENTS ---
  {
    id: "hair-01",
    category: "hair",
    categoryName: "Hair Couture & Care",
    name: "Brazilian Keratin Smoothing Infusion",
    tagline: "Silky, Frizz-Free Glass Hair",
    duration: "150 mins",
    durationMin: 150,
    priceLKR: 18000,
    popular: true,
    image: "assets/images/service_hair.jpg",
    description: "Intensive formaldehyde-free keratin treatment that seals cuticles, eliminates tropical humidity frizz, and imparts mirror-like shine for up to 5 months."
  },
  {
    id: "hair-02",
    category: "hair",
    categoryName: "Hair Couture & Care",
    name: "Permanent Silk Rebonding & Protein Shield",
    tagline: "Pin-Straight Luxury Silk Finish",
    duration: "180 mins",
    durationMin: 180,
    priceLKR: 22000,
    popular: false,
    image: "assets/images/service_hair.jpg",
    description: "Japanese thermal straightening enhanced with deep bonding proteins to keep hair soft, touchably smooth, and straight with healthy movement."
  },
  {
    id: "hair-03",
    category: "hair",
    categoryName: "Hair Couture & Care",
    name: "Custom French Balayage & Gloss Toner",
    tagline: "Sun-Kissed Dimensional Color",
    duration: "150 mins",
    durationMin: 150,
    priceLKR: 16000,
    popular: true,
    image: "assets/images/service_hair.jpg",
    description: "Hand-painted dimensional highlights blended seamlessly from dark roots into warm caramel, mocha, or golden blonde tones with Olaplex protection."
  },
  {
    id: "hair-04",
    category: "hair",
    categoryName: "Hair Couture & Care",
    name: "Precision Cut, Scalp Detox & Blowout",
    tagline: "Signature Salon Styling",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 4500,
    popular: false,
    image: "assets/images/service_hair.jpg",
    description: "Expert face-framing cut, invigorating clarifying scalp massage with botanical oils, and our bouncy signature salon blowout."
  },

  // --- NAIL STUDIO & FOOT SPA ---
  {
    id: "nail-01",
    category: "nails",
    categoryName: "Nail Lounge & Spa",
    name: "Deluxe Gel Manicure with Minimalist Art",
    tagline: "Chip-Free High-Gloss Elegance",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 4500,
    popular: true,
    image: "assets/images/service_nails.jpg",
    description: "Cuticle care, nail shaping, premium gel polish with delicate gold foil or champagne French accents, cured under low-heat LED."
  },
  {
    id: "nail-02",
    category: "nails",
    categoryName: "Nail Lounge & Spa",
    name: "Aromatherapy Foot Spa & Pedicure Ritual",
    tagline: "Complete Foot Rejuvenation",
    duration: "60 mins",
    durationMin: 60,
    priceLKR: 5000,
    popular: false,
    image: "assets/images/service_nails.jpg",
    description: "Warm floral foot bath with Himalayan pink salt, exfoliating pumice scrub, pressure-point reflexology massage, and perfect toenail shaping."
  },
  {
    id: "nail-03",
    category: "nails",
    categoryName: "Nail Lounge & Spa",
    name: "Bridal Acrylic / Polygel Sculpted Extensions",
    tagline: "Flawless Bridal Nails",
    duration: "90 mins",
    durationMin: 90,
    priceLKR: 8500,
    popular: false,
    image: "assets/images/service_nails.jpg",
    description: "Natural-look extensions with Swarovski crystal or pearlescent chrome embellishments designed specifically to complement your wedding rings."
  }
];

// Stylists / Specialists at Salon EyeLines
const SALON_SPECIALISTS = [
  {
    id: "stylist-01",
    name: "Nayani Munasinghe",
    role: "Founder & Master Bridal Director",
    experience: "15+ Years Experience",
    bio: "Visionary founder of Salon EyeLines. Renowned along the Southern coastline for breathtaking Kandyan and Western bridal transformations.",
    specialties: ["Royal Kandyan Dressing", "Airbrush Makeup", "Bridal Consultations"]
  },
  {
    id: "stylist-02",
    name: "Dilini Senanayake",
    role: "Senior Eyeliner & Lash Artist",
    experience: "8 Years Experience",
    bio: "Certified lash & brow specialist trained in high-definition symmetry, precision eyelines, and Russian volume lashes.",
    specialties: ["Precision Eyeliner", "Lash Lifts", "Henna Brow Sculpting"]
  },
  {
    id: "stylist-03",
    name: "Kasuni Fernando",
    role: "Lead Hair Stylist & Colorist",
    experience: "9 Years Experience",
    bio: "Master of modern hair geometry, balayage color transformations, and intensive keratin restoration therapies.",
    specialties: ["Balayage", "Brazilian Keratin", "Bridal Hair Art"]
  },
  {
    id: "stylist-04",
    name: "Sachini Perera",
    role: "Senior Aesthetician & Nail Artist",
    experience: "6 Years Experience",
    bio: "Holistic skincare specialist dedicated to diamond radiance facials and delicate bespoke nail artistry.",
    specialties: ["Diamond Facials", "Gel Art Extensions", "Aromatherapy Spa"]
  }
];

// Available Time Slots Configuration
const TIME_SLOTS = [
  "08:30 AM",
  "09:30 AM",
  "10:45 AM",
  "11:45 AM",
  "01:15 PM",
  "02:30 PM",
  "03:45 PM",
  "04:45 PM",
  "05:45 PM"
];

// The 10 Besonderheiten (Highlights) adapted from Kosmetik Aurora
const SALON_HIGHLIGHTS = [
  {
    number: "01",
    title: "Signature Eyelines Artistry",
    subtitle: "Precision Micro-Definition",
    description: "Our signature technique provides bespoke eye framing and crisp liner aesthetics suited to your natural facial contours.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
  },
  {
    number: "02",
    title: "Private Bridal Sanctum",
    subtitle: "Undisturbed Dressing Suite",
    description: "Exclusive air-conditioned private dressing rooms ensuring absolute serenity, dignity, and family comfort on your wedding day.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  },
  {
    number: "03",
    title: "100% Certified Cosmetologists",
    subtitle: "Master Level Expertise",
    description: "Every beauty specialist at Salon EyeLines is professionally credentialed and continuously trained in global beauty trends.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    number: "04",
    title: "Premium Global Beauty Brands",
    subtitle: "Dermatologically Tested",
    description: "We use only genuine international salon-grade formulations from L'Oréal Professionnel, Olaplex, and medical-grade skincare.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`
  },
  {
    number: "05",
    title: "Complimentary Dedicated Parking",
    subtitle: "Ganegama Road Studio",
    description: "Spacious, hassle-free parking right in front of our studio in Aluthgama with secure access.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`
  },
  {
    number: "06",
    title: "In-Depth Skin & Hair Analysis",
    subtitle: "Free 15-Min Pre-Consultation",
    description: "We examine your skin sensitivity and hair texture before beginning any chemical or bridal process.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`
  },
  {
    number: "07",
    title: "Medical-Grade Sterilization",
    subtitle: "Autoclave & Disposables",
    description: "Single-use disposables, UV-sterilized scissors, and medical-grade hygiene protocols for complete safety.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
  },
  {
    number: "08",
    title: "Lounge Refreshments & Free Wi-Fi",
    subtitle: "Warm Hospitality",
    description: "Enjoy Ceylon herbal teas, artisanal coffee, soothing spa music, and high-speed Wi-Fi during your transformation.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`
  },
  {
    number: "09",
    title: "Flexible VIP Early-Bird Hours",
    subtitle: "Bridal Auspicious Timings (Nekath)",
    description: "For weddings and auspicious Sri Lankan Nekath times, our dedicated bridal team opens as early as 4:00 AM upon request.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    number: "10",
    title: "Instant Digital & WhatsApp Booking",
    subtitle: "Real-Time Confirmation",
    description: "Book online in 60 seconds with instant WhatsApp verification, booking reference codes, and calendar reminders.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
  }
];

// Client Testimonials from Aluthgama & South Coast Clients
const SALON_TESTIMONIALS = [
  {
    clientName: "Sanduni Jayawardena",
    location: "Bentota & Aluthgama",
    rating: 5,
    service: "Royal Kandyan Bridal Dressing",
    review: "Nayani Munasinghe and the EyeLines team made my dream wedding come alive! The Osariya drape stayed immaculate all day, and the makeup was so radiant yet natural. Truly world-class salon service right here in Aluthgama!",
    date: "February 2026"
  },
  {
    clientName: "Hasini Wickramasinghe",
    location: "Beruwala",
    rating: 5,
    service: "Signature Eyeliner & Keratin Lash Lift",
    review: "I have been coming to Salon EyeLines for 3 years now. Nobody does precision eyeliner and lash lifts with such delicate perfection. My eyes looked mesmerizing without needing mascara for 2 months!",
    date: "January 2026"
  },
  {
    clientName: "Natasha Perera",
    location: "Kalutara",
    rating: 5,
    service: "Brazilian Keratin Smoothing & Balayage",
    review: "The interior feels just like a luxury European spa in Vienna or Paris. Soft champagne tones, calm music, and incredibly polite stylists. My frizzy hair is now glossy silk. Worth every rupee!",
    date: "December 2025"
  }
];
