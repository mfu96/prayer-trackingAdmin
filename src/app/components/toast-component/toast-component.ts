import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from 'src/app/services/toast-service';

@Component({
  selector: 'app-toast-component',
    standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toastState.subscribe(
      (toast: ToastMessage) => {
        this.toasts.push(toast);
        setTimeout(() => this.removeToast(toast), 5000); // 5 saniye sonra otomatik kaldır
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
