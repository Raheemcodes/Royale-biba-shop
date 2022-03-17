import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { AuthGuard } from '../auth/auth.guard';
import { FormsModule } from '@angular/forms';
import { ProductsResolverService } from '../products/products-resolver.service';

@NgModule({
  declarations: [OrdersComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: OrdersComponent, canActivate: [AuthGuard], resolve: [ProductsResolverService], },
    ]),
  ],
  exports: [RouterModule],
})
export class OrdersModule {}
