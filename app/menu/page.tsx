"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

const categories = ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Wine"];

interface MenuItem {
  name: string;
  description: string;
  price: string;
  img: string;
}

const menuData: Record<string, MenuItem[]> = {
  Breakfast: [
    { name: "Avocado Toast & Egg", description: "Sourdough, avocado, poached egg, chili flakes", price: "$14.00", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=200&h=200&fit=crop" },
    { name: "Granola Bowl", description: "Greek yogurt, honey, seasonal berries, granola", price: "$11.00", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&fit=crop" },
    { name: "French Omelette", description: "3 eggs, gruyère, chives, buttered toast", price: "$13.00", img: "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=200&h=200&fit=crop" },
    { name: "Pancake Stack", description: "Buttermilk pancakes, maple syrup, fresh berries", price: "$12.00", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=200&h=200&fit=crop" },
    { name: "Smoked Salmon Bagel", description: "Cream cheese, capers, red onion, dill", price: "$16.00", img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=200&h=200&fit=crop" },
    { name: "Full English", description: "Bacon, eggs, sausage, beans, tomato, toast", price: "$18.00", img: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=200&h=200&fit=crop" },
  ],
  Lunch: [
    { name: "Caesar Salad", description: "Romaine, parmesan, croutons, house dressing", price: "$15.00", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&h=200&fit=crop" },
    { name: "Grilled Chicken Wrap", description: "Grilled chicken, lettuce, tomato, chipotle mayo", price: "$14.00", img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=200&h=200&fit=crop" },
    { name: "Mushroom Risotto", description: "Arborio rice, wild mushrooms, truffle oil, parmesan", price: "$19.00", img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=200&h=200&fit=crop" },
    { name: "Club Sandwich", description: "Turkey, bacon, lettuce, tomato, mayo on toasted bread", price: "$16.00", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=200&h=200&fit=crop" },
    { name: "Tomato Bisque", description: "Roasted tomato soup, basil cream, grilled cheese side", price: "$12.00", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=200&h=200&fit=crop" },
    { name: "Tuna Niçoise", description: "Seared tuna, olives, green beans, egg, anchovy dressing", price: "$21.00", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=200&h=200&fit=crop" },
  ],
  Dinner: [
    { name: "Grilled Beef Tenderloin", description: "8oz tenderloin, mashed potato, seasonal veg, red wine jus", price: "$42.00", img: "https://images.unsplash.com/photo-1544025162-83669bd89086?q=80&w=200&h=200&fit=crop" },
    { name: "Braised Short Rib", description: "36hr braised rib, creamy polenta, gremolata", price: "$38.00", img: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=200&h=200&fit=crop" },
    { name: "Pan-Seared Salmon", description: "Atlantic salmon, lemon butter, asparagus, dill", price: "$32.00", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&h=200&fit=crop" },
    { name: "Duck Confit", description: "Slow-cooked duck leg, cherry sauce, wilted greens", price: "$36.00", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&h=200&fit=crop" },
    { name: "Lamb Rack", description: "2-bone rack, herb crust, roasted garlic, ratatouille", price: "$45.00", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=200&h=200&fit=crop" },
    { name: "Truffle Pasta", description: "Hand-cut tagliatelle, black truffle, butter, parmesan", price: "$29.00", img: "https://images.unsplash.com/photo-1473093226555-0f4d4d3e4cc3?q=80&w=200&h=200&fit=crop" },
  ],
  Drinks: [
    { name: "Espresso Martini", description: "Vodka, espresso, Kahlúa, simple syrup", price: "$14.00", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=200&h=200&fit=crop" },
    { name: "Aperol Spritz", description: "Aperol, prosecco, soda water, orange slice", price: "$12.00", img: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=200&h=200&fit=crop" },
    { name: "House Lemonade", description: "Fresh-squeezed lemon, mint, honey, sparkling water", price: "$7.00", img: "https://images.unsplash.com/photo-1571950006418-f5bae03bbc65?q=80&w=200&h=200&fit=crop" },
    { name: "Cold Brew Coffee", description: "18-hour cold brew, served over ice with choice of milk", price: "$6.00", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=200&h=200&fit=crop" },
    { name: "Negroni", description: "Gin, sweet vermouth, Campari, orange peel", price: "$15.00", img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=200&h=200&fit=crop" },
    { name: "Matcha Latte", description: "Ceremonial-grade matcha, oat milk, light honey", price: "$7.00", img: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=200&h=200&fit=crop" },
  ],
  Desserts: [
    { name: "Crème Brûlée", description: "Classic vanilla custard, caramelized sugar crust", price: "$10.00", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=200&h=200&fit=crop" },
    { name: "Chocolate Lava Cake", description: "Warm dark chocolate, vanilla ice cream, raspberry coulis", price: "$12.00", img: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=200&h=200&fit=crop" },
    { name: "Tiramisu", description: "Mascarpone, espresso-soaked ladyfingers, cocoa dusting", price: "$11.00", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=200&h=200&fit=crop" },
    { name: "Lemon Tart", description: "Buttery pastry shell, lemon curd, meringue kisses", price: "$10.00", img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=200&h=200&fit=crop" },
    { name: "Panna Cotta", description: "Vanilla bean cream, passion fruit coulis, mango", price: "$9.00", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=200&h=200&fit=crop" },
    { name: "Cheese Board", description: "Selection of 4 cheeses, honeycomb, fig jam, crackers", price: "$18.00", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&h=200&fit=crop" },
  ],
  Wine: [
    { name: "Barolo DOCG 2018", description: "Piedmont, Italy — full body, earthy, cherry, leather", price: "$85.00", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&h=200&fit=crop" },
    { name: "Chablis Premier Cru", description: "Burgundy, France — crisp, mineral, citrus finish", price: "$68.00", img: "https://images.unsplash.com/photo-1561745501-651ee97e7044?q=80&w=200&h=200&fit=crop" },
    { name: "Rioja Reserva 2019", description: "Spain — medium body, vanilla oak, ripe plum", price: "$52.00", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&h=200&fit=crop" },
    { name: "Sancerre Blanc", description: "Loire Valley, France — sauvignon blanc, grassy, bright", price: "$72.00", img: "https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=200&h=200&fit=crop" },
    { name: "Prosecco DOC NV", description: "Veneto, Italy — light bubbles, pear, almond, floral", price: "$38.00", img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=200&h=200&fit=crop" },
    { name: "Malbec Reserva 2020", description: "Mendoza, Argentina — velvety, dark fruit, spice", price: "$48.00", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&h=200&fit=crop" },
  ],
};

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("Breakfast");
  const items = menuData[activeTab] ?? [];

  return (
    <main style={{ background: "var(--bg-page)" }}>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=2070&h=1380&fit=crop"
            alt="Menu hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 mt-16">
          <h1
            className="font-heading font-bold text-white uppercase mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", letterSpacing: "2px" }}
          >
            Specialties
          </h1>
          <Breadcrumb paths={[{ label: "Menu" }]} />
        </div>
      </section>

      {/* ── Menu Layout ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Category Tabs — stacked full-width buttons, no border-radius */}
            <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col border border-border-light overflow-hidden">
              {categories.map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    id={`menu-tab-${cat.toLowerCase()}`}
                    onClick={() => setActiveTab(cat)}
                    className="py-4 px-6 text-center text-lg font-medium transition-colors border-b last:border-b-0"
                    style={{
                      background: isActive ? "var(--color-accent)" : "var(--bg-tab-inactive)",
                      color: isActive ? "#ffffff" : "var(--color-heading)",
                      fontWeight: isActive ? 700 : 500,
                      borderColor: "var(--color-border-light)",
                      borderRadius: 0,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map((item, idx) => (
                  <article
                    key={idx}
                    className="flex items-center gap-4 border p-4 transition-shadow hover:shadow-md"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    {/* Food photo */}
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-full">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <h3
                          className="font-heading font-bold text-lg leading-tight truncate"
                          style={{ color: "var(--color-heading)" }}
                        >
                          {item.name}
                        </h3>
                        <span
                          className="font-bold text-lg flex-shrink-0"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {item.price}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--color-label-gray)" }}>
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
