/*
  Stampleaf: extra products.
  Add new lots here. They are added to the main list in products.js
  automatically, for both the website and the checkout.
  Prices are in pence (982 = £9.82).
*/

const MORE_PRODUCTS = [
  {
    id: "kiloware-500",
    name: "Grand Worldwide Kiloware Mixture, 500+ Stamps",
    tagline: "60g of vintage and modern stamps from around the world",
    description:
      "A generous 60g mixture of more than 500 stamps, vintage and modern, from countries all over the world. Plenty of variety to sort through, whether you're building a collection or looking for swaps.",
    facts: [
      ["Quantity", "500+ stamps (60g)"],
      ["Era", "Vintage and modern"],
      ["Origin", "Worldwide mix"],
    ],
    price: 982,
    images: ["kilo500-1.jpg", "kilo500-2.jpg"],
    alt: "A large heap of colourful vintage and modern stamps from many countries",
  },
  {
    id: "jumbo-1000",
    name: "Premier Off-Paper Collection, 1000+ World Stamps",
    tagline: "A large kiloware job lot, all off paper",
    description:
      "A large job lot of more than 1,000 world stamps, all off paper and mixed from many countries. A big bag to tip out on the table and sort through at your own pace.",
    facts: [
      ["Quantity", "1000+ stamps"],
      ["Condition", "Off paper"],
      ["Origin", "World mixture"],
    ],
    price: 2500,
    images: ["job1000-1.jpg", "job1000-2.jpg"],
    alt: "A big pile of off-paper world stamps beside a clear bag of more stamps",
  },
];

// In the browser this adds the lots to the main list. The checkout function
// picks them up through products.js instead.
if (typeof module !== "undefined") {
  module.exports = MORE_PRODUCTS;
} else {
  PRODUCTS.push(...MORE_PRODUCTS);
}
