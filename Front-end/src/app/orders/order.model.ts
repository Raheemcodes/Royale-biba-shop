import { Product } from '../products/product.model';

export interface Order {
  _id: string;
  products: [
    {
      _id: string;
      product: Product;
      quantity: number;
    },
  ];
}
