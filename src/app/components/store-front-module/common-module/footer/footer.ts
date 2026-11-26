import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FooterLink {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: 'instagram' | 'tiktok' | 'facebook';
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.html',
})
export class Footer {
  readonly email = signal('');
  readonly subscribed = signal(false);
  readonly errorMessage = signal('');

  readonly columns: FooterColumn[] = [
    {
      title: 'NAVIGATION',
      links: [
        { label: 'Home', route: '/' },
        { label: 'Support', route: '/support' },
        { label: 'Loyalty', route: '/loyalty' },
        { label: 'Wishlist', route: '/wishlist' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms Of Service', route: '/legal', queryParams: { topic: 'about-urban-nomad' } },
        { label: 'Return Policy', route: '/legal', queryParams: { topic: 'limitation-of-liability' } },
        { label: 'Refund Policy', route: '/legal', queryParams: { topic: 'limitation-of-liability' } },
        { label: 'Delivery Policy', route: '/legal', queryParams: { topic: 'third-party-services' } },
        { label: 'Privacy Policy', route: '/legal', queryParams: { topic: 'privacy' } },
      ],
    },
    {
      title: 'JOIN US',
      links: [
        { label: 'Register', route: '/register' },
      ],
    },
  ];

  readonly socialLinks: SocialLink[] = [
    { name: 'Instagram', href: 'https://www.instagram.com/bokabalisa/', icon: 'instagram' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@lisabokaba4', icon: 'tiktok' },
    { name: 'Facebook', href: 'https://www.facebook.com/lisa.bokaba/', icon: 'facebook' },
  ];

  onSubscribe(event: Event): void {
    event.preventDefault();
    const trimmed = this.email().trim();

    if (!trimmed || !trimmed.includes('@')) {
      this.errorMessage.set('Please enter a valid email address.');
      this.subscribed.set(false);
      return;
    }

    this.errorMessage.set('');
    this.subscribed.set(true);
    this.email.set('');
  }
}