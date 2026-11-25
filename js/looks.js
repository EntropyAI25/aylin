// Studio artwork for products: cut-out front/side/back, an embroidery close-up and a colour pairing.
// Keyed by the product's COVER PHOTO. If the cover is changed in /admin, or a new product is added,
// there is no entry for it and the site simply shows the uploaded photos instead.
// tl = background in the light theme, td = background in the dark theme, acc = thread colour.
const LOOKS = (() => {
  const look = (file, tl, td, acc) => ({
    front: `/assets/cut/${file}-front.webp?v=2`, side: `/assets/cut/${file}-side.webp?v=2`, back: `/assets/cut/${file}-back.webp?v=2`, detail: `/assets/detail/${file}.webp?v=2`, tl, td, acc,
  });
  return {
    "/media/1793884858284-30351f3b.png": look("ruby-red-kaftan", "#f4d3cc", "#3b1016", "#a8111f"),
    "/media/1793884849656-b1c9ffb9.png": look("sunshine-yellow-kaftan", "#d9e3f6", "#17264a", "#1e4c9c"),
    "/media/1793884841895-a05b1f82.png": look("midnight-blue", "#ecdfc9", "#3a4274", "#232a55"),
    "/media/1793884830209-b7a44928.png": look("pink-blush-kaftan", "#e8d9c4", "#4b4247", "#2b2023"),
    "/media/1793884822030-ab07b276.png": look("blush-pink", "#e9b9c1", "#4a222d", "#a8455f"),
    "/media/1793884865877-204987c2.png": look("kaftan", "#a9c0e4", "#132a56", "#1c439b"),
  };
})();
