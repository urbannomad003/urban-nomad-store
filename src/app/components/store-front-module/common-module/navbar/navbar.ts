import { Component, computed, effect, ElementRef, HostListener, inject, Input, OnDestroy, signal, viewChild } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RetrieveUserInfoService } from '../../../../services/store-front-module/users-module/retrieve-user-info.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnDestroy {
  private router = inject(Router);
  private auth = inject(Auth);
  private retrieveUserInfoService = inject(RetrieveUserInfoService);
  private panel = viewChild<ElementRef<HTMLElement>>('panel');

  private currentUser = toSignal(user(this.auth), { initialValue: null });
  private firestoreFirstName = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.currentUser());

  userInitial = computed(() => {
    const u = this.currentUser();
    if (!u) return '';

    const source =
      this.firestoreFirstName()?.trim() ||
      u.displayName?.trim() ||
      u.email?.trim() ||
      '';

    return source.charAt(0).toUpperCase();
  });

  /** Number of items in the shopping cart */
  @Input() bagCount = 0;
  /** Number of unread notifications */
  @Input() alertCount = 0;

  menuOpen = signal(false);
  /** Height (px) the mobile menu grows to so it fills the rest of the screen */
  panelHeight = signal(0);

  headerLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Support', path: '/support' },
    { label: 'Loyalty', path: '/loyalty' },
    { label: 'Legal', path: '/legal' },
  ];

  links: NavLink[] = [
    { label: 'Featured Products – On Sale', path: '/featured' },
    { label: 'Trending Now', path: '/trending' },
    { label: 'Clearance Sale', path: '/clearance' },
  ];

  constructor() {
    effect(async (onCleanup) => {
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      const u = this.currentUser();
      if (!u) {
        this.firestoreFirstName.set(null);
        return;
      }

      try {
        const profile = await this.retrieveUserInfoService.getUserProfile(u.uid);
        if (!cancelled) {
          this.firestoreFirstName.set(profile?.firstName ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Navbar] Failed to load user first name:', err);
          this.firestoreFirstName.set(null);
        }
      }
    });
  }

  toggleMenu() {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu() {
    this.measurePanel();
    this.menuOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
  }

  /** Distance from the top of the menu to the bottom of the screen */
  private measurePanel() {
    const el = this.panel()?.nativeElement;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    this.panelHeight.set(Math.max(0, Math.round(window.innerHeight - top)));
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.menuOpen()) return;
    if (window.innerWidth >= 1024) {
      this.closeMenu();
    } else {
      this.measurePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  onSearch(event: Event, term: string) {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    this.closeMenu();
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }
}