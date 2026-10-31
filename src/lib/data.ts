import { ServiceItem, SpecialistItem, HighlightItem } from "@/types";

export const SALON_INFO = {
  name: "Salon EyeLines",
  tagline: "Elegance Redefined",
  address: "48, Ganegama Road, Aluthgama 12080, Sri Lanka",
  phone: "077 547 4996",
  phoneInternational: "+94775474996",
  whatsappUrl: "https://wa.me/94775474996",
  facebookUrl: "https://web.facebook.com/profile.php?id=61569979371238",
  facebookFollowers: "10,370+ Followers",
  hours: "Daily: 8:30 AM – 6:30 PM (Early 4:00 AM bridal slots on request)",
  founder: "Nayani Munasinghe",
  founderRole: "Founder & Master Bridal Director",
};

export const SERVICES: ServiceItem[] = [
  // 1. Eyelines & Lashes
  {
    id: "eye-01",
    name: "Signature Precision Eyeliner Definition",
    slug: "precision-eyeliner-definition",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    tagline: "Salon EyeLines Signature Craft",
    description: "Flawless custom eyeliner styling tailored to your eye anatomy. Precision application with long-lasting smudge-proof mineral pigmentation and winged perfection.",
    fullDetails: [
      "Micro-pigment anatomical framing tailored to your facial geometry",
      "Hypoallergenic, water-resistant luxury cosmetic formulations",
      "Includes personal eye-shape consultation and aftercare serum",
      "Ideal for daily effortless glamour and bridal portraits"
    ],
    priceLKR: 3500,
    durationMinutes: 45,
    durationFormatted: "45 mins",
    image: "/images/service_eyelines.jpg",
    isPopular: true
  },
  {
    id: "eye-02",
    name: "Luxury Keratin Lash Lift & Tint",
    slug: "keratin-lash-lift-tint",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    tagline: "Natural Flutter & Volume",
    description: "Nourishing keratin infusion that curls and defines your natural eyelashes from root to tip, complete with an intense deep-gloss black tint lasting 6-8 weeks.",
    fullDetails: [
      "Pure keratin hydrolysate infusion that strengthens hair protein",
      "Deep obsidian gloss tint replacing daily mascara application",
      "Gentle, zero-damage lifting shields suited for sensitive eyes",
      "Results stay pristine through swimming, humidity, and exercise"
    ],
    priceLKR: 5500,
    durationMinutes: 60,
    durationFormatted: "60 mins",
    image: "/images/service_eyelines.jpg",
    isPopular: true
  },
  {
    id: "eye-03",
    name: "Bespoke Eyebrow Micro-Sculpting & Henna Tint",
    slug: "eyebrow-sculpting-henna-tint",
    category: "eyes",
    categoryName: "Eyelines & Lash Lounge",
    tagline: "High-Definition Brow Architecture",
    description: "Golden-ratio mapping, precise threading, and gentle herbal henna shading to create symmetrical, naturally fuller, velvety eyebrows.",
    fullDetails: [
      "Custom facial symmetry measurement using golden-ratio calipers",
      "Ultra-fine organic cotton threading for clean, sharp lines",
      "Chemical-free botanical henna staining on skin and brow hairs",
      "Lasts up to 4 weeks with gradual, soft fading"
    ],
    priceLKR: 3000,
    durationMinutes: 45,
    durationFormatted: "45 mins",
    image: "/images/service_eyelines.jpg"
  },

  // 2. Bridal Couture
  {
    id: "bride-01",
    name: "Royal Kandyan Bridal Dressing Package",
    slug: "royal-kandyan-bridal-dressing",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    tagline: "Heritage Sri Lankan Opulence",
    description: "Traditional 7-necklace Nalalpatiya setting, hand-pleated Osari drapery, regal jewellery placement, and long-wear glowing bridal makeup for your unforgettable walk.",
    fullDetails: [
      "Master drape of the ceremonial Kandyan Osariya and frilled pleats",
      "Complete heirloom jewelry placement (Nalalpatiya, 7 padakkam chains, Agasti)",
      "Long-wear sweatproof HD camera makeup formulated for Sri Lankan climate",
      "Private air-conditioned bridal sanctum with family hospitality lounge",
      "Complimentary pre-wedding trial and skincare consultation with Nayani Munasinghe"
    ],
    priceLKR: 75000,
    durationMinutes: 240,
    durationFormatted: "4 hours",
    image: "/api/uploads/service_468526369_122108880824623362_1_1791827425872_7ppukm.jpg",
    isPopular: true
  },
  {
    id: "bride-02",
    name: "Modern Western / Christian Bridal Suite",
    slug: "modern-western-bridal-suite",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    tagline: "Airbrushed Contemporary Elegance",
    description: "Dewy glass-skin European complexion, romantic veil attachment, bespoke hair sculpting, and all-day touchup kit for ceremonies and receptions.",
    fullDetails: [
      "Radiant European bridal glass-skin foundation application",
      "Architectural veil anchoring and custom tiara or floral wreath fitting",
      "Textured bridal updo or Hollywood glam waves with heat-defense lock",
      "Assistance with corset lacing, petticoat fluffing, and train arrangement"
    ],
    priceLKR: 65000,
    durationMinutes: 210,
    durationFormatted: "3.5 hours",
    image: "/images/service_bridal.jpg",
    isPopular: true
  },
  {
    id: "bride-03",
    name: "Homecoming & Engagement Glamour Package",
    slug: "homecoming-engagement-glamour",
    category: "bridal",
    categoryName: "Bridal Couture Suite",
    tagline: "Radiant Second-Day Brilliance",
    description: "Fresh contemporary saree or evening gown draping, soft glam smokey or shimmer eye artistry, and voluminous red-carpet hairstyling.",
    fullDetails: [
      "Modern drape for georgette, silk, or designer lehengas",
      "Glamorous evening smokey or golden eye design with faux mink lashes",
      "Sculpted cheekbones, illuminating body shimmer, and touch-up kit"
    ],
    priceLKR: 45000,
    durationMinutes: 180,
    durationFormatted: "3 hours",
    image: "/images/service_bridal.jpg"
  },

  // 3. Facials & Skincare
  {
    id: "skin-01",
    name: "Diamond Radiance Glow Facial",
    slug: "diamond-radiance-glow-facial",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    tagline: "Ultimate Youthful Luminous Glow",
    description: "Diamond microdermabrasion exfoliation, deep ultrasonic pore cleansing, gold peptide infusion serum, and a soothing cooling algae peel-off mask.",
    fullDetails: [
      "Precision diamond tip vacuum exfoliation removing dull dead skin cells",
      "Ultrasonic scrubber removing deep blackheads and sebum deposits",
      "24K gold nano-peptide serum infused with cool galvanic iontophoresis",
      "Marine alginate peel-off mask locking in moisture and calming redness"
    ],
    priceLKR: 8500,
    durationMinutes: 75,
    durationFormatted: "75 mins",
    image: "/images/service_facial.jpg",
    isPopular: true
  },
  {
    id: "skin-02",
    name: "Deep Hydration Herbal Glow Facial",
    slug: "deep-hydration-herbal-facial",
    category: "facials",
    categoryName: "Skin Glow & Facials",
    tagline: "Ayurvedic Botanical Nourishment",
    description: "Infused with pure organic aloe vera, sandalwood, and rose extract. Restores moisture balance, soothes sun damage, and revives tired skin.",
    fullDetails: [
      "Gentle herbal steam with eucalyptus and lavender essential oil",
      "Warm sandalwood paste massage stimulating lymphatic drainage",
      "Fresh aloe vera cold compress providing instant hydration"
    ],
    priceLKR: 5500,
    durationMinutes: 60,
    durationFormatted: "60 mins",
    image: "/images/service_facial.jpg"
  },

  // 4. Hair Couture
  {
    id: "hair-01",
    name: "Brazilian Keratin Smoothing Infusion",
    slug: "brazilian-keratin-smoothing",
    category: "hair",
    categoryName: "Hair Couture & Care",
    tagline: "Silky, Frizz-Free Glass Hair",
    description: "Intensive formaldehyde-free keratin treatment that seals cuticles, eliminates tropical humidity frizz, and imparts mirror-like shine for up to 5 months.",
    fullDetails: [
      "Formaldehyde-free organic amino acid and keratin protein formula",
      "Seals porous hair cuticles against tropical coastal humidity",
      "Reduces daily styling time by 70% with sleek wash-and-go finish",
      "Includes post-treatment sulfate-free shampoo counseling"
    ],
    priceLKR: 18000,
    durationMinutes: 150,
    durationFormatted: "2.5 hours",
    image: "/images/service_hair.jpg",
    isPopular: true
  },
  {
    id: "hair-02",
    name: "Custom French Balayage & Gloss Toner",
    slug: "french-balayage-gloss-toner",
    category: "hair",
    categoryName: "Hair Couture & Care",
    tagline: "Sun-Kissed Dimensional Color",
    description: "Hand-painted dimensional highlights blended seamlessly from dark roots into warm caramel, mocha, or golden blonde tones with Olaplex protection.",
    fullDetails: [
      "Freehand hand-painted painting technique creating seamless grow-out",
      "Integrated Olaplex bond multiplier protecting hair strength",
      "Acidic gloss toner imparting multidimensional reflect and shine"
    ],
    priceLKR: 16000,
    durationMinutes: 150,
    durationFormatted: "2.5 hours",
    image: "/images/service_hair.jpg"
  },

  // 5. Nails & Spa
  {
    id: "nail-01",
    name: "Deluxe Gel Manicure with Minimalist Art",
    slug: "deluxe-gel-manicure-art",
    category: "nails",
    categoryName: "Nail Lounge & Spa",
    tagline: "Chip-Free High-Gloss Elegance",
    description: "Cuticle care, nail shaping, premium gel polish with delicate gold foil or champagne French accents, cured under low-heat LED.",
    fullDetails: [
      "Dry Russian manicure cuticle cleaning and almond/square shaping",
      "Non-toxic 7-free gel polish with high-shine top coat",
      "Subtle champagne gold foil, chrome, or bridal French tips",
      "Relaxing almond oil hand and wrist massage"
    ],
    priceLKR: 4500,
    durationMinutes: 60,
    durationFormatted: "60 mins",
    image: "/images/service_nails.jpg",
    isPopular: true
  },
  {
    id: "nail-02",
    name: "Aromatherapy Foot Spa & Pedicure Ritual",
    slug: "aromatherapy-foot-spa-pedicure",
    category: "nails",
    categoryName: "Nail Lounge & Spa",
    tagline: "Complete Foot Rejuvenation",
    description: "Warm floral foot bath with Himalayan pink salt, exfoliating pumice scrub, pressure-point reflexology massage, and perfect toenail shaping.",
    fullDetails: [
      "Floral soak with rose petals, peppermint oils, and Epsom salts",
      "Volcanic pumice stone calloused skin smoothing",
      "Deep reflexology massage stimulating circulation",
      "Long-wear breathable polish application"
    ],
    priceLKR: 5000,
    durationMinutes: 60,
    durationFormatted: "60 mins",
    image: "/images/service_nails.jpg"
  }
];

