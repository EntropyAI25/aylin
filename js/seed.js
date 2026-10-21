// Default content. Used as the fallback for any setting not yet saved from the
// admin, and as the whole catalogue while Supabase is not connected (demo mode).

const DEFAULT_SETTINGS = {
  site: {
    name: "AYLIN",
    tagline: "Kashmir, Reimagined",
    theme: "auto", // auto | luxe | midnight
    logo: "assets/logo-transparent.png",
    currency: "₹",
  },
  announcement: {
    enabled: true,
    text: "New arrivals are here  ·  Order effortlessly on WhatsApp",
  },
  hero: {
    eyebrow: "The Aylin Label",
    title: "Rooted in heritage. Designed for today.",
    subtitle: "Timeless Kashmiri craft, reimagined for the modern woman.",
    image: "",
    ctaText: "Shop the collection",
    ctaLink: "/shop",
  },
  values: {
    items: [
      { title: "Crafted in Kashmir", text: "Made with artisans who carry centuries of skill." },
      { title: "Made to be worn", text: "Soft, easy silhouettes for every day and every occasion." },
      { title: "Order on WhatsApp", text: "Chat with us directly. Simple, personal, no checkout maze." },
    ],
  },
  story: {
    title: "Our story",
    text: "AYLIN is a love letter to Kashmir: its quiet mornings, its colours, its craft. We reimagine heritage into pieces you will reach for again and again.",
    image: "",
  },
  about: {
    title: "Kashmir, Reimagined",
    body:
      "AYLIN began with a simple wish: to carry the beauty of Kashmir into the way women dress today.\n\nEvery piece is designed around heritage craft and made to fit real life: light, graceful and unmistakably yours.\n\nThank you for being part of our story.",
    image: "",
  },
  contact: {
    email: "",
    phone: "+91 83558 76607",
    address: "Kashmir, India",
    hours: "Mon – Sat, 10am – 7pm",
  },
  social: { instagram: "https://www.instagram.com/theaylinlabel/" },
  whatsapp: {
    number: "+91 83558 76607",
    template:
      "Hi AYLIN! I'd like to order:\n\n*{product}*\nSize: {size}\nColour: {colour}\nPrice: {price}\n\n{link}",
    generalMessage: "Hi Aylin, I'm interested in your collection and would love to place an order.",
  },
  policies: {
    shipping:
      "We ship across India. Orders are dispatched within 3–5 working days and you will receive tracking details on WhatsApp.",
    returns:
      "Unworn items with tags can be exchanged within 7 days of delivery. Message us on WhatsApp to arrange it.",
    sizeGuide:
      "Not sure of your size? Send us your measurements on WhatsApp and we will help you find the perfect fit.",
  },
  footer: { text: "© AYLIN. All rights reserved." },
};

const SEED_CATEGORIES = [
  { id: "c1", slug: "kaftans", name: "Kaftans", image: "", sort: 1 },
  { id: "c2", slug: "kurtis", name: "Kurtis", image: "", sort: 2 },
];

const colours = {
  ivory: { name: "Ivory", hex: "#f3ece1" },
  rose: { name: "Rose", hex: "#d9a9a6" },
  sage: { name: "Sage", hex: "#a9b79c" },
  night: { name: "Midnight", hex: "#1e2233" },
  saffron: { name: "Saffron", hex: "#d8a24a" },
  // Colours with their own photos: choosing one on the product page swaps the gallery.
  maroon: { name: "Maroon", hex: "#8f1d22", images: ["front", "side", "back"].map((v) => `/assets/kaftan/maroon-${v}.jpg`) },
  yellow: { name: "Yellow", hex: "#f1de6b", images: ["front", "side", "back"].map((v) => `/assets/kaftan/yellow-${v}.jpg`) },
  white: { name: "White", hex: "#f7f4ee", images: ["front", "side", "back"].map((v) => `/assets/kaftan/white-${v}.jpg`) },
};
const SIZES = ["XS", "S", "M", "L", "XL"];

const SEED_PRODUCTS = [
  {
    name: "Kaftan",
    cat: "c1",
    price: 2499,
    sizes: ["40", "44"],
    c: ["maroon", "yellow", "white"],
    feat: true,
    description: "A relaxed, flowing kaftan with Kashmiri embroidery along the neckline and hem.",
    details: "",
  },
].map((p, i) => ({
  id: "p" + (i + 1),
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name: p.name,
  category_id: p.cat,
  price: p.price,
  sale_price: p.sale || null,
  description: p.description ?? "A sample product shown in demo mode. Replace it from the admin with your own photos, price and description.",
  details: p.details ?? "Soft, breathable fabric\nHand-finished detailing\nDry clean recommended",
  images: p.c.flatMap((k) => colours[k].images ?? []),
  sizes: p.sizes ?? SIZES,
  colors: p.c.map((k) => colours[k]),
  in_stock: true,
  featured: p.feat,
  active: true,
  sort: i + 1,
}));
