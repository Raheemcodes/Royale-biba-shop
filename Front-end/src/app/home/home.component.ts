import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
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
  screenWidth: number = 0;
  startPos = 0;
  currentTranslate = 0;
  prevTranslate = -innerWidth;
  currentIndex = 1;
  slider: HTMLElement;
  lastSlide: number = 4;
  restApiAddress: string = environment.restApiAddress;
  load: boolean = true;
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
    @Inject(PLATFORM_ID) private platformId,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
    this.newProducts = this.productsService.getNewProducts().slice(0, 3);
    if (innerWidth < 768 && this.newProducts.length == 3) {
      this.newProducts.push(this.newProducts[0]);
      this.newProducts.unshift(this.newProducts[this.newProducts.length - 2]);
    }
    window.onresize = this.resetSlide.bind(this);
    this.backgroundSlideItem = Array.from(
      document.getElementsByClassName('overview'),
    );
  }

  ngAfterViewInit(): void {
    this.backdrop = document.querySelector('.backdrop');
    this.slider = document.querySelector('.new-in__lists');
    this.backgroundSlide = document.querySelector('.background-container');
    this.slidePagination = document.getElementsByClassName('slide-pagination');

    this.resetSlide();

    this.interval = setInterval(this.translateBackground.bind(this), 3000);
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

  onTouchStart(e, idx) {
    if (innerWidth >= 768) return;
    this.currentIndex = idx;
    this.startPos = e.touches[0].clientX;
    this.slider.style.transition = 'none';
    this.move = false;
  }

  onTouchMove(e) {
    this.move = true;
    e.preventDefault();
    if (innerWidth >= 768) return;
    const currentPosition = e.touches[0].clientX;
    this.currentTranslate =
      this.prevTranslate + currentPosition - this.startPos;
    this.setSliderPosition();
  }

  onTouchEnd(e) {
    if (!this.move) return;
    if (innerWidth >= 768) return;
    const movedBy = this.currentTranslate - this.prevTranslate;

    // if moved enough negative then snap to next slide if there is one
    if (movedBy < -innerWidth / 4) {
      this.currentIndex++;
      if (this.currentIndex >= this.lastSlide) this.currentIndex = 1;
    }

    // if moved enough positive then snap to previous slide if there is one
    if (movedBy > innerWidth / 4) {
      this.currentIndex--;
      if (this.currentIndex <= 0) this.currentIndex = 3;
    }
    // this.slider.style.transition = 'transform 0.5s linear';
    this.setPositionByIndex();
  }

  setSliderPosition() {
    this.slider.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -window.innerWidth;
    this.prevTranslate = this.currentTranslate;
    this.setSliderPosition();
  }

  resetSlide() {
    if (innerWidth >= 768 && this.newProducts.length > 3) {
      this.slider.removeAttribute('style');
      this.newProducts.shift();
      this.newProducts.pop();
    }
    if (innerWidth < 768 && this.newProducts.length <= 3) {
      this.newProducts.unshift(this.newProducts[this.newProducts.length - 2]);
      this.newProducts.push(this.newProducts[0]);
      this.currentIndex = 1;
      this.prevTranslate = -innerWidth;
      this.currentTranslate = 0;
      this.startPos = 0;
    }
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

  ngOnDestroy(): void {
    clearInterval(this.interval);
    // window.removeAllListeners('resize');
  }
}
