import foods from "../assets/foods.json";

const menuConfig = [
  { name: "Main Course", icon: "🍛", bgColor: "#10B981", categories: ["Main Course"] },
  { name: "Rice", icon: "🍚", bgColor: "#F59E0B", categories: ["Rice"] },
  { name: "Chinese", icon: "🥡", bgColor: "#EF4444", categories: ["Chinese"] },
  { name: "South Indian", icon: "🥞", bgColor: "#8B5CF6", categories: ["South Indian"] },
  { name: "Snacks", icon: "🥟", bgColor: "#EC4899", categories: ["Snacks"] },
  { name: "Bread", icon: "🫓", bgColor: "#14B8A6", categories: ["Bread"] },
  { name: "Fast Food", icon: "🍕", bgColor: "#F97316", categories: ["Fast Food"] },
  { name: "Dessert", icon: "🍨", bgColor: "#A855F7", categories: ["Dessert"] },
  { name: "Beverage", icon: "🥤", bgColor: "#06B6D4", categories: ["Beverage"] },
];

const allFoods = foods.map((item, index) => ({
  ...item,
  id: index + 1,
}));

export const menus = menuConfig.map((menu, index) => ({
  id: index + 1,
  name: menu.name,
  icon: menu.icon,
  bgColor: menu.bgColor,
  items: menu.categories
    ? allFoods.filter(f => menu.categories.includes(f.category))
    : allFoods,
}));

const popularNames = [
  "Paneer Butter Masala",
  "Palak Paneer",
  "Kadai Paneer",
  "Veg Biryani",
  "Hakka Noodles",
  "Masala Dosa",
  "Chole Bhature",
  "Butter Naan",
  "Margherita Pizza",
  "Gulab Jamun",
];

export const popularDishes = allFoods
  .filter(f => popularNames.includes(f.name))
  .map((item, index) => ({
    ...item,
    id: `popular-${index + 1}`,
    numberOfOrders: [520,480,450,430,410,390,370,350,330,310][index] || 300,
  }));
