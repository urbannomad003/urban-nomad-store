import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from '../navbar/navbar';

interface HeaderLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Navbar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() bagCount = 0;
  @Input() alertCount = 0;

  links: HeaderLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Support', path: '/support' },
    { label: 'Loyalty', path: '/loyalty' },
    { label: 'Legal', path: '/legal' },
  ];
}