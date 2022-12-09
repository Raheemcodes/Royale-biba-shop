import { CartService } from './../../cart/cart.service';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';
import { AuthService } from './../../auth/auth.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[];
  backdrop: HTMLElement;
  quantity: number = 1;
  userSub: Subscription;
  isAuthenticated: Boolean = false;
  input: string;
  restApiAddress: string = environment.restApiAddress;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const products = this.productsService.getProducts();
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
    this.route.params.subscribe((params: Params) => {
      this.input = params['data'].toLowerCase();
      this.products = products.filter((prod) =>
        prod.title.toLowerCase().includes(this.input),
      );
    });
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
