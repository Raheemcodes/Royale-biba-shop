import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { isPlatformBrowser, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../auth/user.model';
import { Product } from '../products/product.model';
import { ProductsService } from '../products/products.service';
import { AuthService } from './../auth/auth.service';
import { CartService } from './../cart/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('navTrans', [
      state(
        'normal',
        style({
          display: 'none',
          left: '-70vw',
        }),
      ),
      state(
        'mid',
        style({
          display: 'none',
          left: '-70vw',
        }),
      ),
      state(
        'highlighted',
        style({
          display: 'flex',
          left: '0vw',
        }),
      ),

      transition('normal <=> highlighted', [
        style({
          display: 'flex',
        }),
        animate(
          300,
          style({
            left: '-70vw',
          }),
        ),
        animate(500),
      ]),
      transition('mid <=> *', [
        style({
          display: 'flex',
        }),
        animate(
          300,
          style({
            left: '-70vw',
          }),
        ),
        animate(500),
      ]),
      // transition('highlighted <=> mid', animate(300)),
    ]),

    trigger('backdrop', [
      state(
        'normal',
        style({
          display: 'none',
        }),
      ),
      state(
        'mid',
        style({
          display: 'block',
        }),
      ),
      state(
        'highlighted',
        style({
          display: 'block',
        }),
      ),
      transition('* <=> normal', animate(300)),
    ]),
  ],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  private userSub: Subscription;
  state = 'normal';
  totalQuantity: number;
  user: User;
  dropDownMenu: HTMLElement;
  dropDownEntered: boolean = false;
  products: Product[];

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private productsService: ProductsService,
    @Inject(PLATFORM_ID) private platformId,
  ) {}

  headerToggleNav() {
    this.state = 'highlighted';
  }

  midNav() {
    this.state = 'mid';
  }

  reset() {
    this.state = 'normal';
    setTimeout(() => {
      if (
        (this.location.path() == '/auth' ||
          location.pathname.includes('create-products')) &&
        history.length >= 1
      ) {
        this.location.back();
      }
    }, 300);
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user) => {
      if (user) this.isAdmin = user.isAdmin;
      this.isAuthenticated = !!user;
      this.user = user;
      console.log(!!user);
    });
    this.totalQuantity = this.cartService.totalQuantiy;
    this.cartService.totalQuantiyChanged.subscribe((totalQuantity) => {
      this.totalQuantity = totalQuantity;
    });
    this.products = this.productsService.getProducts();
    this.productsService.productsChanged.subscribe((products) => {
      this.products = products;
    });
  }

  autoFilter(input: HTMLInputElement) {
    if (input.value == '') this.products = this.productsService.getProducts();
    this.products = [...this.products].filter((product) =>
      product.title.includes(input.value),
    );
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dropDownMenu = document.querySelector('.account-dropdown__menu');
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate['/'];
    this.state = 'normal';
  }

  searchBar(header: HTMLElement) {
    const searchBox: HTMLElement = header.querySelector('#search-box');
    const closeBtn: HTMLElement = header.querySelector('.close-btn');
    const toggleBtn: HTMLElement = header.querySelector('.toggle-button');
    const searchInput: HTMLInputElement = header.querySelector('#search-input');

    header.style.justifyContent = 'center';

    Array.from(header.children).forEach((el: any) => {
      el.style.display = 'none';
    });
    closeBtn.style.display = 'block';
    searchBox.style.display = 'flex';

    closeBtn.addEventListener('click', () => {
      searchInput.value = '';

      Array.from(header.children).forEach((el: any) => {
        el.style.display = 'flex';
      });
      searchBox.removeAttribute('style');
      closeBtn.removeAttribute('style');
      header.removeAttribute('style');
      toggleBtn.removeAttribute('style');
    });
  }

  sumbitSearch(input: HTMLInputElement) {
    const inputVal = input.value.trim();
    if (inputVal == '') return;
    this.router.navigate(['search', inputVal]);
  }

  openDropDown() {
    this.dropDownMenu.style.display = 'flex';
    this.dropDownMenu.style.opacity = '1';

    setTimeout(() => {
      if (!this.dropDownEntered) {
        this.closeDropDown();
      }
    }, 3000);
  }

  enterDropDown() {
    this.dropDownEntered = true;
  }

  closeDropDown() {
    this.dropDownMenu.style.opacity = '0';
    setTimeout(() => {
      this.dropDownMenu.style.display = 'none';
    }, 1000);
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
