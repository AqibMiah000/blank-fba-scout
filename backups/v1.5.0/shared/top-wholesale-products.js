/**
 * BLANK FBA SCOUT - Top 100 FBA Wholesale Products Directory
 * Curated high-velocity evergreen wholesale opportunities with price targets, ROI, and sourcing links.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TopWholesaleProducts = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PRODUCTS = [
    // --- KITCHEN & DINING ---
    { id: 1, name: "Silicone Cooking Utensils Set (12-Piece)", category: "Kitchen & Dining", typicalBsr: 1200, estMonthlySales: 2100, retailPrice: 26.99, targetCost: 6.50, estProfit: 8.20, roi: 126, query: "silicone kitchen utensils set 12 heat resistant" },
    { id: 2, name: "Stainless Steel Measuring Spoons (Set of 6)", category: "Kitchen & Dining", typicalBsr: 1850, estMonthlySales: 1650, retailPrice: 14.99, targetCost: 2.80, estProfit: 5.10, roi: 182, query: "stainless steel measuring spoons set engraved" },
    { id: 3, name: "Digital Instant Read Meat Thermometer", category: "Kitchen & Dining", typicalBsr: 850, estMonthlySales: 2800, retailPrice: 16.99, targetCost: 3.40, estProfit: 6.15, roi: 180, query: "digital meat thermometer waterproof backlight" },
    { id: 4, name: "Reusable Silicone Baking Mats (2-Pack)", category: "Kitchen & Dining", typicalBsr: 2200, estMonthlySales: 1400, retailPrice: 15.99, targetCost: 3.00, estProfit: 5.80, roi: 193, query: "silicone baking mats non stick sheet macaron" },
    { id: 5, name: "Heavy Duty French Press Coffee Maker (34oz)", category: "Kitchen & Dining", typicalBsr: 3100, estMonthlySales: 1100, retailPrice: 29.99, targetCost: 7.50, estProfit: 9.80, roi: 130, query: "french press glass 34 oz borosilicate 4 level filter" },
    { id: 6, name: "Organic Bamboo Cutting Board Set (3-Piece)", category: "Kitchen & Dining", typicalBsr: 2400, estMonthlySales: 1350, retailPrice: 28.99, targetCost: 7.20, estProfit: 8.50, roi: 118, query: "bamboo cutting board set with juice groove" },
    { id: 7, name: "Stainless Steel Herb Scissors (5-Blades)", category: "Kitchen & Dining", typicalBsr: 4500, estMonthlySales: 850, retailPrice: 12.99, targetCost: 2.20, estProfit: 4.40, roi: 200, query: "herb scissors 5 blade multipurpose cleaning comb" },
    { id: 8, name: "Manual Rotary Cheese Grater with Handle", category: "Kitchen & Dining", typicalBsr: 1500, estMonthlySales: 1850, retailPrice: 24.99, targetCost: 5.80, estProfit: 7.90, roi: 136, query: "rotary cheese grater suction base stainless drums" },
    { id: 9, name: "Glass Meal Prep Containers with Lids (5-Pack)", category: "Kitchen & Dining", typicalBsr: 3400, estMonthlySales: 1050, retailPrice: 34.99, targetCost: 9.50, estProfit: 10.50, roi: 110, query: "glass meal prep containers airtight locking lids" },
    { id: 10, name: "Silicone Stretch Lids (12-Pack)", category: "Kitchen & Dining", typicalBsr: 4800, estMonthlySales: 780, retailPrice: 13.99, targetCost: 2.40, estProfit: 4.85, roi: 202, query: "silicone stretch lids reusable bowl covers" },
    { id: 11, name: "Adjustable Stainless Steel Knife Sharpener", category: "Kitchen & Dining", typicalBsr: 2900, estMonthlySales: 1200, retailPrice: 18.99, targetCost: 3.90, estProfit: 6.50, roi: 166, query: "knife sharpener 3 stage manual diamond ceramic" },
    { id: 12, name: "Stainless Steel Cocktail Shaker Set (8-Piece)", category: "Kitchen & Dining", typicalBsr: 3800, estMonthlySales: 950, retailPrice: 27.99, targetCost: 6.80, estProfit: 8.60, roi: 126, query: "cocktail shaker set bar tools jigger strainer" },
    { id: 13, name: "Silicone Ice Cube Trays with Lids (4-Pack)", category: "Kitchen & Dining", typicalBsr: 2600, estMonthlySales: 1250, retailPrice: 16.99, targetCost: 3.20, estProfit: 5.75, roi: 179, query: "silicone ice cube trays with lids easy release" },
    { id: 14, name: "Oil Sprayer for Cooking & Air Fryer (200ml)", category: "Kitchen & Dining", typicalBsr: 1100, estMonthlySales: 2300, retailPrice: 13.99, targetCost: 2.50, estProfit: 4.90, roi: 196, query: "olive oil sprayer glass mist bottle air fryer" },
    { id: 15, name: "Collapsible Silicone Colander Strainer (2-Pack)", category: "Kitchen & Dining", typicalBsr: 4200, estMonthlySales: 890, retailPrice: 15.99, targetCost: 3.10, estProfit: 5.60, roi: 180, query: "collapsible colander silicone kitchen strainer set" },

    // --- BEAUTY & PERSONAL CARE ---
    { id: 16, name: "Jade Roller and Gua Sha Facial Tool Set", category: "Beauty & Personal Care", typicalBsr: 1400, estMonthlySales: 2200, retailPrice: 14.99, targetCost: 2.20, estProfit: 5.80, roi: 263, query: "jade roller gua sha set real rose quartz face" },
    { id: 17, name: "Soft Silicone Scalp Massager Shampoo Brush", category: "Beauty & Personal Care", typicalBsr: 950, estMonthlySales: 2900, retailPrice: 9.99, targetCost: 1.20, estProfit: 3.95, roi: 329, query: "silicone scalp massager shampoo brush hair scrubber" },
    { id: 18, name: "Professional Makeup Brush Set (16-Piece)", category: "Beauty & Personal Care", typicalBsr: 1600, estMonthlySales: 1900, retailPrice: 19.99, targetCost: 4.50, estProfit: 7.20, roi: 160, query: "makeup brush set synthetic kabuki foundation powder" },
    { id: 19, name: "Micro-Needle Derma Roller for Face (0.25mm)", category: "Beauty & Personal Care", typicalBsr: 2500, estMonthlySales: 1400, retailPrice: 13.99, targetCost: 1.80, estProfit: 5.60, roi: 311, query: "derma roller 540 microneedle titanium 0.25mm" },
    { id: 20, name: "Organic Beard Grooming Kit with Oil & Balm", category: "Beauty & Personal Care", typicalBsr: 3200, estMonthlySales: 1150, retailPrice: 25.99, targetCost: 5.80, estProfit: 8.80, roi: 151, query: "beard grooming kit oil balm brush comb scissors" },
    { id: 21, name: "Hydrocolloid Acne Pimple Patches (144-Count)", category: "Beauty & Personal Care", typicalBsr: 650, estMonthlySales: 3800, retailPrice: 12.99, targetCost: 1.50, estProfit: 5.40, roi: 360, query: "hydrocolloid pimple patches tea tree cica acne" },
    { id: 22, name: "Exfoliating Body Scrub Mittens (4-Pack)", category: "Beauty & Personal Care", typicalBsr: 3900, estMonthlySales: 980, retailPrice: 11.99, targetCost: 1.40, estProfit: 4.80, roi: 342, query: "korean exfoliating washcloth mitts dead skin removal" },
    { id: 23, name: "Microfiber Hair Drying Towel Wrap (3-Pack)", category: "Beauty & Personal Care", typicalBsr: 2100, estMonthlySales: 1500, retailPrice: 16.99, targetCost: 2.80, estProfit: 6.30, roi: 225, query: "microfiber hair towel wrap turban button anti frizz" },
    { id: 24, name: "Precision Eyebrow Trimmer Dermaplaning Razors", category: "Beauty & Personal Care", typicalBsr: 1250, estMonthlySales: 2400, retailPrice: 8.99, targetCost: 0.90, estProfit: 3.70, roi: 411, query: "facial razors dermaplaning tool eyebrow shaper" },
    { id: 25, name: "Teeth Whitening Pen Dual-Pack (Carbamide)", category: "Beauty & Personal Care", typicalBsr: 2800, estMonthlySales: 1300, retailPrice: 17.99, targetCost: 2.50, estProfit: 7.10, roi: 284, query: "teeth whitening pen enamel safe sensitive" },
    { id: 26, name: "Silicone Lip Scrubber Brush (4-Pack)", category: "Beauty & Personal Care", typicalBsr: 5200, estMonthlySales: 720, retailPrice: 7.99, targetCost: 0.80, estProfit: 3.20, roi: 400, query: "silicone lip scrubber double sided exfoliating" },
    { id: 27, name: "Ice Face Roller for Puffy Eyes & Migraine", category: "Beauty & Personal Care", typicalBsr: 1800, estMonthlySales: 1700, retailPrice: 12.99, targetCost: 1.90, estProfit: 5.10, roi: 268, query: "ice roller face eyes puffiness stainless head" },
    { id: 28, name: "Makeup Sponge Beauty Blenders (6-Piece Set)", category: "Beauty & Personal Care", typicalBsr: 2300, estMonthlySales: 1450, retailPrice: 10.99, targetCost: 1.20, estProfit: 4.50, roi: 375, query: "beauty sponge blender set latex free foundation" },
    { id: 29, name: "Foot Peeling Mask Booties (3-Pairs)", category: "Beauty & Personal Care", typicalBsr: 1950, estMonthlySales: 1600, retailPrice: 14.99, targetCost: 2.10, estProfit: 5.90, roi: 280, query: "foot peel mask booties calluses dead skin aloe" },
    { id: 30, name: "Under Eye Collagen Gel Patches (30 Pairs)", category: "Beauty & Personal Care", typicalBsr: 1350, estMonthlySales: 2150, retailPrice: 15.99, targetCost: 2.40, estProfit: 6.40, roi: 266, query: "under eye patches 24k gold collagen dark circles" },

    // --- TOYS & GAMES ---
    { id: 31, name: "Magnetic Building Tiles Set (60-Piece)", category: "Toys & Games", typicalBsr: 1500, estMonthlySales: 1800, retailPrice: 32.99, targetCost: 8.50, estProfit: 9.80, roi: 115, query: "magnetic building tiles 3d blocks kids stem" },
    { id: 32, name: "Push Pop Sensory Fidget Toy Pack (10-Piece)", category: "Toys & Games", typicalBsr: 2800, estMonthlySales: 1250, retailPrice: 16.99, targetCost: 3.00, estProfit: 5.90, roi: 196, query: "pop fidget pack sensory stress relief party favors" },
    { id: 33, name: "Wooden Montesorri Puzzle for Toddlers", category: "Toys & Games", typicalBsr: 2200, estMonthlySales: 1400, retailPrice: 18.99, targetCost: 3.80, estProfit: 6.50, roi: 171, query: "wooden toddler puzzle montessori shape sorter" },
    { id: 34, name: "Reusable Quick Fill Water Balloons (12-Pack)", category: "Toys & Games", typicalBsr: 800, estMonthlySales: 2900, retailPrice: 22.99, targetCost: 4.50, estProfit: 8.20, roi: 182, query: "reusable magnetic water balloons silicone self sealing" },
    { id: 35, name: "Kids LCD Writing Tablet Drawing Board (10-Inch)", category: "Toys & Games", typicalBsr: 1200, estMonthlySales: 2100, retailPrice: 16.99, targetCost: 3.20, estProfit: 6.10, roi: 190, query: "lcd writing tablet 10 inch doodle board stylus" },
    { id: 36, name: "Interactive STEM Solar Robot Kit 12-in-1", category: "Toys & Games", typicalBsr: 3400, estMonthlySales: 1050, retailPrice: 24.99, targetCost: 5.50, estProfit: 8.10, roi: 147, query: "solar robot kit stem 12 in 1 educational experiment" },
    { id: 37, name: "Glow in the Dark Slime Kit DIY for Girls/Boys", category: "Toys & Games", typicalBsr: 2600, estMonthlySales: 1300, retailPrice: 27.99, targetCost: 6.50, estProfit: 8.70, roi: 133, query: "slime kit diy making supplies glow in dark" },
    { id: 38, name: "Mini Drone with Camera for Kids and Beginners", category: "Toys & Games", typicalBsr: 4100, estMonthlySales: 920, retailPrice: 39.99, targetCost: 11.50, estProfit: 12.20, roi: 106, query: "mini drone for kids altitude hold headless mode" },
    { id: 39, name: "Speed Cube 3x3 Smooth Turning Puzzle", category: "Toys & Games", typicalBsr: 3100, estMonthlySales: 1150, retailPrice: 9.99, targetCost: 1.50, estProfit: 3.80, roi: 253, query: "speed cube 3x3 stickerless fast smooth puzzle" },
    { id: 40, name: "Kids Binoculars Shockproof Toy (8x21)", category: "Toys & Games", typicalBsr: 4500, estMonthlySales: 820, retailPrice: 17.99, targetCost: 3.80, estProfit: 6.20, roi: 163, query: "kids binoculars shock proof compact bird watching" },
    { id: 41, name: "Foam Glider Airplanes with Launchers (3-Pack)", category: "Toys & Games", typicalBsr: 1700, estMonthlySales: 1650, retailPrice: 19.99, targetCost: 4.20, estProfit: 7.10, roi: 169, query: "airplane launcher toys led foam gliders catapult" },
    { id: 42, name: "Water Doodle Mat Magic Drawing Pad (40x30in)", category: "Toys & Games", typicalBsr: 2900, estMonthlySales: 1200, retailPrice: 21.99, targetCost: 4.80, estProfit: 7.60, roi: 158, query: "water doodle mat magic coloring board pens" },
    { id: 43, name: "Kids Play Doctor Medical Kit with Bag (35Pcs)", category: "Toys & Games", typicalBsr: 3600, estMonthlySales: 1000, retailPrice: 26.99, targetCost: 6.20, estProfit: 8.50, roi: 137, query: "kids doctor playset stethoscope pretend medical kit" },
    { id: 44, name: "Marble Run Toy Track Building Set (120Pcs)", category: "Toys & Games", typicalBsr: 2450, estMonthlySales: 1350, retailPrice: 29.99, targetCost: 7.00, estProfit: 9.20, roi: 131, query: "marble run maze set stem track building glass marbles" },
    { id: 45, name: "Classic Family Card Party Game", category: "Toys & Games", typicalBsr: 950, estMonthlySales: 2600, retailPrice: 14.99, targetCost: 2.20, estProfit: 5.70, roi: 259, query: "custom playing cards board game party family" },

    // --- SPORTS & OUTDOORS ---
    { id: 46, name: "Resistance Exercise Loop Bands (Set of 5)", category: "Sports & Outdoors", typicalBsr: 1100, estMonthlySales: 2300, retailPrice: 12.99, targetCost: 1.80, estProfit: 5.20, roi: 288, query: "resistance loop bands natural latex workout 5 levels" },
    { id: 47, name: "High Density Foam Roller for Muscle Therapy", category: "Sports & Outdoors", typicalBsr: 2200, estMonthlySales: 1450, retailPrice: 19.99, targetCost: 4.20, estProfit: 6.80, roi: 161, query: "eva foam roller high density deep tissue back" },
    { id: 48, name: "Fast Drying Microfiber Travel Camp Towel", category: "Sports & Outdoors", typicalBsr: 3100, estMonthlySales: 1150, retailPrice: 15.99, targetCost: 2.80, estProfit: 5.90, roi: 210, query: "microfiber camp towel compact fast dry lightweight" },
    { id: 49, name: "USB Rechargeable LED Bicycle Light Set", category: "Sports & Outdoors", typicalBsr: 1800, estMonthlySales: 1700, retailPrice: 18.99, targetCost: 3.90, estProfit: 6.60, roi: 169, query: "bike light set usb rechargeable headlight taillight" },
    { id: 50, name: "Speed Jump Rope with Ball Bearings (Steel Cable)", category: "Sports & Outdoors", typicalBsr: 1600, estMonthlySales: 1900, retailPrice: 11.99, targetCost: 1.90, estProfit: 4.60, roi: 242, query: "speed jump rope ball bearing adjustable steel wire" },
    { id: 51, name: "Adjustable Ankle / Wrist Weights (Pair)", category: "Sports & Outdoors", typicalBsr: 3300, estMonthlySales: 1100, retailPrice: 22.99, targetCost: 5.20, estProfit: 7.20, roi: 138, query: "ankle weights pair adjustable strap silicone fitness" },
    { id: 52, name: "Insulated Stainless Steel Sports Water Bottle (32oz)", category: "Sports & Outdoors", typicalBsr: 1400, estMonthlySales: 2100, retailPrice: 24.99, targetCost: 5.50, estProfit: 7.90, roi: 143, query: "stainless steel insulated water bottle straw lid 32oz" },
    { id: 53, name: "Grip Strength Trainer Kit (5-Piece)", category: "Sports & Outdoors", typicalBsr: 2600, estMonthlySales: 1300, retailPrice: 16.99, targetCost: 2.90, estProfit: 6.10, roi: 210, query: "grip strength trainer set forearm exerciser finger" },
    { id: 54, name: "Double Camping Hammock with Tree Straps", category: "Sports & Outdoors", typicalBsr: 3700, estMonthlySales: 980, retailPrice: 29.99, targetCost: 6.80, estProfit: 9.40, roi: 138, query: "camping hammock portable double parachute nylon straps" },
    { id: 55, name: "Hydration Backpack with 2L Water Bladder", category: "Sports & Outdoors", typicalBsr: 2900, estMonthlySales: 1200, retailPrice: 32.99, targetCost: 7.50, estProfit: 10.20, roi: 136, query: "hydration pack backpack 2l bladder running hiking" },
    { id: 56, name: "Non-Slip Yoga Mat with Alignment Lines (6mm)", category: "Sports & Outdoors", typicalBsr: 2400, estMonthlySales: 1380, retailPrice: 29.99, targetCost: 6.80, estProfit: 8.80, roi: 129, query: "tpe yoga mat alignment marks non slip 6mm" },
    { id: 57, name: "Trekking Poles Collapsible Hiking Sticks (Pair)", category: "Sports & Outdoors", typicalBsr: 3500, estMonthlySales: 1020, retailPrice: 34.99, targetCost: 8.50, estProfit: 11.20, roi: 131, query: "trekking poles aluminum collapsible quick flip lock" },
    { id: 58, name: "Running Pouch Belt with Water Bottle Holder", category: "Sports & Outdoors", typicalBsr: 4200, estMonthlySales: 880, retailPrice: 15.99, targetCost: 2.70, estProfit: 5.80, roi: 214, query: "running belt waist pack water bottle holder bounce free" },
    { id: 59, name: "Deep Tissue Muscle Massage Ball (Lacrosse)", category: "Sports & Outdoors", typicalBsr: 2800, estMonthlySales: 1280, retailPrice: 9.99, targetCost: 1.20, estProfit: 3.90, roi: 325, query: "lacrosse massage ball trigger point myofascial" },
    { id: 60, name: "Waterproof Dry Bag Sack for Kayaking / Boating", category: "Sports & Outdoors", typicalBsr: 3900, estMonthlySales: 950, retailPrice: 17.99, targetCost: 3.40, estProfit: 6.30, roi: 185, query: "waterproof dry bag roll top floating sack phone case" },

    // --- HOME & HOUSEHOLD ---
    { id: 61, name: "Non-Slip Velvet Hangers (30-Pack)", category: "Home & Household", typicalBsr: 1200, estMonthlySales: 2200, retailPrice: 23.99, targetCost: 5.80, estProfit: 7.40, roi: 127, query: "velvet clothes hangers heavy duty non slip 360 hook" },
    { id: 62, name: "Fabric Foldable Closet Storage Bags (3-Pack)", category: "Home & Household", typicalBsr: 1600, estMonthlySales: 1850, retailPrice: 19.99, targetCost: 4.20, estProfit: 6.90, roi: 164, query: "closet organizer storage bags clear window handles" },
    { id: 63, name: "Ultrasonic Essential Oil Diffuser (500ml)", category: "Home & Household", typicalBsr: 2300, estMonthlySales: 1400, retailPrice: 24.99, targetCost: 5.60, estProfit: 7.80, roi: 139, query: "essential oil diffuser ultrasonic aromatherapy timer" },
    { id: 64, name: "Adjustable Drawer Dividers Organizers (4-Pack)", category: "Home & Household", typicalBsr: 3200, estMonthlySales: 1100, retailPrice: 26.99, targetCost: 6.20, estProfit: 8.30, roi: 133, query: "bamboo drawer dividers spring loaded adjustable" },
    { id: 65, name: "Microfiber Feather Duster with Extendable Pole", category: "Home & Household", typicalBsr: 2800, estMonthlySales: 1250, retailPrice: 16.99, targetCost: 3.20, estProfit: 5.90, roi: 184, query: "microfiber duster extendable pole bendable washable" },
    { id: 66, name: "Clear Acrylic Shelf Dividers for Closet (4-Pack)", category: "Home & Household", typicalBsr: 3500, estMonthlySales: 1050, retailPrice: 22.99, targetCost: 5.10, estProfit: 7.20, roi: 141, query: "acrylic shelf dividers closet organizer purse sweater" },
    { id: 67, name: "Door Draft Stopper Blocker Weather Stripping", category: "Home & Household", typicalBsr: 1900, estMonthlySales: 1650, retailPrice: 14.99, targetCost: 2.40, estProfit: 5.60, roi: 233, query: "under door draft stopper soundproof weather strip" },
    { id: 68, name: "Cable Management Box Organizer with Clips", category: "Home & Household", typicalBsr: 2700, estMonthlySales: 1300, retailPrice: 21.99, targetCost: 4.80, estProfit: 7.10, roi: 147, query: "cable management box cord hider wooden style lid" },
    { id: 69, name: "Reusable Silicone Dehumidifier Moisture Absorbers", category: "Home & Household", typicalBsr: 4100, estMonthlySales: 920, retailPrice: 18.99, targetCost: 3.60, estProfit: 6.40, roi: 177, query: "silica gel packets rechargeable moisture absorber" },
    { id: 70, name: "Motion Sensor LED Closet Under Cabinet Lights", category: "Home & Household", typicalBsr: 1500, estMonthlySales: 1950, retailPrice: 24.99, targetCost: 5.50, estProfit: 7.90, roi: 143, query: "under cabinet lights wireless motion sensor rechargeable" },

    // --- TOOLS & HOME IMPROVEMENT ---
    { id: 71, name: "Contour Gauge Profile Tool (10-Inch with Lock)", category: "Tools & Home Improvement", typicalBsr: 2600, estMonthlySales: 1350, retailPrice: 16.99, targetCost: 3.10, estProfit: 6.20, roi: 200, query: "contour gauge with lock metal teeth profile copier" },
    { id: 72, name: "Magnetic Wristband with Strong Magnets (Screws)", category: "Tools & Home Improvement", typicalBsr: 1800, estMonthlySales: 1750, retailPrice: 13.99, targetCost: 2.20, estProfit: 5.30, roi: 240, query: "magnetic wristband for holding screws nails drill" },
    { id: 73, name: "Universal Socket Grip Multi-Function Tool", category: "Tools & Home Improvement", typicalBsr: 2100, estMonthlySales: 1550, retailPrice: 14.99, targetCost: 2.60, estProfit: 5.50, roi: 211, query: "universal socket wrench self adjusting multi tool" },
    { id: 74, name: "Rechargeable COB LED Headlamp (230° Wide Beam)", category: "Tools & Home Improvement", typicalBsr: 1300, estMonthlySales: 2100, retailPrice: 17.99, targetCost: 3.30, estProfit: 6.60, roi: 200, query: "led headlamp 230 wide beam motion sensor usb" },
    { id: 75, name: "Precision Screwdriver Set 128-in-1 for Electronics", category: "Tools & Home Improvement", typicalBsr: 2400, estMonthlySales: 1400, retailPrice: 24.99, targetCost: 5.40, estProfit: 8.10, roi: 150, query: "precision screwdriver set electronics repair phone pc" },
    { id: 76, name: "Heavy Duty Furniture Sliders for Carpet (8-Pack)", category: "Tools & Home Improvement", typicalBsr: 3200, estMonthlySales: 1100, retailPrice: 15.99, targetCost: 2.80, estProfit: 5.70, roi: 203, query: "furniture movers sliders heavy duty carpet hardwood" },
    { id: 77, name: "Multi-Angle Measuring Ruler Aluminum Alloy", category: "Tools & Home Improvement", typicalBsr: 4300, estMonthlySales: 880, retailPrice: 16.99, targetCost: 3.20, estProfit: 5.80, roi: 181, query: "multi angle measuring ruler 6 sided aluminum" },
    { id: 78, name: "Flexible Drill Bit Extension Screwdriver Kit", category: "Tools & Home Improvement", typicalBsr: 3600, estMonthlySales: 1020, retailPrice: 12.99, targetCost: 2.00, estProfit: 4.80, roi: 240, query: "flexible drill bit extension magnetic hex shank" },
    { id: 79, name: "Automatic Center Punch with Cushion Grip", category: "Tools & Home Improvement", typicalBsr: 4900, estMonthlySales: 750, retailPrice: 11.99, targetCost: 1.80, estProfit: 4.60, roi: 255, query: "automatic center punch spring loaded hardened steel" },
    { id: 80, name: "Self-Fusing Silicone Waterproof Repair Tape", category: "Tools & Home Improvement", typicalBsr: 3800, estMonthlySales: 960, retailPrice: 13.99, targetCost: 2.10, estProfit: 5.20, roi: 247, query: "silicone repair tape self fusing emergency pipe wrap" },

    // --- PET SUPPLIES ---
    { id: 81, name: "Pet Hair Remover Roller Reusable (Lint/Fur)", category: "Pet Supplies", typicalBsr: 750, estMonthlySales: 3200, retailPrice: 19.99, targetCost: 3.80, estProfit: 7.60, roi: 200, query: "pet hair remover roller self cleaning lint fur" },
    { id: 82, name: "Pet Grooming Glove Deshedding Mitts (Pair)", category: "Pet Supplies", typicalBsr: 2100, estMonthlySales: 1550, retailPrice: 13.99, targetCost: 2.10, estProfit: 5.40, roi: 257, query: "pet grooming gloves deshedding gentle silicone" },
    { id: 83, name: "Interactive Cat Feather Wand Toys with Refills", category: "Pet Supplies", typicalBsr: 1600, estMonthlySales: 1900, retailPrice: 14.99, targetCost: 2.30, estProfit: 5.70, roi: 247, query: "cat feather wand toy retractable teaser refills" },
    { id: 84, name: "Slow Feeder Dog Bowl Non-Slip Maze Puzzle", category: "Pet Supplies", typicalBsr: 2800, estMonthlySales: 1250, retailPrice: 14.99, targetCost: 2.50, estProfit: 5.50, roi: 220, query: "slow feeder dog bowl interactive puzzle maze bloat" },
    { id: 85, name: "Portable Pet Water Bottle Dispenser for Walking", category: "Pet Supplies", typicalBsr: 1900, estMonthlySales: 1700, retailPrice: 15.99, targetCost: 2.80, estProfit: 5.80, roi: 207, query: "dog water bottle portable travel dispenser leak proof" },
    { id: 86, name: "Biodegradable Dog Poop Bags with Dispenser (270)", category: "Pet Supplies", typicalBsr: 900, estMonthlySales: 2900, retailPrice: 16.99, targetCost: 3.10, estProfit: 6.20, roi: 200, query: "biodegradable dog waste bags compostable dispenser" },
    { id: 87, name: "Cat Water Fountain Stainless Steel (3.2L)", category: "Pet Supplies", typicalBsr: 2400, estMonthlySales: 1400, retailPrice: 28.99, targetCost: 6.50, estProfit: 8.90, roi: 136, query: "cat water fountain stainless steel quiet pump filters" },
    { id: 88, name: "Dog Snuffle Mat Interactive Foraging Pad", category: "Pet Supplies", typicalBsr: 3300, estMonthlySales: 1100, retailPrice: 18.99, targetCost: 3.90, estProfit: 6.40, roi: 164, query: "dog snuffle mat nosework foraging training pad" },
    { id: 89, name: "Cat Window Perch Hammock with Heavy Suction", category: "Pet Supplies", typicalBsr: 2700, estMonthlySales: 1300, retailPrice: 24.99, targetCost: 5.20, estProfit: 8.10, roi: 155, query: "cat window perch hammock suction cup mounted bed" },
    { id: 90, name: "Pet Nail Grinder Electric USB Rechargeable", category: "Pet Supplies", typicalBsr: 3500, estMonthlySales: 1020, retailPrice: 21.99, targetCost: 4.60, estProfit: 7.20, roi: 156, query: "pet nail grinder painless quiet motor rechargeable" },

    // --- OFFICE PRODUCTS ---
    { id: 91, name: "Ergonomic Gel Mouse Pad with Wrist Support", category: "Office Products", typicalBsr: 1400, estMonthlySales: 2100, retailPrice: 12.99, targetCost: 2.10, estProfit: 5.10, roi: 242, query: "ergonomic mouse pad gel wrist rest non slip base" },
    { id: 92, name: "Double Sided Small Dry Erase Whiteboard (9x12)", category: "Office Products", typicalBsr: 2200, estMonthlySales: 1450, retailPrice: 15.99, targetCost: 2.90, estProfit: 5.90, roi: 203, query: "lapboard mini dry erase board portable lined set" },
    { id: 93, name: "Direct Thermal Shipping Labels 4x6 (500 Rolls)", category: "Office Products", typicalBsr: 850, estMonthlySales: 3100, retailPrice: 18.99, targetCost: 3.80, estProfit: 6.50, roi: 171, query: "thermal shipping labels 4x6 roll commercial fanfold" },
    { id: 94, name: "Rotating Mesh Desk Organizer Pen Holder", category: "Office Products", typicalBsr: 2700, estMonthlySales: 1300, retailPrice: 16.99, targetCost: 3.20, estProfit: 5.80, roi: 181, query: "rotating desk organizer caddy pencil pen holder" },
    { id: 95, name: "Self-Adhesive Cable Clips Cord Organizers (50Pcs)", category: "Office Products", typicalBsr: 1900, estMonthlySales: 1700, retailPrice: 9.99, targetCost: 1.10, estProfit: 4.10, roi: 372, query: "cable clips self adhesive wire drop clamp holder" },
    { id: 96, name: "Laptop Stand Adjustable Ergonomic Aluminum", category: "Office Products", typicalBsr: 1100, estMonthlySales: 2400, retailPrice: 22.99, targetCost: 4.80, estProfit: 7.60, roi: 158, query: "aluminum laptop stand portable foldable riser" },
    { id: 97, name: "Acoustic Desk Privacy Panel Clamp Dividers", category: "Office Products", typicalBsr: 4800, estMonthlySales: 750, retailPrice: 42.99, targetCost: 11.00, estProfit: 13.50, roi: 122, query: "acoustic desk divider clamp sound absorbing screen" },
    { id: 98, name: "Foot Rest Under Desk Memory Foam Teardrop", category: "Office Products", typicalBsr: 1700, estMonthlySales: 1850, retailPrice: 29.99, targetCost: 6.50, estProfit: 9.10, roi: 140, query: "under desk footrest ergonomic memory foam non skid" },
    { id: 99, name: "Document Folder Expanding File Organizer (24 Pockets)", category: "Office Products", typicalBsr: 3200, estMonthlySales: 1150, retailPrice: 17.99, targetCost: 3.50, estProfit: 6.20, roi: 177, query: "expanding file folder 24 pockets colored tabs a4" },
    { id: 100, name: "Fine Point Gel Ink Pens Assorted Colors (20-Pack)", category: "Office Products", typicalBsr: 1300, estMonthlySales: 2250, retailPrice: 13.99, targetCost: 2.00, estProfit: 5.20, roi: 260, query: "gel pens fine point 0.5mm smooth writing quick dry" }
  ];

  function getAllProducts() {
    return PRODUCTS;
  }

  function getProductsByCategory(category = 'all') {
    if (!category || category.toLowerCase() === 'all') return PRODUCTS;
    const catLower = category.toLowerCase();
    return PRODUCTS.filter(p => p.category.toLowerCase().includes(catLower));
  }

  function getCategories() {
    const set = new Set(PRODUCTS.map(p => p.category));
    return ['All', ...Array.from(set)];
  }

  return {
    getAllProducts,
    getProductsByCategory,
    getCategories
  };
});