export const SPECIALISTS: SpecialistItem[] = [
  {
    id: "spec-01",
    name: "Nayani Munasinghe",
    role: "Founder & Master Bridal Director",
    experience: "15+ Years Experience",
    bio: "Renowned along the Southern coastline for breathtaking Kandyan and Western bridal transformations. Renowned for her gentle touch, punctuality, and artistic perfection.",
    specialties: ["Royal Kandyan Dressing", "Airbrush Makeup", "Bridal Consultations"],
    avatar: "/images/nayani_munasinghe.jpg"
  },
  {
    id: "spec-02",
    name: "Dilini Senanayake",
    role: "Senior Eyeliner & Lash Artist",
    experience: "8 Years Experience",
    bio: "Certified lash & brow specialist trained in high-definition symmetry, precision eyelines, and Russian volume lashes.",
    specialties: ["Precision Eyeliner", "Lash Lifts", "Henna Brow Sculpting"]
  },
  {
    id: "spec-03",
    name: "Kaveesha Perera",
    role: "Master Hair Stylist & Balayage Colorist",
    experience: "9 Years Experience",
    bio: "Master of modern hair geometry, balayage color transformations, and intensive keratin restoration therapies.",
    specialties: ["French Balayage", "Brazilian Keratin", "Bridal Hair Art"]
  },
  {
    id: "spec-04",
    name: "Sachini Fernando",
    role: "Aesthetic Skin & Nail Care Therapist",
    experience: "6 Years Experience",
    bio: "Holistic skincare specialist dedicated to diamond radiance facials and delicate bespoke nail artistry.",
    specialties: ["Diamond Facials", "Gel Extensions", "Aromatherapy Spa"]
  }
];

