import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pizza menu items based on Prima Vera's existing menu
const pizzaMenu = [
  {
    name: "Margherita",
    description:
      "Klasická talianska pizza s čerstvými paradajkami a mozzarellou",
    ingredients: [
      "paradajková omáčka",
      "mozzarella",
      "bazalka",
      "olivový olej",
    ],
    price: 8.9,
    category: "pizza",
    sortOrder: 1,
  },
  {
    name: "Quattro Formaggi",
    description: "Štvorité potešenie pre milovníkov syrov",
    ingredients: ["mozzarella", "gorgonzola", "parmezán", "ementál"],
    price: 11.9,
    category: "pizza",
    sortOrder: 2,
  },
  {
    name: "Prosciutto e Funghi",
    description: "Šunka a čerstvé šampiňóny",
    ingredients: ["paradajková omáčka", "mozzarella", "šunka", "šampiňóny"],
    price: 10.9,
    category: "pizza",
    sortOrder: 3,
  },
  {
    name: "Diavola",
    description: "Pre milovníkov pikantnej chuti",
    ingredients: [
      "paradajková omáčka",
      "mozzarella",
      "pikantná saláma",
      "feferónky",
      "olivy",
    ],
    price: 11.5,
    category: "pizza",
    sortOrder: 4,
  },
  {
    name: "Capricciosa",
    description: "Tradičná pizza s bohatou náplňou",
    ingredients: [
      "paradajková omáčka",
      "mozzarella",
      "šunka",
      "šampiňóny",
      "artičoky",
      "olivy",
    ],
    price: 12.5,
    category: "pizza",
    sortOrder: 5,
  },
  {
    name: "Vegetariana",
    description: "Čerstvá zelenina pre vegetariánov",
    ingredients: [
      "paradajková omáčka",
      "mozzarella",
      "paprika",
      "cuketa",
      "baklažán",
      "cherry paradajky",
    ],
    price: 10.9,
    category: "pizza",
    sortOrder: 6,
  },
  {
    name: "Tonno",
    description: "S kvalitným tuniakom a cibuľou",
    ingredients: [
      "paradajková omáčka",
      "mozzarella",
      "tuniak",
      "červená cibuľa",
      "kapary",
    ],
    price: 11.9,
    category: "pizza",
    sortOrder: 7,
  },
  {
    name: "Hawaii",
    description: "Sladko-slaná kombinácia",
    ingredients: ["paradajková omáčka", "mozzarella", "šunka", "ananás"],
    price: 10.5,
    category: "pizza",
    sortOrder: 8,
  },
  {
    name: "Pepperoni",
    description: "Americká klasika s pepperoni",
    ingredients: ["paradajková omáčka", "mozzarella", "pepperoni"],
    price: 10.9,
    category: "pizza",
    sortOrder: 9,
  },
];

const drinks = [
  {
    name: "Coca-Cola 0.5L",
    description: "Osviežujúci nápoj",
    ingredients: [],
    price: 2.5,
    category: "drink",
    sortOrder: 1,
  },
  {
    name: "Fanta 0.5L",
    description: "Pomarančový nápoj",
    ingredients: [],
    price: 2.5,
    category: "drink",
    sortOrder: 2,
  },
  {
    name: "Sprite 0.5L",
    description: "Citrónový nápoj",
    ingredients: [],
    price: 2.5,
    category: "drink",
    sortOrder: 3,
  },
  {
    name: "Minerálna voda 0.5L",
    description: "Prírodná minerálna voda",
    ingredients: [],
    price: 1.9,
    category: "drink",
    sortOrder: 4,
  },
];

const sides = [
  {
    name: "Cesnak s maslom",
    description: "Čerstvý cesnakový chlieb s maslom",
    ingredients: ["chlieb", "cesnak", "maslo", "bylinky"],
    price: 3.5,
    category: "side",
    sortOrder: 1,
  },
  {
    name: "Hranolky",
    description: "Chrumkavé zemiakové hranolky",
    ingredients: ["zemiaky", "soľ"],
    price: 3.9,
    category: "side",
    sortOrder: 2,
  },
];

async function main() {
  console.log("🍕 Seeding Prima Vera menu...");

  // Clear existing products
  await prisma.product.deleteMany();

  // Insert all products
  const allProducts = [...pizzaMenu, ...drinks, ...sides];

  for (const product of allProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        ingredients: product.ingredients,
        price: product.price,
        category: product.category,
        sortOrder: product.sortOrder,
        available: true,
      },
    });
    console.log(`  ✅ Added: ${product.name}`);
  }

  console.log(`\n🎉 Seeded ${allProducts.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
