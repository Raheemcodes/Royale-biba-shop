import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  user: User;
  firstName: string;
  lastName: string;
  email: string;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const route = innerWidth < 768 ? '/my-details' : '/profile/my-details';
    this.router.navigate([route]);
    window.onresize = () => {
      const route = innerWidth < 768 ? '/my-details' : '/profile/my-details';
      this.router.navigate([route]);
    };
    this.authService.user.subscribe((user) => {
      this.user = user;
      // if (!this.user) {
      //   this.router.navigate(['/'])
      // }
    });
    this.firstName = this.user.name.split(' ')[1];
    this.lastName = this.user.name.split(' ')[0];
    this.email = this.user.email;
  }
}
