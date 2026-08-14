import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  // Small debug output to help trace missing token / header issues in browser
  try {
    if (token) {
      const masked = token.length > 8 ? `${token.slice(0, 8)}...` : token;
      // eslint-disable-next-line no-console
      console.debug('[authInterceptor] Attaching token:', masked, 'to', req.method, req.url);
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(cloned);
    }
    // eslint-disable-next-line no-console
    console.debug('[authInterceptor] No token present for request to', req.method, req.url);
  } catch (e) {
    // swallow any unexpected errors in interceptor debugging
  }

  return next(req);
};