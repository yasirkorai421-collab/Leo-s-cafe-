export interface MenuItem {
  name: string;
  description: string;
  price: string;
  priceSmall?: string;
  priceMedium?: string;
  priceLarge?: string;
  img: string;
  badge?: string;
}

export const categories = ["Pizzas", "Burgers & Rolls", "Mains & Pasta", "Drinks", "Desserts"];

export const menuData: Record<string, MenuItem[]> = {
  Pizzas: [
    { 
      name: "Leo's Special Pizza", 
      description: "House signature · Loaded", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&h=200&fit=crop",
      badge: "HOUSE SIGNATURE"
    },
    { 
      name: "Café Special Pizza", 
      description: "Cheese, chicken & veg", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Malai Boti Pizza", 
      description: "Creamy, mild spice", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Labistro Pizza", 
      description: "Fresh ingredients, savoury crust", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Shahi Pizza", 
      description: "Rich & royal-style topping", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Kabab Crust Pizza", 
      description: "Spiced kabab-stuffed crust", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Mexican Achaari Pizza", 
      description: "Tangy, pickled-spice kick", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Lemon Chicken Pizza", 
      description: "Zesty & tender", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Bell Pepper Sauce Pizza", 
      description: "Roasted pepper base", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Peri Peri Chicken Pizza", 
      description: "Bold & fiery", 
      priceSmall: "Rs. 300", 
      priceMedium: "Rs. 650", 
      priceLarge: "Rs. 850",
      price: "",
      img: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?q=80&w=200&h=200&fit=crop"
    },
  ],
  "Burgers & Rolls": [
    { 
      name: "Zinger Burger", 
      description: "Crispy fried chicken", 
      price: "Rs. 450", 
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&h=200&fit=crop",
      badge: "CUSTOMER FAVOURITE"
    },
    { 
      name: "Grilled Sandwich", 
      description: "Toasted & filled", 
      price: "Rs. 350", 
      img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Chicken Shawarma", 
      description: "Wrapped & grilled", 
      price: "Rs. 250", 
      img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Fries with Mayo Sauce", 
      description: "Golden & hot", 
      price: "Rs. 180", 
      img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Tikka Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Twister Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1623855244339-90fc0b0bbbca?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Chicken Chappli Kebab Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Chicken Patty Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Tamboora Roll", 
      description: "Regular favourite for a lighter bite", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Shahi Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Seekh Kebab Roll", 
      description: "Roll pricing varies — ask staff", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200&h=200&fit=crop"
    },
  ],
  "Mains & Pasta": [
    { 
      name: "Chicken Alfredo Pasta", 
      description: "Creamy, rich sauce", 
      price: "Rs. 650", 
      img: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Creamy Chicken Steak", 
      description: "Pan-seared, sauced", 
      price: "Rs. 750", 
      img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Grilled Chicken with Rice", 
      description: "Smoky & filling", 
      price: "Rs. 700", 
      img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Lemon Chicken", 
      description: "Zesty, tender cuts", 
      price: "Ask staff", 
      img: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?q=80&w=200&h=200&fit=crop"
    },
  ],
  Drinks: [
    { 
      name: "Hot Coffee", 
      description: "Coffee both ways", 
      price: "Rs. 200", 
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Cold Coffee", 
      description: "Coffee both ways", 
      price: "Rs. 250", 
      img: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Mint Margarita", 
      description: "Refreshing & minty", 
      price: "Rs. 180", 
      img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Fresh Juices", 
      description: "Juices made to order", 
      price: "Rs. 200+", 
      img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=200&h=200&fit=crop"
    },
  ],
  Desserts: [
    { 
      name: "Molten Lava Cake", 
      description: "Warm, gooey centre", 
      price: "Rs. 320", 
      img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Chocolate Brownie + Ice Cream", 
      description: "Warm & cold together", 
      price: "Rs. 380", 
      img: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=200&h=200&fit=crop"
    },
    { 
      name: "Cakes & Bakery Items", 
      description: "Ask for today's selection — bakery case open daily", 
      price: "Varies", 
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&h=200&fit=crop"
    },
  ],
};
