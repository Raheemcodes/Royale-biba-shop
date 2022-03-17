import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Cart } from './cart.model';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cart: Cart[] = [];
  totalPrice: number;
  isLoading: boolean = true;
  restApiAddress: string = environment.restApiAddress;

  constructor(private cartService: CartService) {}

  onCheckout() {
    this.cartService.checkout();
  }

  onDelete(prodId: string) {
    this.cartService.deleteCart(prodId);
  }

  ngOnInit() {
    this.cart = this.cartService.getCart();
    this.cartService.cartsChanged.subscribe((cart) => {
      this.cart = cart;
      this.isLoading = false;
    });
    this.totalPrice = this.cartService.totalPrice;
    this.cartService.totalPriceChanged.subscribe((totalPrice) => {
      this.totalPrice = totalPrice;
      console.log(totalPrice)
    });
    if (this.cartService.totalPrice >= 0) this.isLoading = false;
  }
}
