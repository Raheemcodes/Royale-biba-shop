import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';
import { CartService } from './../../cart/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit {
  // productsSub: Subscription;
  products: Product[];
  backdrop: HTMLElement;
  quantity: number = 1;
  userSub: Subscription;
  isAuthenticated: Boolean = false;
  restApiAddress: string = environment.restApiAddress;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
    this.products = this.productsService.getProducts();
  }

  ngAfterViewInit(): void {
    this.backdrop = document.querySelector('.backdrop');
  }

  showQuantityBox(idx) {
    const quantityBox: any = document.querySelectorAll('.bag-quantity__btn');

    this.backdrop.style.display = 'block';
    quantityBox[idx].style.display = 'flex';

    this.backdrop.addEventListener('click', () => {
      this.quantity = 1;
      quantityBox[idx].style.display = 'none';
      this.backdrop.style.display = 'none';
    });
  }

  onCart(prodId: string, quantityForm: HTMLDivElement) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    }
    if (this.quantity < 1) {
      return;
    }
    this.cartService
      .addToCart(prodId, this.quantity)
      .subscribe((resData: any) => {
        console.log(resData.message);
        quantityForm.style.display = 'none';
        this.backdrop.style.display = 'none';
        this.quantity = 1;
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
