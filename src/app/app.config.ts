import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (userId) {
    const authReq = req.clone({
      setHeaders: {
        'x-user-id': userId,
        'x-user-role': userRole || 'employee'
      }
    });
    return next(authReq);
  }

  return next(req);
};
