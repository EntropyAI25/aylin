// Colour pairings and studio artwork (cut-out front/side/back and an embroidery close-up).
// TONES: tl = background in the light theme, td = background in the dark theme, acc = thread colour.
// /admin reads TONES too; a cut-out made there carries its tone name in the photo address ("#cut=ruby").
const TONES = {
  ruby: { label: "Ruby", tl: "#f4d3cc", td: "#3b1016", acc: "#a8111f" },
  yellow: { label: "Yellow", tl: "#d9e3f6", td: "#17264a", acc: "#1e4c9c" },
  indigo: { label: "Indigo", tl: "#ecdfc9", td: "#3a4274", acc: "#232a55" },
  ash: { label: "Ash", tl: "#e8d9c4", td: "#4b4247", acc: "#2b2023" },
  rose: { label: "Rose", tl: "#e9b9c1", td: "#4a222d", acc: "#a8455f" },
  sky: { label: "Sky", tl: "#a9c0e4", td: "#132a56", acc: "#1c439b" },
};
// Artwork for the first six kaftans, keyed by each ORIGINAL PHOTO, so it follows that photo when it is moved.
// A photo that is replaced in /admin, or belongs to a new product, has no entry and is shown as uploaded.
const ART = (() => {
  const art = {};
  const add = (file, tone, photos) => ["front", "detail", "side", "back"].forEach((view, i) => {
    const src = view === "detail" ? `/assets/detail/${file}.webp?v=4` : `/assets/cut/${file}-${view}.webp?v=3`;
    art[`/media/${photos[i]}`] = { src, view, cut: true, tone: TONES[tone] };
  });
  // photos in their original order: cover, close-up, side, back
  add("ruby-red-kaftan", "ruby", ["1793884858284-30351f3b.png", "1793884860124-9311e481.jpeg", "1793884861709-9aa1711c.png", "1793884863712-fb88afcd.png"]);
  add("sunshine-yellow-kaftan", "yellow", ["1793884849656-b1c9ffb9.png", "1793884851719-847e864f.jpeg", "1793884853979-9d75d639.png", "1793884856107-759e044c.png"]);
  add("midnight-blue", "indigo", ["1793884841895-a05b1f82.png", "1793884843879-f80e293c.png", "1793884846164-8c5c3da5.png", "1793884847619-bed4e653.png"]);
  add("pink-blush-kaftan", "ash", ["1793884830209-b7a44928.png", "1793884833694-0928121a.png", "1793884836615-e7e9a984.png", "1793884839545-7c7aa3a1.png"]);
  add("blush-pink", "rose", ["1793884822030-ab07b276.png", "1793884823959-5fcdb777.png", "1793884826955-a95172cd.png", "1793884828652-9f066a11.png"]);
  add("kaftan", "sky", ["1793884865877-204987c2.png", "1793884868460-8297eb9b.png", "1793884870308-75ce7498.png", "1793884872715-6403ec4b.png"]);
  return art;
})();
