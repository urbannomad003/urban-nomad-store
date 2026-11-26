import { Component } from '@angular/core';

import { BannerMain } from '../../../components/store-front-module/home-module/banner-main/banner-main';
import { BannerPromotional } from '../../../components/store-front-module/home-module/banner-promotional/banner-promotional';
import { FeaturedProducts } from '../../../components/store-front-module/home-module/featured-products/featured-products';
import { TrendingNow } from '../../../components/store-front-module/home-module/trending-now/trending-now';
import { Loyalty } from '../../../components/store-front-module/home-module/loyalty/loyalty';

@Component({
  selector: 'app-home',
  imports: [
    BannerMain,
    BannerPromotional,
    FeaturedProducts,
    TrendingNow,
    Loyalty,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}