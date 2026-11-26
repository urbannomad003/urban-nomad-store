import { Routes } from '@angular/router';
import { Home } from './views/store-front-module/home/home';
import { FeaturedProductsOnSale } from './views/store-front-module/featured-products-on-sale/featured-products-on-sale';
import { TrendingNow } from './views/store-front-module/trending-now/trending-now';
import { ClearanceSale } from './views/store-front-module/clearance-sale/clearance-sale';
import { Loyalty } from './views/store-front-module/loyalty/loyalty';
import { Wishlist } from './views/store-front-module/wishlist/wishlist';
import { Support } from './views/store-front-module/support/support';
import { Legal } from './views/store-front-module/legal/legal';
import { Cart } from './views/store-front-module/cart/cart';
import { Profile } from './views/store-front-module/profile/profile';
import { Login } from './views/auth-module/login/login';
import { RegisterAccount } from './views/auth-module/register-account/register-account';
import { ResetPassword } from './views/auth-module/reset-password/reset-password';
import { VerifyAccount } from './views/auth-module/verify-account/verify-account';
import { authGuard } from './services/auth-module/auth-guard.service';
import { guestGuard } from './services/auth-module/guest-gaurd.service';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'featured', component: FeaturedProductsOnSale },
  { path: 'trending', component: TrendingNow },
  { path: 'clearance', component: ClearanceSale },
  { path: 'loyalty', component: Loyalty, canActivate: [authGuard] },
  { path: 'wishlist', component: Wishlist, canActivate: [authGuard] },
  { path: 'support', component: Support },
  { path: 'legal', component: Legal },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: RegisterAccount, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword },
  { path: 'verify-account', component: VerifyAccount, canActivate: [guestGuard] },
  { path: '**', redirectTo: '' },
];