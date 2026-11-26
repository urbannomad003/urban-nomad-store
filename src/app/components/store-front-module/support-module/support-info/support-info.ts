import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-support-info',
  standalone: true,
  templateUrl: './support-info.html',
  styleUrl: './support-info.css',
})
export class SupportInfo {
  protected readonly email = 'urbannomad381@gmail.com';
  protected readonly phone = '081 424 1429';
  protected readonly phoneHref = 'tel:+27814241429';
  protected readonly address = '1140A Margaret Street Ext 1 Geluksdal';
  protected readonly mapUrl: SafeResourceUrl;

  private readonly rawMapSrc =
    'https://www.google.com/maps/embed?pb=!4v1795656408165!6m8!1m7!1sP1Cz8OKHZ9whQ-mbSNI9kA!2m2!1d-26.34115257097312!2d28.36815857293528!3f207!4f0!5f0.7820865974627469';

  constructor(private readonly sanitizer: DomSanitizer) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawMapSrc);
  }
}