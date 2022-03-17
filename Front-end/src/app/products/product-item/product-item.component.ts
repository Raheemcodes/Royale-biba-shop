import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CartService } from 'src/app/cart/cart.service';
import { environment } from 'src/environments/environment';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent implements OnInit, AfterViewInit, OnDestroy {
  product: Product;
  backdrop: HTMLElement;
  restApiAddress: string = environment.restApiAddress;
  isAuthenticated: Boolean = false;
  userSub: Subscription;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const products = this.productsService.getProducts();
    this.route.params.subscribe((params: Params) => {
      const _id = params['id'].toLowerCase();
      this.product = products.find((prod) => prod._id == _id);
    });
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  ngAfterViewInit(): void {
    this.backdrop = document.querySelector('.backdrop');
  }

  onCheckout(prodId: string, quantity: HTMLInputElement) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    }
    this.productsService.checkout(prodId, +quantity.value).subscribe(() => {
      quantity.value = '1';
    });
  }

  onCart(prodId: string, quantity: HTMLInputElement) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    }
    if (+quantity.value < 1) {
      return;
    }
    this.cartService
      .addToCart(prodId, +quantity.value)
      .subscribe((resData: any) => {
        console.log(resData.message);
        quantity.value = '1';
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
