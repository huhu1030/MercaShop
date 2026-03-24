import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'jotai'
import { createElement, type ReactNode } from 'react'
import { useCart } from '../hooks/useCart'
import { resetCartStorage } from '../lib/cart-store'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(Provider, undefined, children)
}

describe('useCart', () => {
  beforeEach(() => {
    resetCartStorage()
  })

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
    expect(result.current.itemCount).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]?.quantity).toBe(1)
    expect(result.current.total).toBe(9.99)
  })

  it('increments quantity for existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]?.quantity).toBe(2)
    expect(result.current.total).toBeCloseTo(19.98)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
      result.current.removeItem('p1')
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('decrements quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
      result.current.decrementItem('p1')
    })

    expect(result.current.items[0]?.quantity).toBe(1)
  })

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 })
      result.current.addItem({ _id: 'p2', name: 'Gadget', price: 19.99 })
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })
})
