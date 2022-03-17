import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  products: Product[];
  input: string;
  restApiAddress: string = environment.restApiAddress;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const products = this.productsService.getProducts();
    this.route.params.subscribe((params: Params) => {
      this.input = params['data'].toLowerCase();
      this.products = products.filter((prod) =>
        prod.title.toLowerCase().includes(this.input),
      );
    });
  }

  ngOnDestroy(): void {}
}
