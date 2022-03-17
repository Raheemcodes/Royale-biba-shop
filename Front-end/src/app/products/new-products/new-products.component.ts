import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';
import { CartService } from './../../cart/cart.service';

@Component({
  selector: 'app-new-products',
  templateUrl: './new-products.component.html',
  styleUrls: ['./new-products.component.scss'],
})
export class NewProductsComponent implements OnInit {
  products: Product[];
  backdrop: HTMLElement;
  quantity: number = 1;
  restApiAddress: string = environment.restApiAddress;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.products = this.productsService.getNewProducts()

  }

  ngAfterViewInit(): void {
    this.backdrop = document.querySelector('.backdrop');
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
}
