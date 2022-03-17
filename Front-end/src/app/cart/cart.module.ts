import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart.component';
import { AuthGuard } from '../auth/auth.guard';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsResolverService } from '../products/products-resolver.service';

@NgModule({
  declarations: [CartComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CartComponent,
        canActivate: [AuthGuard],
        resolve: [ProductsResolverService],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class CartModule {}
