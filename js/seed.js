// Default content. Used as the fallback for any setting not yet saved from the admin.

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
      "Hi Aylin, I'm interested in your collection and would love to place an order.\n\n{link}",
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
