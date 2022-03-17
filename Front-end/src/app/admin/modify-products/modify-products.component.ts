import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/products/product.model';
import { ProductsService } from 'src/app/products/products.service';
import { environment } from 'src/environments/environment';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-modify-products',
  templateUrl: './modify-products.component.html',
  styleUrls: ['./modify-products.component.scss'],
})
export class ModifyProductsComponent implements OnInit {
  products: Product[] = [];
  restApiAddress: string = environment.restApiAddress;

  constructor(
    private productsService: ProductsService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.products = this.productsService.getProducts();
    this.productsService.productsChanged.subscribe((products) => {
      this.products = products;
    });
  }

  onDeleteProd(prodId: string) {
    this.adminService.deleteProduct(prodId).subscribe({
      next: (resData: { message: string }) => {
        console.log(resData.message);
      },
      error: (errorMessage) => console.log(errorMessage),
      complete: () => console.info('Product Deleted!'),
    });
  }
}
