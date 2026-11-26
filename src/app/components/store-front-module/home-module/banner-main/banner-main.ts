import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-main',
  imports: [RouterLink],
  templateUrl: './banner-main.html',
  host: { class: 'block font-sans' },
})
export class BannerMain {
  // Files in /public are served from the site root, so the "public" folder is not part of the URL
  @Input() image = '/main-banner-desktop.png';
  @Input() imageMobile = '/main-banner-mobile.png';
  @Input() imageAlt = 'UN-alt';
  @Input() heading = 'NOMADS in a Modern Space';
  @Input() subheading = 'We are all nomads navigating modern spaces. Urban Nomad centers on the coming together of mankind through creative expression.';
  @Input() ctaLabel = 'Shop the collection';
  @Input() ctaLink = '/catalogue';
}