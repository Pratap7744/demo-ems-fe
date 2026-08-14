import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    text: string;
    type: 'success' | 'error';
    // position: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'
    position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    message = signal<ToastMessage | null>(null);

    show(text: string, type: 'success' | 'error' = 'error', duration = 3500, position: ToastMessage['position'] = 'bottom-left'): void {
        this.message.set({ text, type, position });
        setTimeout(() => this.message.set(null), duration);
    }
}