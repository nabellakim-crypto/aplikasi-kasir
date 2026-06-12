export type Category = {
  id: string
  label: string
  emoji: string
}

export type Product = {
  id: number
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
}

export const CATEGORIES: Category[] = [
  { id: 'all',       label: 'All Items',  emoji: '🏪' },
  { id: 'beverages', label: 'Beverages',  emoji: '☕' },
  { id: 'food',      label: 'Food',       emoji: '🍔' },
  { id: 'snacks',    label: 'Snacks',     emoji: '🍿' },
  { id: 'dairy',     label: 'Dairy',      emoji: '🥛' },
  { id: 'bakery',    label: 'Bakery',     emoji: '🥐' },
  { id: 'produce',   label: 'Produce',    emoji: '🥦' },
]

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Caramel Latte',
    price: 5.50,
    stock: 24,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
    description: 'Rich espresso with caramel syrup and steamed milk',
  },
  {
    id: 2,
    name: 'Matcha Green Tea',
    price: 4.75,
    stock: 18,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    description: 'Premium Japanese matcha blended with oat milk',
  },
  {
    id: 3,
    name: 'Freshly Brewed Coffee',
    price: 3.25,
    stock: 40,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80',
    description: 'House blend drip coffee, served hot',
  },
  {
    id: 4,
    name: 'Mango Smoothie',
    price: 6.00,
    stock: 3,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80',
    description: 'Fresh mango blended with yogurt and honey',
  },
  {
    id: 5,
    name: 'Smash Burger',
    price: 11.50,
    stock: 15,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    description: 'Double smash patty with cheese and special sauce',
  },
  {
    id: 6,
    name: 'Grilled Chicken Wrap',
    price: 9.00,
    stock: 10,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80',
    description: 'Grilled chicken with fresh veggies in a warm tortilla',
  },
  {
    id: 7,
    name: 'Margherita Pizza Slice',
    price: 7.25,
    stock: 8,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    description: 'Classic margherita with fresh basil and mozzarella',
  },
  {
    id: 8,
    name: 'Caesar Salad',
    price: 8.50,
    stock: 12,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400&q=80',
    description: 'Romaine lettuce, croutons, parmesan and caesar dressing',
  },
  {
    id: 9,
    name: 'Salted Pretzels',
    price: 2.50,
    stock: 55,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1508896694512-1eade558679c?w=400&q=80',
    description: 'Crunchy salted pretzels, 80g bag',
  },
  {
    id: 10,
    name: 'Kettle Chips',
    price: 3.00,
    stock: 30,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1621447088424-a5d1e0b43b84?w=400&q=80',
    description: 'Sea salt kettle-cooked potato chips',
  },
  {
    id: 11,
    name: 'Chocolate Bar',
    price: 2.00,
    stock: 60,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80',
    description: '70% dark chocolate, 50g',
  },
  {
    id: 12,
    name: 'Trail Mix Bag',
    price: 4.25,
    stock: 22,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80',
    description: 'Mixed nuts, dried fruits, and seeds',
  },
  {
    id: 13,
    name: 'Whole Milk (1L)',
    price: 2.80,
    stock: 20,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    description: 'Full-cream fresh milk, 1 liter',
  },
  {
    id: 14,
    name: 'Greek Yogurt Cup',
    price: 3.50,
    stock: 16,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    description: 'Plain Greek yogurt, high protein, 200g',
  },
  {
    id: 15,
    name: 'Cheddar Cheese Slice',
    price: 4.00,
    stock: 0,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
    description: 'Aged cheddar sliced, 150g pack',
  },
  {
    id: 16,
    name: 'Butter Croissant',
    price: 3.75,
    stock: 7,
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    description: 'Flaky French-style butter croissant',
  },
  {
    id: 17,
    name: 'Sourdough Loaf',
    price: 6.50,
    stock: 5,
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    description: 'Artisan sourdough, freshly baked daily',
  },
  {
    id: 18,
    name: 'Blueberry Muffin',
    price: 2.75,
    stock: 14,
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80',
    description: 'Moist muffin loaded with fresh blueberries',
  },
  {
    id: 19,
    name: 'Baby Spinach (200g)',
    price: 3.20,
    stock: 9,
    category: 'produce',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    description: 'Fresh organic baby spinach leaves',
  },
  {
    id: 20,
    name: 'Avocado (each)',
    price: 1.50,
    stock: 25,
    category: 'produce',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
    description: 'Ripe Hass avocado, ready to eat',
  },
]

export const TAX_RATE = 0.085
