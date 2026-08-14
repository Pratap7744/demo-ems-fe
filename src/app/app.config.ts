import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {
  LucideAngularModule,
  Home, Clock, CalendarPlus, Calendar, Briefcase, User, Users, CalendarCheck,
  PanelLeftClose, PanelLeftOpen, LogOut, UserX, Pencil, KeyRound 
} from 'lucide-angular';

Chart.register(...registerables);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
        Home, Clock, CalendarPlus, Calendar, Briefcase, User, Users, CalendarCheck,
        PanelLeftClose, PanelLeftOpen, LogOut, UserX, Pencil, KeyRound 
      })
    )
  ]
};