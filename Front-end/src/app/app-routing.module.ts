import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LikesComponent } from './likes/likes.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DetailsComponent } from './profile/details/details.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },

  { path: 'not-found', component: PageNotFoundComponent },

  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'search/:data',
    loadChildren: () =>
      import('./products/search/search.module').then((m) => m.SearchModule),
  },
  {
    path: 'bag',
    loadChildren: () => import('./cart/cart.module').then((m) => m.CartModule),
  },
  {
    path: 'my-orders',
    loadChildren: () =>
      import('./orders/orders.module').then((m) => m.OrdersModule),
  },
  {
    path: 'modify-products',
    loadChildren: () =>
      import('./admin/modify-products/modify-products.module').then(
        (m) => m.ModifyProductsModule
      ),
  },
  { path: 'saved-item', component: LikesComponent, canActivate: [AuthGuard] },
  { path: 'my-details', component: DetailsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
