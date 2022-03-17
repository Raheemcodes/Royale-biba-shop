import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from './order.model';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading: boolean = true;

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnInit(): void {
    window.onresize = this.manipulateProfile;
    this.manipulateProfile();

    this.ordersService.fetchOrders().subscribe({
      next: (resData) => {
        console.log(resData.message);
      },
      error: (errorMessage) => console.log(errorMessage),
    });

    this.orders = this.ordersService.getOrders();
    this.ordersService.ordersChanged.subscribe((orders) => {
      this.orders = orders;
      this.isLoading = false;
    });
  }

  manipulateProfile = () => {
    const route = innerWidth < 768 ? '/my-orders' : '/profile/my-orders';
    this.router.navigate([route]);
  };

  getInvoice(id: string) {
    this.ordersService.fetchInvoice(id);
  }

  ngOnDestroy(): void {
    // window.removeAllListeners('resize');
  }
}
