import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateProductsComponent } from '../admin/create-products/create-products.component';
import { AuthComponent } from '../auth/auth.component';
import { ProductsResolverService } from '../products/products-resolver.service';
import { HomeComponent } from './home.component';

const routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: [ProductsResolverService],
    children: [
      { path: 'auth', component: AuthComponent },
      { path: 'create-products', component: CreateProductsComponent },
      { path: 'create-products/:id', component: CreateProductsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
