import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Salon EyeLines database in Supabase PostgreSQL...");

  // 1. Create or update Salon business entity
  const salon = await prisma.salon.upsert({
    where: { slug: "salon-eyelines" },
    update: {},
    create: {
      name: "Salon EyeLines",
      tagline: "Elegance Redefined • Haute Beauté & Bridal Sanctuary",
      slug: "salon-eyelines",
      phone: "+94775474996",
      whatsappNumber: "+94775474996",
      email: "eyelinessalon@gmail.com",
      address: "48, Ganegama Road, Aluthgama 12080, Sri Lanka",
      latitude: 6.425,
      longitude: 79.995,
      currency: "LKR",
      logoUrl: "/images/salon_eyelines_logo.jpg",
      heroImageUrl: "/images/salon_hero.jpg"
    }
  });

  console.log(`Salon created/found: ${salon.name} (${salon.id})`);

  // 2. Seed Master Services
  const initialServices = [
    {
      id: "eye-01",
      name: "Signature Precision Eyeliner Definition",
      slug: "precision-eyeliner-definition",
      category: "eyes",
      categoryName: "Eyelines & Lash Lounge",
      tagline: "Salon EyeLines Signature Craft",
      description: "Flawless custom eyeliner styling tailored to your eye anatomy. Precision application with long-lasting smudge-proof mineral pigmentation and winged perfection.",
      priceLKR: 3500,
      durationMinutes: 45,
      imageUrl: "/images/service_eyelines.jpg",
      isPopular: true,
      sortOrder: 1
    },
    {
      id: "eye-02",
      name: "Luxury Keratin Lash Lift & Tint",
      slug: "keratin-lash-lift-tint",
      category: "eyes",
      categoryName: "Eyelines & Lash Lounge",
      tagline: "Natural Flutter & Volume",
      description: "Nourishing keratin infusion that curls and defines your natural eyelashes from root to tip, complete with an intense deep-gloss black tint lasting 6-8 weeks.",
      priceLKR: 5500,
      durationMinutes: 60,
      imageUrl: "/images/service_eyelines.jpg",
      isPopular: true,
      sortOrder: 2
    },
    {
      id: "eye-03",
      name: "Bespoke Eyebrow Micro-Sculpting & Henna Tint",
      slug: "eyebrow-sculpting-henna-tint",
      category: "eyes",
      categoryName: "Eyelines & Lash Lounge",
      tagline: "High-Definition Brow Architecture",
      description: "Golden-ratio mapping, precise threading, and gentle herbal henna shading to create symmetrical, naturally fuller, velvety eyebrows.",
      priceLKR: 3000,
      durationMinutes: 45,
      imageUrl: "/images/service_eyelines.jpg",
      isPopular: false,
      sortOrder: 3
    },
    {
      id: "bride-01",
      name: "Royal Kandyan Bridal Dressing Package",
      slug: "royal-kandyan-bridal-dressing",
      category: "bridal",
      categoryName: "Bridal Couture Suite",
      tagline: "Heritage Sri Lankan Opulence",
      description: "Traditional 7-necklace Nalalpatiya setting, hand-pleated Osari drapery, regal jewellery placement, and long-wear glowing bridal makeup for your unforgettable walk.",
      priceLKR: 75000,
      durationMinutes: 240,
      imageUrl: "/images/service_bridal.jpg",
      isPopular: true,
      sortOrder: 4
    },
    {
      id: "bride-02",
      name: "Modern Western / Christian Bridal Suite",
      slug: "western-bridal-suite",
      category: "bridal",
      categoryName: "Bridal Couture Suite",
      tagline: "Airbrushed Contemporary Elegance",
      description: "Dewy glass-skin European complexion, romantic veil attachment, bespoke hair sculpting, and all-day touchup kit for ceremonies and receptions.",
      priceLKR: 65000,
      durationMinutes: 210,
      imageUrl: "/images/service_bridal.jpg",
      isPopular: true,
      sortOrder: 5
    },
    {
      id: "bride-03",
      name: "Homecoming & Engagement Glamour Package",
      slug: "homecoming-engagement-glamour",
      category: "bridal",
      categoryName: "Bridal Couture Suite",
      tagline: "Radiant Second-Day Brilliance",
      description: "Fresh contemporary saree or evening gown draping, soft glam smokey or shimmer eye artistry, and voluminous red-carpet hairstyling.",
      priceLKR: 45000,
      durationMinutes: 180,
      imageUrl: "/images/service_bridal.jpg",
      isPopular: false,
      sortOrder: 6
    },
    {
      id: "face-01",
      name: "Diamond Radiance Glow Facial",
      slug: "diamond-radiance-glow-facial",
      category: "facials",
      categoryName: "Skin Glow & Facials",
      tagline: "Micro-Exfoliation & Peptide Infusion",
      description: "Clinical micro-polishing diamond peel to slough dead cells, followed by pure marine collagen serum sonophoresis and cooling jade gua-sha lymphatic drainage.",
      priceLKR: 8500,
      durationMinutes: 75,
      imageUrl: "/images/service_facial.jpg",
      isPopular: true,
      sortOrder: 7
    },
    {
      id: "face-02",
      name: "Deep Hydration Herbal Glow Facial",
      slug: "deep-hydration-herbal-facial",
      category: "facials",
      categoryName: "Skin Glow & Facials",
      tagline: "Botanical Ayurvedic Rebalance",
      description: "Steam ozone pore cleanse, sandalwood and turmeric clarifying mask, and rich aloe vera hydro-jelly lock to soothe sun-exposed and sensitive skin.",
      priceLKR: 5500,
      durationMinutes: 60,
      imageUrl: "/images/service_facial.jpg",
      isPopular: false,
      sortOrder: 8
    },
    {
      id: "hair-01",
      name: "Brazilian Keratin Smoothing Infusion",
      slug: "brazilian-keratin-smoothing",
      category: "hair",
      categoryName: "Hair Couture & Care",
      tagline: "Zero Frizz Humidity Defense",
      description: "Formaldehyde-free luxury keratin thermal sealing that transforms rebellious, frizzy hair into silky, mirror-shine tresses lasting up to 5 months.",
      priceLKR: 18000,
      durationMinutes: 150,
      imageUrl: "/images/service_hair.jpg",
      isPopular: true,
      sortOrder: 9
    },
    {
      id: "hair-02",
      name: "Custom French Balayage & Gloss Toner",
      slug: "french-balayage-gloss-toner",
      category: "hair",
      categoryName: "Hair Couture & Care",
      tagline: "Seamless Sun-Kissed Dimension",
      description: "Freehand hand-painted lightness tailored to your skin undertone, finished with an acid-bonding gloss glaze for multidimensional depth and softness.",
      priceLKR: 16000,
      durationMinutes: 150,
      imageUrl: "/images/service_hair.jpg",
      isPopular: false,
      sortOrder: 10
    },
    {
      id: "nail-01",
      name: "Deluxe Gel Manicure with Minimalist Art",
      slug: "deluxe-gel-manicure-art",
      category: "nails",
      categoryName: "Nail Lounge & Spa",
      tagline: "Long-Wearing High-Gloss Shield",
      description: "Russian cuticle grooming, strengthening rubber base layer, chip-proof gel lacquer, and gold foil or micro-chrome line art accents.",
      priceLKR: 4500,
      durationMinutes: 60,
      imageUrl: "/images/service_nails.jpg",
      isPopular: false,
      sortOrder: 11
    },
    {
      id: "nail-02",
      name: "Aromatherapy Foot Spa & Pedicure Ritual",
      slug: "aromatherapy-foot-spa-pedicure",
      category: "nails",
      categoryName: "Nail Lounge & Spa",
      tagline: "Epsom Salt & Peppermint Foot Relief",
      description: "Warm herbal foot soak, volcanic pumice callus smoothing, organic sugar cane scrub, acupressure leg massage, and breathable nail polish finish.",
      priceLKR: 5000,
      durationMinutes: 60,
      imageUrl: "/images/service_nails.jpg",
      isPopular: false,
      sortOrder: 12
    }
  ];

  for (const s of initialServices) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        priceLKR: s.priceLKR,
        durationMinutes: s.durationMinutes,
        description: s.description,
        category: s.category,
        categoryName: s.categoryName,
        tagline: s.tagline,
        imageUrl: s.imageUrl,
        isPopular: s.isPopular
      },
      create: {
        id: s.id,
        salonId: salon.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        categoryName: s.categoryName,
        tagline: s.tagline,
        description: s.description,
        priceLKR: s.priceLKR,
        durationMinutes: s.durationMinutes,
        imageUrl: s.imageUrl,
        isPopular: s.isPopular,
        sortOrder: s.sortOrder
      }
    });
  }

  console.log(`Seeded ${initialServices.length} master salon services.`);

  // 3. Seed Specialists / Staff
  const initialStaff = [
    {
      id: "spec-01",
      name: "Nayani Munasinghe",
      role: "Founder & Master Bridal Director",
      experience: "15+ Years Experience",
      bio: "Trained under elite international beauty educators with 15+ years of bridal artistry across Sri Lanka. Known for her signature precision eyeliner work, bespoke Kandyan Osari draping, and calming sanctuary touch."
    },
    {
      id: "spec-02",
      name: "Dilini Senanayake",
      role: "Senior Eyelines & Lash Artisan",
      experience: "8 Years Experience",
      bio: "Certified lash lifting and brow architecture specialist with deep expertise in hypoallergenic cosmetic formulas and facial symmetry mapping."
    },
    {
      id: "spec-03",
      name: "Kaveesha Perera",
      role: "Master Hair Stylist & Balayage Colorist",
      experience: "10 Years Experience",
      bio: "Expert in Brazilian keratin therapy, modern dimensional hair coloring, and precision bridal couture hair sculpting."
    },
    {
      id: "spec-04",
      name: "Sachini Fernando",
      role: "Aesthetic Skin & Nail Care Therapist",
      experience: "7 Years Experience",
      bio: "Specializing in diamond microdermabrasion, revitalizing Ayurvedic herbal facials, and luxury nail health rituals."
    }
  ];

  for (const st of initialStaff) {
    await prisma.staff.upsert({
      where: { id: st.id },
      update: {
        name: st.name,
        role: st.role,
        experience: st.experience,
        bio: st.bio
      },
      create: {
        id: st.id,
        salonId: salon.id,
        name: st.name,
        role: st.role,
        experience: st.experience,
        bio: st.bio
      }
    });
  }

  console.log(`Seeded ${initialStaff.length} staff specialists.`);

  // 4. Seed Master Admin User (Nayani Munasinghe)
  const crypto = await import("crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@saloneyelines.com";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "EyeLines@2026!";
  const adminHash = salt + ":" + crypto.scryptSync(adminPassword, salt, 64).toString("hex");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Nayani Munasinghe",
      role: "SALON_OWNER",
      passwordHash: adminHash
    },
    create: {
      email: adminEmail,
      name: "Nayani Munasinghe",
      role: "SALON_OWNER",
      passwordHash: adminHash
    }
  });
  console.log(`Seeded master admin account: ${adminEmail} (Role: SALON_OWNER)`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
