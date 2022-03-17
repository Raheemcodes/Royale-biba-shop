import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { exhaustMap, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap((user) => {
        if (user && req.url.includes(environment.restApiAddress + '/orders')) {
          const modifiedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.token}`,
              Accept: 'application/pdf',
            },
          });
          return next.handle(modifiedReq);
        }
        if (
          user &&
          (req.url == environment.restApiAddress + '/bag' ||
            req.url == environment.restApiAddress + '/orders' ||
            req.url == environment.restApiAddress + '/purchase-product' ||
            req.url.includes(environment.restApiAddress + '/admin'))
        ) {
          const modifiedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.token}`,
              Accept: '*/*',
            },
          });
          return next.handle(modifiedReq);
        } else {
          return next.handle(req);
        }
      }),
    );
  }
}
