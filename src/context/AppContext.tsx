import React, { createContext, useContext, useState, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  price: string;
  image_url: string;
};

export type CartItem = Product & {
  quantity: number;
};

type AppContextType = {
  products: Product[];
  addProduct: (product: Product) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Initial fetch from github
    const fetchProducts = async () => {
      try {
        const PRODUCTS_URL = 'https://raw.githubusercontent.com/sirikasamkit/MyProfileAppSirikasamkit/master/products.json';
        const response = await fetch(PRODUCTS_URL);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching initial products:", error);
      }
    };
    fetchProducts();
  }, []);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  return (
    <AppContext.Provider value={{ products, addProduct, cart, addToCart, removeFromCart }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
