import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from './order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  orders: Order[] = [];
  ordersChanged = new Subject<Order[]>();

  constructor(private http: HttpClient) {}

  setOrders(orders: Order[]) {
    this.orders = orders;
    this.ordersChanged.next(this.orders);
  }

  getOrders() {
    return this.orders;
  }

  fetchOrders() {
    return this.http
      .get<{ message: string; orders: Order[] }>(environment.restApiAddress +'/orders')
      .pipe(
        tap((resData) => {
          this.setOrders(resData.orders);
        }),
      );
  }

  fetchInvoice(id: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    this.http
      .get(`${environment.restApiAddress}/orders/${id}`, { responseType: 'blob' })
      .subscribe((blob: Blob): void => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        // window.open(fileURL, '_blank', 'width=1000, height=800');
        window.open(fileURL);
      }, (errorMessage) => {
        console.log(errorMessage.message)
      });
  }
}
