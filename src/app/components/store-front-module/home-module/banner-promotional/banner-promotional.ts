import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-promotional',
  imports: [RouterLink],
  templateUrl: './banner-promotional.html',
  host: { class: 'block font-sans' },
})
export class BannerPromotional {
  // Files in /public are served from the site root, so the "public" folder is not part of the URL
  @Input() image = '/main-banner-desktop.png';
  @Input() imageMobile = '/main-banner-mobile.png';
  @Input() imageAlt = 'Smiling woman posing in trendy clothes';
  @Input() heading = 'Up to 30% off this season';
  @Input() subheading = 'Refresh your wardrobe with our featured pieces, on sale for a limited time.';
  @Input() ctaLabel = 'Shop on sale';
  @Input() ctaLink = '/featured';
}