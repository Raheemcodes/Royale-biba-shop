import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'RoyaleBiba-Angular';
  loaded: boolean = false;
  loadComponet: boolean = false;
  timeout: number = 0;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.autoLogin();
      this.timeout = 3000;
      document.body.style.overflow = 'hidden';
      this.loadComponet = true;

      setTimeout(() => {
        document.body.removeAttribute('style');
        this.loaded = true;
      }, this.timeout);
    }
  }
}
