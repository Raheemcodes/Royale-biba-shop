import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cart } from './cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart: Cart[] = [];
  totalQuantiy: number = 0;
  totalPrice: number;
  publicKey: string = environment.publicKey;
  session: string;

  cartsChanged = new Subject<Cart[]>();
  totalPriceChanged = new Subject<number>();
  totalQuantiyChanged = new Subject<number>();

  constructor(private http: HttpClient) {}

  setCart(cart: Cart[]) {
    this.cart = cart;
    this.cartsChanged.next(this.cart);
  }

  setTotalPrice(totalPrice: number) {
    this.totalPrice = totalPrice;
    this.totalPriceChanged.next(totalPrice);
  }

  setTotalQuantity(totalQuantiy: number) {
    this.totalQuantiy = totalQuantiy;
    this.totalQuantiyChanged.next(totalQuantiy);
  }

  getProduct(index: number) {
    return this.cart[index];
  }

  getCart() {
    return this.cart;
  }

  addToCart(productId: string, quantity: number) {
    return this.http
      .post(environment.restApiAddress + '/bag', {
        productId,
        quantity,
      })
      .pipe(
        tap((resData: any) => {
          this.fetchcart().subscribe();
        })
      );
  }

  checkout() {
    const stripe = Stripe(this.publicKey);

    stripe.redirectToCheckout({
      sessionId: this.session,
    });
  }

  totalquantity() {}

  storeCart() {}

  updateCart() {}

  deleteCart(prodId: string) {
    this.http
      .delete(environment.restApiAddress + '/bag', {
        body: {
          productId: prodId,
        },
      })
      .subscribe((resData: { message: string; totalPrice: number }) => {
        let product: Cart;
        this.cart = [...this.cart].filter((prod: Cart) => {
          if (prodId) {
            product = prod;
          }
          if (prod._id !== prodId) {
            return prod;
          }
          return null;
        });
        this.setCart(this.cart);
        this.setTotalPrice(resData.totalPrice);
        const quantity = this.totalQuantiy - product.quantity;
        this.setTotalQuantity(quantity);
        console.log(resData);
      });
  }

  fetchcart() {
    return this.http.get(environment.restApiAddress + '/bag').pipe(
      tap((data: any) => {
        this.setCart(data.products);
        this.setTotalPrice(data.totalPrice);
        this.setTotalQuantity(data.totalQuantity);
        this.session = data.session.id;
      })
    );
  }
}
