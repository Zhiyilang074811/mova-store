import { renderHook, act } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { CartProvider, useCart } from '../../context/CartContext';

const sampleProduct = { id: '1', name: 'Test Product', price: 10 };

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }) => (
    <CartProvider>{children}</CartProvider>
  );

  it('should add item to cart and update count/total', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(10);
    expect(localStorage.getItem('cartItems')).toBe(JSON.stringify([sampleProduct]));
    expect(localStorage.getItem('itemCount')).toBe('1');
    expect(localStorage.getItem('totalPrice')).toBe('10');
  });

  it('should handle duplicate adds', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.addToCart(sampleProduct);
    });

    expect(result.current.cartItems).toHaveLength(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(20);
  });

  it('should remove existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.removeFromCart(sampleProduct);
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should do nothing when removing missing item', () => {
    const differentProduct = { id: '999', name: 'Different', price: 5 };
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.removeFromCart(differentProduct);
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should handle double remove (remove missing after adding)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.removeFromCart(sampleProduct);
      result.current.removeFromCart(sampleProduct);
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(localStorage.getItem('cartItems')).toBeNull();
    expect(localStorage.getItem('itemCount')).toBeNull();
    expect(localStorage.getItem('totalPrice')).toBeNull();
  });

  it('should hydrate from localStorage on mount', () => {
    localStorage.setItem('cartItems', JSON.stringify([sampleProduct]));
    localStorage.setItem('itemCount', '1');
    localStorage.setItem('totalPrice', '10');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(10);
  });

  it('should handle corrupt localStorage data gracefully', () => {
    localStorage.setItem('cartItems', 'not-json');
    localStorage.setItem('itemCount', 'invalid');
    localStorage.setItem('totalPrice', 'NaN');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should persist across remounts', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct);
    });

    rerender();

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(10);
  });

  it('remove-missing should not produce negative itemCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.removeFromCart(sampleProduct);
    });

    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('repeat-remove should not go negative', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.removeFromCart(sampleProduct);
      result.current.removeFromCart(sampleProduct);
      result.current.removeFromCart(sampleProduct);
    });

    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });
});