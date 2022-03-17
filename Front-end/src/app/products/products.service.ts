import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { map, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  products: Product[] = [];
  publicKey: string = environment.publicKey;
  productsChanged = new Subject<Product[]>();
  session: any;

  constructor(private http: HttpClient) {}

  checkout(productId: string, quantity: number) {
    return this.http
      .post<{ message: string; session: any }>(
        environment.restApiAddress + '/purchase-product',
        {
          productId,
          quantity,
        },
      )
      .pipe(
        tap((resData) => {
          this.session = resData.session;
          this.stripe();
        }),
      );
  }

  async stripe() {
    const stripe = await loadStripe(this.publicKey);
    stripe.redirectToCheckout({
      sessionId: this.session.id,
    });
  }

  getProduct(index: number) {
    return this.products[index];
  }

  setProduct(products) {
    this.products = products;
    this.productsChanged.next(this.products);
  }

  getProducts() {
    return this.products;
  }

  getNewProducts() {
    return [...this.products].sort((a: Product, b: Product) => {
      const date1: any = new Date(b.createdAt);
      const date2: any = new Date(a.createdAt);
      return date1 - date2;
    });
  }

  addProduct(product: Product) {
    // if (this.products.length === 0) return;
    this.products.push(product);
    this.productsChanged.next(this.products);
  }

  editProduct(idx: number, prod: Product) {
    this.products[idx] = prod;
    this.productsChanged.next(this.products);
  }

  deleteProduct(prodId: string) {
    this.products = [...this.products].filter((prod: Product) => {
      if (prod._id !== prodId) {
        return prod;
      }
      return null;
    });
    this.productsChanged.next(this.products);
  }

  fetchProducts() {
    return this.http
      .get<Product[]>(environment.restApiAddress + '/products')
      .pipe(
        map((data: any) => {
          return data.products;
        }),
        tap((products) => {
          this.setProduct(products);
        }),
      );
  }
}
