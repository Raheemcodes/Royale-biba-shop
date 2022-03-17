import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../products/product.model';
import { ProductsService } from '../products/products.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private productsService: ProductsService,
    private router: Router,
  ) {}

  storeProduct(title: string, imageUrl: any, price: string) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('image', imageUrl.files[0]);
    return this.http
      .post(environment.restApiAddress + '/admin/create-post', formData)
      .pipe(
        tap((resData: any) => {
          this.productsService.addProduct(resData.product);
        }),
      );
  }

  getProduct(idx) {
    const product: Product = this.productsService.getProduct(idx);
    return product;
  }

  editProduct(
    idx: number,
    prodId: string,
    title: string,
    imageUrl: any,
    price: any,
  ) {
    const formData = new FormData();
    formData.append('productId', prodId);
    formData.append('title', title);
    formData.append('price', price);
    formData.append('image', imageUrl.files[0]);
    return this.http
      .put(environment.restApiAddress + '/admin/edit-post', formData)
      .pipe(
        tap((resData: { message: string; product: Product }) => {
          // console.log(resData);
          this.productsService.editProduct(idx, resData.product);
        }),
      );
  }

  deleteProduct(prodId: string) {
    return this.http
      .delete(`${environment.restApiAddress}/admin/delete-post/${prodId}`)
      .pipe(
        tap(() => {
          this.productsService.deleteProduct(prodId);
        }),
      );
  }
}
