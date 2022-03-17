import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('navWidth', [
      state(
        'normal',
        style({
          width: '50%',
          marginRight: '0',
        }),
      ),
      state(
        'clicked',
        style({
          width: '12.5%',
          marginRight: '0.5rem',
        }),
      ),
      transition('normal <=> clicked', animate(1000)),
    ]),
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  firstName: string;
  innitials: string;
  state: string = 'normal';
  screenWidth: number;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
    this.state = location.pathname != '/profile' ? 'clicked' : 'normal';
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (!this.user) {
        this.router.navigate(['/']);
      }
    });
    this.firstName = this.user.name.split(' ')[1];
    this.innitials = this.user.name.split(' ')[1][0] + this.user.name[0];
    window.onpopstate = () => {
      this.state = location.pathname != '/profile' ? 'clicked' : 'normal';
    };
  }

  onClick() {
    this.state = 'clicked';
  }

  onLogout() {
    this.state = 'normal';
    setTimeout(() => {
      this.authService.logout();
      location.pathname = '/';
    }, 1000);
  }

  ngOnDestroy(): void {
  }
}
