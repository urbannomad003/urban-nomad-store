import { Component, output } from '@angular/core';
import { ClearanceSaleBanner } from '../../../components/store-front-module/clearance-sale-module/clearance-sale-banner/clearance-sale-banner';
import {
  ClearanceSaleListWidget,
  ClearanceProduct,
} from '../../../components/store-front-module/clearance-sale-module/clearance-sale-list-widget/clearance-sale-list-widget';

@Component({
  selector: 'app-clearance-sale',
  imports: [ClearanceSaleBanner, ClearanceSaleListWidget],
  templateUrl: './clearance-sale.html',
  styleUrl: './clearance-sale.css',
})
export class ClearanceSale {
  addedToCart = output<ClearanceProduct>();
}