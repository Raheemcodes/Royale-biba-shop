import { Injectable } from '@angular/core';
import {
  Resolve
} from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from './product.model';
import { ProductsService } from './products.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsResolverService implements Resolve<Product[]> {
  constructor(private productsService: ProductsService) {}

  resolve(): Product[] | Observable<Product[]> | Promise<Product[]> {
    const products = this.productsService.getProducts();
    if (products.length == 0) {
      return this.productsService.fetchProducts();
    } else {
      return products;
    }
  }
}