export const HIGHLIGHTS: HighlightItem[] = [
  {
    number: "01",
    title: "Signature Eyelines Artistry",
    subtitle: "Precision Micro-Definition",
    description: "Bespoke eye framing and crisp liner aesthetics suited to your natural facial contours."
  },
  {
    number: "02",
    title: "Private Bridal Sanctum",
    subtitle: "Undisturbed Dressing Suite",
    description: "Exclusive air-conditioned private dressing rooms ensuring serenity and family comfort on your wedding day."
  },
  {
    number: "03",
    title: "100% Certified Cosmetologists",
    subtitle: "Master Level Expertise",
    description: "Every beauty specialist at Salon EyeLines is professionally credentialed and continuously trained in global trends."
  },
  {
    number: "04",
    title: "Premium Global Beauty Brands",
    subtitle: "Dermatologically Tested",
    description: "Genuine salon-grade formulations from L'Oréal Professionnel, Olaplex, and clinical skincare."
  },
  {
    number: "05",
    title: "Complimentary Dedicated Parking",
    subtitle: "Ganegama Road Studio",
    description: "Spacious, hassle-free parking right in front of our studio in Aluthgama with secure access."
  },
  {
    number: "06",
    title: "In-Depth Skin & Hair Analysis",
    subtitle: "Free Pre-Consultation",
    description: "We examine your skin sensitivity and hair texture before beginning any chemical or bridal process."
  },
  {
    number: "07",
    title: "Medical-Grade Sterilization",
    subtitle: "Autoclave & Disposables",
    description: "Single-use disposables, UV-sterilized scissors, and medical-grade hygiene protocols for complete safety."
  },
  {
    number: "08",
    title: "Lounge Refreshments & Free Wi-Fi",
    subtitle: "Warm Hospitality",
    description: "Enjoy Ceylon herbal teas, artisanal coffee, soothing spa music, and high-speed Wi-Fi during your visit."
  },
  {
    number: "09",
    title: "Flexible VIP Early-Bird Hours",
    subtitle: "Auspicious Timings (Nekath)",
    description: "For weddings and auspicious Sri Lankan Nekath times, our dedicated team opens as early as 4:00 AM upon request."
  },
  {
    number: "10",
    title: "Instant Digital & WhatsApp Booking",
    subtitle: "Real-Time Confirmation",
    description: "Book online in 60 seconds with instant WhatsApp verification, booking reference codes, and reminders."
  }
];

export const TIME_SLOTS = [
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

export const GALLERY_ITEMS = [
  { id: "g1", title: "Royal Kandyan Bridal Mastery", category: "Bridal", image: "/images/service_bridal.jpg" },
  { id: "g2", title: "Signature Precision Eyeliner", category: "Eyes", image: "/images/service_eyelines.jpg" },
  { id: "g3", title: "Luminous Diamond Glow Treatment", category: "Skin", image: "/images/service_facial.jpg" },
  { id: "g4", title: "Glossy Brazilian Keratin Finish", category: "Hair", image: "/images/service_hair.jpg" },
  { id: "g5", title: "Minimalist Bridal French Gel Art", category: "Nails", image: "/images/service_nails.jpg" },
  { id: "g6", title: "Serene Salon Ambience & Reception", category: "Interior", image: "/images/salon_hero.jpg" }
];
