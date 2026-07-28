import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export type Product = {
  id: string;
  name: string;
  price: string;
  image_url: string;
  [key: string]: any;
};

export type CartItem = Product & {
  quantity: number;
};

type AppContextType = {
  products: Product[];
  fetchProducts: () => void;
  addProduct: (product: any) => Promise<boolean>;
  updateProduct: (id: string, product: any) => Promise<boolean>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  checkout: () => Promise<boolean>;
  clearCart: () => void;
  isAdmin: boolean;
  isUserLoggedIn: boolean;
  username: string | null;
  token: string | null;
  login: (token: string, role: string, user: string) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const API_BASE_URL = 'http://119.59.102.161:3047';
const PRODUCTS_URL = `${API_BASE_URL}/api/products`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (jwtToken: string, role: string, user: string) => {
    setToken(jwtToken);
    setUsername(user);
    if (role === 'admin') {
      setIsAdmin(true);
      setIsUserLoggedIn(false);
    } else {
      setIsAdmin(false);
      setIsUserLoggedIn(true);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
    setIsUserLoggedIn(false);
    setUsername(null);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_URL);
      const data = await response.json();
      
      const mappedData = data.map((item: any) => {
        let imageUrl = item.image || item.image_url;
        if (!imageUrl) {
          if (item.name?.includes('Corsair')) {
            imageUrl = 'https://c1.neweggimages.com/ProductImage/17-139-272-V01.jpg';
          } else if (item.name?.includes('Seasonic')) {
            imageUrl = 'https://c1.neweggimages.com/ProductImage/17-151-228-V02.jpg';
          } else {
            imageUrl = 'https://via.placeholder.com/150';
          }
        }

        return {
          ...item,
          id: (item.id || item.psu_id || Math.random()).toString(),
          image_url: imageUrl,
          price: item.price ? `${item.price} THB` : '199 THB',
        };
      });
      
      setProducts(mappedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: any) => {
    if (!token) return false;
    try {
      const response = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        await fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    if (!token) return false;
    try {
      const response = await fetch(`${PRODUCTS_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        await fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, username: username })
      });
      if (response.ok) {
        setCart([]); // Clear cart after successful checkout
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
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

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider value={{ products, fetchProducts, addProduct, updateProduct, cart, addToCart, removeFromCart, checkout, clearCart, isAdmin, isUserLoggedIn, username, token, login, logout }}>
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
