import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('authForm') authForm: ElementRef<HTMLDivElement>;
  userSub: Subscription;

  error: any;
  backdrop: HTMLElement;

  loginTitle: HTMLElement;
  signupTitle: HTMLElement;
  underline: HTMLElement;
  formContainer: HTMLFormElement;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userSub = this.authService.user.subscribe((user) => {
        if (!!user) {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const authForm = this.authForm.nativeElement;
      this.backdrop = document.querySelector('.backdrop');
      this.loginTitle = authForm.querySelector('.login-title');
      this.signupTitle = authForm.querySelector('.signup-title');
      this.formContainer = authForm.querySelector('.form-container');
      this.underline = authForm.querySelector('hr');

      this.openLoginForm();
      this.load();
    }
  }

  load() {
    const btns: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('.google-login__btn');

    google.accounts.id.initialize({
      client_id: environment.clientId,
      callback: this.onGoogleAuth.bind(this),
    });

    btns.forEach((btn) => {
      google.accounts.id.renderButton(
        btn,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        } // customization attributes
      );
    });

    google.accounts.id.prompt();
  }

  onLogin(form: NgForm) {
    if (!form.valid) {
      this.error = 'invalid form';
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authService.login(email, password).subscribe(
      (resData) => {
        console.log(resData);
        form.reset();
        this.closeForm(this.authForm.nativeElement);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      (errorMessage) => {
        this.error = errorMessage;
      }
    );
  }

  onSignup(form: NgForm) {
    if (!form.valid) {
      this.error = 'invalid form';
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    const confirmPassword = form.value.confirmPassword;
    const fullName = form.value.fullName;
    this.authService
      .signup(email, fullName, password, confirmPassword)
      .subscribe(
        (resData) => {
          console.log(resData);
          form.reset();
          this.loginControl();
        },
        (errorMessage: any) => {
          this.error = errorMessage;
        }
      );
  }

  openLoginForm() {
    const authForm = this.authForm.nativeElement;
    setTimeout(() => {
      this.backdrop.style.display = 'block';
      authForm.style.display = 'flex';
      this.loginControl();
    }, 300);

    this.backdrop.onclick = () => {
      this.closeForm(authForm);
    };
  }

  closeForm(authForm) {
    setTimeout(() => {
      authForm.style.display = 'none';
      this.backdrop.style.display = 'none';
    }, 300);
  }

  signupControl() {
    this.authForm.nativeElement;
    setTimeout(() => {
      this.underline.style.transform = 'translateX(100%)';
      this.formContainer.style.transform = 'translateX(-50%)';
      this.loginTitle.classList.remove('active');
      this.signupTitle.classList.add('active');
    }, 300);
  }

  loginControl() {
    this.loginTitle.classList.add('active');
    this.signupTitle.classList.remove('active');
    this.underline.style.transform = 'translateX(0)';
    this.formContainer.style.transform = 'translateX(0)';
  }

  onGoogleAuth(response: google.accounts.id.CredentialResponse) {
    const { credential } = response;

    this.authService.googleAuth(credential).subscribe({
      next: (resData) => {
        this.router.navigate(['../'], { relativeTo: this.route });
        console.log(resData);
      },
      error: (errorMessage) => {
        this.error = errorMessage;
      },
    });
  }

  onClose() {
    this.error = null;
  }

  backButton() {
    this.router.navigate(['../'], { relativeTo: this.route });
    this.backdrop.style.display = 'none';
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.backdrop.style.display = 'none';
    }
  }
}
