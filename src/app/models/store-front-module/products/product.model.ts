export interface Product {
  id: string;
  title: string;
  color: string;
  price: number;
  rating: number;
  section: string;
  imageUrl: string;
  inStock: boolean;
  stockCount: number;
  isDiscounted: boolean;
  createdAt?: string;
  updatedAt?: string;
}