import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  path: string = location.pathname;
  title = 'RoyaleBiba-Angular';
  loaded: boolean = false;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.autoLogin();
      setTimeout(() => {
        this.loaded = true;
      }, 3000);
    }
  }
}
