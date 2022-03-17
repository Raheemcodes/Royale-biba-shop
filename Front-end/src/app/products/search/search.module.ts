import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsResolverService } from '../products-resolver.service';
import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SearchComponent,
        resolve: [ProductsResolverService],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SearchModule {}
