import { useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '../types/product';
import { WooCommerceAPI } from '../services/woocommerce';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => WooCommerceAPI.getCartFromStorage());

  const addToCart = async (product: Product, quantity: number = 1, variation?: any) => {
    const existingItemIndex = cart.items.findIndex(
      item => item.id === product.id && 
      JSON.stringify(item.variation) === JSON.stringify(variation)
    );

    let newItems = [...cart.items];

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].line_total = 
        newItems[existingItemIndex].quantity * newItems[existingItemIndex].price;
    } else {
      const newItem: CartItem = {
        key: `${product.id}-${Date.now()}`,
        id: product.id,
        quantity,
        name: product.name,
        price: parseFloat(product.price),
        line_total: parseFloat(product.price) * quantity,
        variation,
        product_data: product,
      };
      newItems.push(newItem);
    }

    const updatedCart = await WooCommerceAPI.updateCart(newItems);
    setCart(updatedCart);
  };

  const removeFromCart = async (itemKey: string) => {
    const newItems = cart.items.filter(item => item.key !== itemKey);
    const updatedCart = await WooCommerceAPI.updateCart(newItems);
    setCart(updatedCart);
  };

  const updateQuantity = async (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemKey);
    }

    const newItems = cart.items.map(item => {
      if (item.key === itemKey) {
        return {
          ...item,
          quantity,
          line_total: item.price * quantity,
        };
      }
      return item;
    });

    const updatedCart = await WooCommerceAPI.updateCart(newItems);
    setCart(updatedCart);
  };

  const clearCart = async () => {
    const updatedCart = await WooCommerceAPI.updateCart([]);
    setCart(updatedCart);
  };

  useEffect(() => {
    setCart(WooCommerceAPI.getCartFromStorage());
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};