import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewProductsComponent } from './new-products/new-products.component';
import { ProductItemComponent } from './product-item/product-item.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductsResolverService } from './products-resolver.service';
import { ProductsComponent } from './products.component';

const routes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    resolve: [ProductsResolverService],
    children: [
      {
        path: '',
        component: ProductListComponent,
        // resolve: [ProductsResolverService],
      },
      {
        path: 'new-in',
        component: NewProductsComponent,
        // resolve: [ProductsResolverService],
      },
      {
        path: ':id',
        component: ProductItemComponent,
        // resolve: [ProductsResolverService],
      },
    ],
  },
];

@NgModule({
  // declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
