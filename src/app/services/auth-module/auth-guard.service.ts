import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map((currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map((currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        return router.createUrlTree(['/']);
      }

      return true;
    }),
  );
};