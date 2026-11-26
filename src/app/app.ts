import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Footer } from './components/store-front-module/common-module/footer/footer';
import { Header } from './components/store-front-module/common-module/header/header';

const AUTH_ROUTES = ['/login', '/register', '/reset-password', '/verify-account'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('urban-nomad-store');
  protected readonly isAuthRoute = signal(false);

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.updateRouteState(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.updateRouteState(event.urlAfterRedirects);
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
  }

  private updateRouteState(url: string) {
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isAuthRoute.set(AUTH_ROUTES.some((path) => cleanUrl === path || cleanUrl.startsWith(`${path}/`)));
  }
}