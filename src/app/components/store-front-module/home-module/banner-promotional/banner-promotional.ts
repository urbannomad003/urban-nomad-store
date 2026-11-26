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
  @Input() image = '/product-catalogue-banner-desktop.png';
  @Input() imageMobile = '/product-catalogue-banner-desktop.png';
  @Input() imageAlt = 'Smiling woman posing in trendy clothes';
  @Input() heading = 'Regaining Self Confidence';
  @Input() subheading = 'The core inspiration behind Urban Nomad is empowering individuals to regain self-confidence through wearable art.';
  @Input() ctaLabel = 'Shop on sale';
  @Input() ctaLink = '/featured';
}