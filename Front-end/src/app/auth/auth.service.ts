import { CartService } from './../cart/cart.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

import { User } from './user.model';
import { environment } from 'src/environments/environment';

export interface AuthResponseData {
  email: string;
  id: string;
  name: string;
  isAdmin: boolean;
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private cartService: CartService) {}

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(environment.restApiAddress + '/login', {
        email: email,
        password: password,
      })
      .pipe(
        catchError(this.handleErrors),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.id,
            resData.name,
            resData.isAdmin,
            resData.token,
            +resData.expiresIn,
          );
        }),
      );
  }

  signup(
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string,
  ) {
    return this.http
      .post(environment.restApiAddress + '/signup', {
        email,
        fullName,
        password,
        confirmPassword,
      })
      .pipe(catchError(this.handleErrors));
  }

  googleAuth(idToken: string) {
    return this.http
      .post<AuthResponseData>(environment.restApiAddress + '/google-auth', {
        idToken,
      })
      .pipe(
        catchError(this.handleErrors),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.id,
            resData.name,
            resData.isAdmin,
            resData.token,
            +resData.expiresIn,
          );
        }),
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      name: string;
      isAdmin: boolean;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData.name,
      userData.isAdmin,
      userData._token,
      new Date(userData._tokenExpirationDate),
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() - Date.now();
      this.cartService.fetchcart().subscribe();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.cartService.setCart([]);
    this.cartService.setTotalPrice(0);
    this.cartService.setTotalQuantity(0);
    this.user.next(null);
    localStorage.removeItem('userData');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    name: string,
    isAdmin: boolean,
    token: string,
    expiresIn: number,
  ) {
    const expirationDate = new Date(Date.now() + expiresIn * 1000);
    const user = new User(email, userId, name, isAdmin, token, expirationDate);
    this.autoLogout(expiresIn * 1000);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    this.cartService.fetchcart().subscribe();
  }

  private handleErrors(errorRes: HttpErrorResponse) {
    let errorMeassge = 'An unknown error occurred';
    console.log(errorRes.error);
    if (!errorRes.error) {
      return throwError(errorMeassge);
    }
    switch (errorRes.error.message) {
      case 'E-mail already exist!':
        errorMeassge = 'This email exist already!';
        break;

      case 'Please enter a valid email':
        errorMeassge = 'Invalid email!';
        break;

      case 'Email not found':
      case 'Wrong password!':
        errorMeassge = 'Wrong Email or password!';
        break;

      case 'Password has to be valid':
        errorMeassge = 'Enter password!';
        break;

      case 'Passwords have to match':
        errorMeassge = 'passwords have to match!';
        break;

      case 'Password not strong':
        errorMeassge =
          'Password must contain 8 charcters+, capital letter(s) and number(s)!';
        break;

      case 'Enter Full Name':
        errorMeassge = 'Enter Full Name!';
        break;
    }

    return throwError(errorMeassge);
  }
}
