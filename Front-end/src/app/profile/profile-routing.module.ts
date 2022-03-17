import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { LikesComponent } from '../likes/likes.component';
import { OrdersComponent } from '../orders/orders.component';
import { ProductsResolverService } from '../products/products-resolver.service';
import { DetailsComponent } from './details/details.component';
import { ProfileComponent } from './profile.component';

const routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    resolve: [ProductsResolverService],
    children: [
      {
        path: 'my-details',
        component: DetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'my-orders',
        component: OrdersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'saved-item',
        component: LikesComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
