import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/product.model';
import { ProductsService } from '../products/products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  newProducts: Product[] = [];
  backdrop: HTMLElement;
  quantity: number = 1;
  userSub: Subscription;
  isAuthenticated: Boolean = false;
  @ViewChild('slide') slider: ElementRef<HTMLElement>;
  restApiAddress: string = environment.restApiAddress;
  loading: boolean = true;
  interval: any;
  slidePagination: HTMLCollection;
  backgroundSlide: HTMLElement;
  backgroundIndex: number = 0;
  backgroundSlideItem: any = [];
  move: boolean;

  constructor(
    private productsService: ProductsService,
    private authService: AuthService,
    private cartService: CartService,
    @Inject('Window') private window: Window,
    @Inject(PLATFORM_ID) private platformId
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userSub = this.authService.user.subscribe((user) => {
        this.isAuthenticated = !!user;
      });

      this.getProduct();

      this.backgroundSlideItem = Array.from(
        document.getElementsByClassName('overview')
      );
    }
  }

  getProduct() {
    const products = this.productsService.getProducts();

    if (products.length == 0) {
      this.productsService.fetchProducts().subscribe({
        next: (products: Product[]) => {
          this.loading = false;
          this.newProducts = this.getNewProducts(products).slice(0, 3);
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.loading = false;
      this.newProducts = this.getNewProducts(products).slice(0, 3);
    }
  }

  getNewProducts(products: Product[]) {
    const lenght: number = products.length;
    return [products[lenght - 3], products[lenght - 1], products[lenght - 2]];
  }

  ngAfterViewInit(): void {
    this.lazyLoading();

    if (isPlatformBrowser(this.platformId)) {
      this.backdrop = document.querySelector('.backdrop');
      this.backgroundSlide = document.querySelector('.background-container');
      this.slidePagination =
        document.getElementsByClassName('slide-pagination');

      this.interval = setInterval(this.translateBackground.bind(this), 3000);
    }
  }

  translateBackground() {
    this.backgroundSlide.style.transition = 'transform ease-in-out 1s';
    this.backgroundIndex++;
    if (this.backgroundIndex == this.backgroundSlideItem.length) {
      this.backgroundSlide.style.transition = 'none';
      this.backgroundIndex = 0;
    }
    if (this.backgroundIndex == this.backgroundSlideItem.length - 1) {
      this.slidePagination[0].classList.add('active-slide-pagination');
    }
    this.backgroundSlide.style.transform = `translateX(${
      -100 * this.backgroundIndex
    }vw)`;
  }

  clicktranslateBackground(index: number) {
    if (this.backgroundIndex == this.backgroundSlideItem.length - 1) {
      this.slidePagination[0].classList.remove('active-slide-pagination');
    }
    this.backgroundIndex = index;
    this.backgroundSlide.style.transform = `translateX(${-100 * index}vw)`;
  }

  showQuantityBox(idx) {
    const quantityBox: any = document.querySelectorAll('.bag-quantity__btn');

    this.backdrop.style.display = 'block';
    quantityBox[idx].style.display = 'flex';

    this.backdrop.addEventListener('click', () => {
      quantityBox[idx].firstElementChild.nextElementSibling.value = '1';
      quantityBox[idx].style.display = 'none';
      this.backdrop.style.display = 'none';
    });
  }

  onCart(prodId: string, quantityForm: HTMLDivElement) {
    this.cartService
      .addToCart(prodId, this.quantity)
      .subscribe((resData: any) => {
        console.log(resData.message);
        quantityForm.style.display = 'none';
        this.backdrop.style.display = 'none';
      });
  }

  lazyLoading() {
    let lazyloadImages;

    if ('IntersectionObserver' in window) {
      lazyloadImages = document.querySelectorAll('.lazy');
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const image = entry.target as any;
              image.src = image.dataset.src;
              image.alt = image.dataset.alt;
              image.classList.remove('lazy');
              imageObserver.unobserve(image);
            }
          });
        },
        {
          rootMargin: '0px 0px 200px 0px',
        }
      );

      lazyloadImages.forEach((image) => {
        imageObserver.observe(image);
      });
    } else {
      let lazyloadThrottleTimeout;
      lazyloadImages = document.querySelectorAll('.lazy');

      function lazyload() {
        if (lazyloadThrottleTimeout) {
          clearTimeout(lazyloadThrottleTimeout);
        }

        lazyloadThrottleTimeout = setTimeout(() => {
          const scrollTop = this.window.pageYOffset;
          lazyloadImages.forEach((img) => {
            if (img.offsetTop < this.window.innerHeight + scrollTop + 200) {
              img.src = img.dataset.src;
              img.alt = img.dataset.alt;
              img.classList.remove('lazy');
            }
          });
          if (lazyloadImages.length == 0) {
            document.removeEventListener('scroll', lazyload);
            this.window.removeEventListener('resize', lazyload);
            this.window.removeEventListener('orientationChange', lazyload);
          }
        }, 20);
      }

      document.addEventListener('scroll', lazyload);
      this.window.addEventListener('resize', lazyload);
      this.window.addEventListener('orientationChange', lazyload);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    // this.window.removeAllListeners('resize');
  }
}
