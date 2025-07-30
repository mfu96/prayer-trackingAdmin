import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toastState = this.toastSubject.asObservable();

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toastSubject.next({ message, type });
  }
}