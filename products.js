/*
  Stampleaf: shop settings and product list.
  This one file feeds both the website and the Stripe checkout function,
  so prices and postage can't drift apart. Prices are in pence (650 = £6.50).
*/

const CONFIG = {
  currency: "gbp",
  contactEmail: "", // add your support email here and it appears in the footer
  regions: {
    uk: {
      label: "United Kingdom",
      price: 199,
      days: [2, 4],
      countries: ["GB"],
    },
    europe: {
      label: "Europe",
      price: 399,
      days: [5, 10],
      countries: [
        "AD", "AL", "AT", "AX", "BA", "BE", "BG", "CH", "CY", "CZ", "DE", "DK",
        "EE", "ES", "FI", "FO", "FR", "GG", "GI", "GR", "HR", "HU", "IE", "IM",
        "IS", "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT",
        "NL", "NO", "PL", "PT", "RO", "RS", "SE", "SI", "SK", "SM", "TR", "VA",
      ],
    },
    northamerica: {
      label: "USA & Canada",
      price: 499,
      days: [7, 14],
      countries: ["US", "CA"],
    },
    world: {
      label: "Rest of the world",
      price: 599,
      days: [10, 21],
      countries: [
        "AE", "AR", "AU", "BD", "BH", "BN", "BR", "BS", "BW", "CL", "CN", "CO",
        "CR", "DO", "DZ", "EC", "EG", "GH", "GT", "HK", "ID", "IL", "IN", "JM",
        "JO", "JP", "KE", "KH", "KR", "KW", "KZ", "LK", "MA", "MU", "MX", "MY",
        "NA", "NG", "NP", "NZ", "OM", "PA", "PE", "PH", "PK", "PY", "QA", "SA",
        "SG", "TH", "TN", "TT", "TW", "TZ", "UG", "UY", "VN", "ZA", "ZM",
      ],
    },
  },
};

const PRODUCTS = [
  {
    id: "kiloware-200",
    name: "Worldwide Kiloware Mixture, 200+ Stamps",
    tagline: "30g of vintage and modern stamps from around the world",
    description:
      "A loose, unsorted 30g mixture of more than 200 stamps from many countries and eras. Tip it out, sort it by country or theme, and see what turns up. A good start for a new collection or a handful of swaps.",
    facts: [
      ["Quantity", "200+ stamps (30g)"],
      ["Era", "Vintage and modern"],
      ["Origin", "Worldwide mix"],
    ],
    price: 790,
    images: ["kilo-3.jpg", "kilo-1.jpg", "kilo-2.jpg", "kilo-4.jpg"],
    alt: "A loose pile of colourful vintage and modern stamps from many countries",
  },
  {
    id: "vintage-100",
    name: "Vintage World Collection, 100 Stamps",
    tagline: "100 off-paper stamps in nice condition",
    description:
      "One hundred vintage postage stamps from around the world, soaked off paper and in nice condition, with no folded stamps or missing corners. Bright, varied and ready for an album.",
    facts: [
      ["Quantity", "100 stamps"],
      ["Condition", "Off paper, no folds or missing corners"],
      ["Origin", "Worldwide, random selection"],
    ],
    price: 700,
    images: ["mix100-1.jpg", "mix100-2.jpg"],
    alt: "A spread of colourful vintage world postage stamps off paper",
  },
  {
    id: "classic-selection",
    name: "Classic World Stamp Selection, Used",
    tagline: "A used mix from various countries, off paper",
    description:
      "A used assortment of vintage world postage stamps from various countries, all off paper. Condition is mixed, so expect everything from clean examples to well-travelled ones. Good value for filling album pages.",
    facts: [
      ["Type", "Used postage stamps"],
      ["Condition", "Mixed, off paper"],
      ["Origin", "Various countries"],
    ],
    price: 876,
    images: ["stockcard-1.jpg"],
    alt: "Rows of used vintage world postage stamps arranged on a black card",
  },
  {
    id: "bag-500",
    name: "Rest of World Kiloware, 500+ Stamps",
    tagline: "A 50g bag covering all periods",
    description:
      "A bag of more than 500 off-paper stamps from all periods, weighing 50g. Plenty to sort through, with a wide spread of countries, designs and decades.",
    facts: [
      ["Quantity", "500+ stamps (50g)"],
      ["Condition", "Off paper"],
      ["Era", "All periods"],
    ],
    price: 1080,
    images: ["bag500-1.jpg", "bag500-2.jpg"],
    alt: "A heap of off-paper stamps from many countries and periods",
  },
];

// Server side (the checkout function) joins the extra lots from products-more.js.
// In the browser, products-more.js adds them itself.
if (typeof module !== "undefined") {
  PRODUCTS.push(...require("./products-more.js"));
  module.exports = { CONFIG, PRODUCTS };
}
