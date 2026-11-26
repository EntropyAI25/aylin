// Default content. Used as the fallback for any setting not yet saved from the admin.

const DEFAULT_SETTINGS = {
  site: {
    name: "AYLIN",
    tagline: "Kashmir, Reimagined",
    theme: "auto", // auto | luxe | midnight
    logo: "assets/logo-transparent.png",
    currency: "₹",
    shippingNote: "plus shipping",
  },
  announcement: {
    enabled: true,
    text: "New arrivals are here  ·  Order effortlessly on WhatsApp",
  },
  hero: {
    display: true,
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
    title: "A legacy of 120+ years",
    text: "A new expression of Kashmir. Heritage that finds a new rhythm and becomes part of modern everyday life.",
    image: "",
  },
  journey: {
    items: [
      { mark: "120+", title: "Years of craft", text: "Our family has been connected to the world of Kashmiri craftsmanship for over 120 years." },
      { mark: "4th", title: "Generation", text: "A heritage shaped by tradition, artistry and skilled hands, now taken a little further." },
      { mark: "Then", title: "From law to AYLIN", text: "A career in law set aside, to celebrate our roots and bring Kashmiri craft to a new generation." },
      { mark: "Today", title: "Worn, not just remembered", text: "Thoughtfully designed kurtis and kaftans, with simplicity, elegance and modern modest style." },
    ],
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
      "Hello Aylin, I'm interested in your {product} and would love to place an order.\n\n{link}",
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
