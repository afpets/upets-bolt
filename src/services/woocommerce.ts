import axios from 'axios';
import { Product, ProductCategory, Order, Cart } from '../types/product';

const WC_API_BASE_URL = import.meta.env.VITE_WC_API_BASE_URL || 'https://tu-dominio.com/wp-json/wc/v3';
const WC_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

// Configurar cliente axios con autenticación
const wcApi = axios.create({
  baseURL: WC_API_BASE_URL,
  auth: {
    username: WC_CONSUMER_KEY,
    password: WC_CONSUMER_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export class WooCommerceAPI {
  // Productos
  static async getProducts(params?: {
    per_page?: number;
    page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<Product[]> {
    try {
      const response = await wcApi.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Retornar array vacío en caso de error para que la app funcione sin conexión
      return [];
    }
  }

  static async getProduct(id: number): Promise<Product> {
    try {
      const response = await wcApi.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await wcApi.get('/products', { 
        params: { slug } 
      });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return null;
    }
  }

  // Categorías
  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const response = await wcApi.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Variaciones de producto
  static async getProductVariations(productId: number) {
    try {
      const response = await wcApi.get(`/products/${productId}/variations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product variations:', error);
      return [];
    }
  }

  // Órdenes
  static async createOrder(orderData: any): Promise<Order> {
    try {
      const response = await wcApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async getOrder(id: number): Promise<Order> {
    try {
      const response = await wcApi.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Carrito (usando sessions o local storage)
  static async updateCart(items: any[]): Promise<Cart> {
    // En un entorno real, esto podría usar WooCommerce Sessions API
    // Por ahora, manejamos el carrito en localStorage
    const cart = {
      items: items,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shipping_total: 0,
      tax_total: 0,
      total: 0
    };
    cart.total = cart.subtotal + cart.shipping_total + cart.tax_total;
    
    localStorage.setItem('afpets_cart', JSON.stringify(cart));
    return cart;
  }

  static getCartFromStorage(): Cart {
    const cartData = localStorage.getItem('afpets_cart');
    return cartData ? JSON.parse(cartData) : {
      items: [],
      item_count: 0,
      total: 0,
      subtotal: 0,
      shipping_total: 0,
      tax_total: 0
    };
  }
}