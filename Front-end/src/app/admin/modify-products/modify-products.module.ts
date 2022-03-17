import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModifyProductsComponent } from './modify-products.component';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsResolverService } from 'src/app/products/products-resolver.service';
import { AdminGuard } from 'src/app/auth/admin.guard';



@NgModule({
  declarations: [
    ModifyProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ModifyProductsComponent,
        resolve: [ProductsResolverService],
        canActivate: [AuthGuard, AdminGuard],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ModifyProductsModule { }
