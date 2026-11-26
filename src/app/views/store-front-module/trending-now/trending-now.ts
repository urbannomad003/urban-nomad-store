import { Component, output } from '@angular/core';
import { TrendingNowBanner } from '../../../components/store-front-module/trending-now-module/trending-now-banner/trending-now-banner';
import {
  TrendingNowListWidget,
  TrendingProduct,
} from '../../../components/store-front-module/trending-now-module/trending-now-list-widget/trending-now-list-widget';

@Component({
  selector: 'app-trending-now',
  imports: [TrendingNowBanner, TrendingNowListWidget],
  templateUrl: './trending-now.html',
  styleUrl: './trending-now.css',
})
export class TrendingNow {
  addedToCart = output<TrendingProduct>();
}