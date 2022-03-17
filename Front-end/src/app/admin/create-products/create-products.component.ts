import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Product } from 'src/app/products/product.model';
import { AdminService } from '../admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.scss'],
})
export class CreateProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('authCover') authCover: ElementRef<HTMLDivElement>;
  image: any;
  editMode: boolean = false;
  prodIdx: number;
  product: Product;

  error: any;
  backdrop: HTMLElement;
  reader = new FileReader();
  createForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private loaction: Location,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.prodIdx = +params['id'];
      if (params['id']) this.editMode = true;
    });
    if (this.editMode) {
      this.product = this.adminService.getProduct(this.prodIdx);
      this.createForm = new FormGroup({
        title: new FormControl(this.product.title, Validators.required),
        image: new FormControl(''),
        price: new FormControl(this.product.price, Validators.required),
      });
    } else {
      this.createForm = new FormGroup({
        title: new FormControl('', Validators.required),
        image: new FormControl('', Validators.required),
        price: new FormControl('', Validators.required),
      });
    }
  }

  ngAfterViewInit(): void {
    this.backdrop = document.querySelector('.backdrop');
      this.openCreateForm();
  }

  onSubmit(image) {
    const title = this.createForm.value.title;
    const price = this.createForm.value.price;

    if (!this.editMode) {
      this.adminService.storeProduct(title, image, price).subscribe({
        next: () => {
          this.router.navigate(['/modify-products']);
          this.backdrop.style.display = 'none';
        },
        error: (errorMessage) => console.log(errorMessage),
        complete: () => console.info('Product created!'),
      });
    } else {
      console.log(this.product);
      this.adminService
        .editProduct(this.prodIdx, this.product._id, title, image, price)
        .subscribe({
          next: () => {
            this.router.navigate(['/modify-products']);
            this.backdrop.style.display = 'none';
          },
          error: (errorMessage) => console.log(errorMessage),
          complete: () => console.info('Product Edited!'),
        });
    }
  }

  imagePreview(fileEl: any) {
    const file = fileEl.files[0];
    this.reader.onload = () => {
      this.image = this.reader.result;
    };
    if (file) {
      this.reader.readAsDataURL(file);
    }
  }

  openCreateForm() {
    const authCover: any = this.authCover.nativeElement;
    setTimeout(() => {
      this.backdrop.style.display = 'block';
      authCover.style.display = 'flex';
    }, 300);
    this.backdrop.onclick = () => {
      this.closeForm(authCover);
    };
  }

  closeForm(authForm) {
    setTimeout(() => {
      authForm.style.display = 'none';
      this.backdrop.style.display = 'none';
    }, 300);
  }

  backButton() {
    this.backdrop.style.display = 'none';
    this.loaction.back();
  }

  ngOnDestroy(): void {
    this.backdrop.style.display = 'none';
  }
}
