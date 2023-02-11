import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AuthComponent } from '../auth/auth.component';
import { CreateProductsComponent } from '../admin/create-products/create-products.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ValidateEqualModule } from 'ng-validate-equal';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [HomeComponent, AuthComponent, CreateProductsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    ValidateEqualModule,
    HomeRoutingModule,
  ],
  providers: [{ provide: 'Window', useValue: window }],
})
export class HomeModule {}
