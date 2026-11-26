import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-catalogue-banner',
  imports: [RouterLink],
  templateUrl: './product-catalogue-banner.html',
  host: { class: 'block font-sans' },
})
export class ProductCatalogueBanner {
  // Files in /public are served from the site root, so the "public" folder is not part of the URL
  @Input() desktopImage = '/product-catalogue-banner-desktop.png';
  @Input() mobileImage = '/product-catalogue-banner-mobile.png';
  @Input() imageAlt = 'Urban Nomad product catalogue banner';
  @Input() heading = 'Product Catalogue';
  @Input() subheading = 'Where elegance meets artistry.';
  @Input() ctaLabel = 'Explore catalogue';
  @Input() ctaLink = '/catalogue';
}