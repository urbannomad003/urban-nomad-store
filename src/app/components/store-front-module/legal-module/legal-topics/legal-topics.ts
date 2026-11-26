import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

export interface LegalSectionContent {
  paragraphs?: string[];
  bullets?: string[];
  outro?: string[];
}

export interface LegalTopic {
  id: string;
  number: string;
  title: string;
  content: LegalSectionContent;
}

export const LEGAL_DOCUMENT_META = {
  brand: 'URBAN NOMAD',
  documentTitle: 'TERMS OF USE',
  effectiveDate: '24-11-2026',
  lastUpdated: '24-11-2026',
  intro: [
    'These Terms of Use govern your access to and use of the Urban Nomad website, online store, applications, customer account functionality and related digital services (collectively, the “Platform”).',
    'By accessing or using the Platform, you agree to be bound by these Terms of Use. If you do not agree with these Terms, you must not use the Platform.',
  ],
};

export const LEGAL_TOPICS: LegalTopic[] = [
  {
    id: 'about-urban-nomad',
    number: '1',
    title: 'ABOUT URBAN NOMAD',
    content: {
      paragraphs: [
        'Urban Nomad is operated by [Full Legal Entity Name], registration number [Registration Number], a company incorporated in the Republic of South Africa.',
        'Registered/Business Address: [Address]',
        'Email: [Email Address]',
        'Telephone: [Telephone Number]',
      ],
    },
  },
  {
    id: 'eligibility',
    number: '2',
    title: 'ELIGIBILITY',
    content: {
      paragraphs: [
        'You may use the Platform only if you are legally capable of entering into a binding agreement under applicable South African law.',
        'Where a person is under the applicable age of majority, use of the Platform and the creation of an account may require the involvement or consent of a parent or legal guardian.',
      ],
    },
  },
  {
    id: 'user-accounts',
    number: '3',
    title: 'USER ACCOUNTS',
    content: {
      paragraphs: [
        'Certain features of the Platform may require you to create an account.',
        'You are responsible for:',
      ],
      bullets: [
        'providing accurate and current information;',
        'maintaining the confidentiality of your login credentials;',
        'maintaining the security of your account;',
        'ensuring that information associated with your account remains accurate; and',
        'all activity carried out through your account, unless such activity resulted from circumstances outside your reasonable control.',
      ],
      outro: [
        "You must not create an account using another person's identity or information, impersonate another person, or provide misleading information.",
      ],
    },
  },
  {
    id: 'acceptable-use',
    number: '4',
    title: 'ACCEPTABLE USE',
    content: {
      paragraphs: ['You agree not to:'],
      bullets: [
        'use the Platform for unlawful purposes;',
        "attempt to gain unauthorised access to the Platform or another user's account;",
        'interfere with the operation or security of the Platform;',
        'introduce malicious software, code or other harmful material;',
        'use automated systems to scrape, copy or systematically collect Platform content without our permission;',
        'use the Platform to commit fraud or facilitate fraudulent activity;',
        'abuse promotions, discounts, vouchers or other offers;',
        'submit false or misleading information;',
        "infringe Urban Nomad's intellectual property rights or those of third parties; or",
        'otherwise use the Platform in a manner that violates applicable law.',
      ],
    },
  },
  {
    id: 'account-suspension-and-termination',
    number: '5',
    title: 'ACCOUNT SUSPENSION AND TERMINATION',
    content: {
      paragraphs: [
        'Urban Nomad reserves the right, acting reasonably and subject to applicable law, to suspend, restrict or terminate an account where we reasonably believe that:',
      ],
      bullets: [
        'these Terms have been violated;',
        'the account has been used for fraudulent, unlawful or abusive activity;',
        'the account presents a security or operational risk;',
        'information supplied by the user is materially false or misleading;',
        'the user has engaged in conduct that may harm Urban Nomad, its customers or service providers; or',
        'suspension or termination is required by law or a competent authority.',
      ],
      outro: [
        'Where reasonably practicable, Urban Nomad may notify the affected user of the reason for suspension or termination.',
        'Suspension or termination of an account does not necessarily terminate obligations that arose before the suspension or termination, including obligations relating to completed transactions, payments, refunds, disputes or legal compliance.',
      ],
    },
  },
  {
    id: 'website-content',
    number: '6',
    title: 'WEBSITE CONTENT',
    content: {
      paragraphs: [
        'Urban Nomad makes reasonable efforts to ensure that information displayed on the Platform is accurate and current.',
        'However, product descriptions, images, colours, measurements, availability and other information may occasionally contain errors or inaccuracies.',
        "Product images are provided for illustrative purposes and actual colours may vary depending on the user's device, display settings, lighting and photography conditions.",
      ],
    },
  },
  {
    id: 'intellectual-property',
    number: '7',
    title: 'INTELLECTUAL PROPERTY',
    content: {
      paragraphs: [
        'Unless otherwise stated, all content appearing on the Platform, including:',
      ],
      bullets: [
        'logos;',
        'trademarks;',
        'photographs;',
        'product imagery;',
        'graphics;',
        'designs;',
        'text;',
        'layouts;',
        'software;',
        'interfaces; and',
        'other original material',
      ],
      outro: [
        'is owned by or licensed to Urban Nomad and is protected by applicable intellectual property laws.',
        'You may not reproduce, distribute, modify, commercially exploit or otherwise use such material without prior written permission, except where permitted by law.',
      ],
    },
  },
  {
    id: 'third-party-services',
    number: '8',
    title: 'THIRD-PARTY SERVICES',
    content: {
      paragraphs: [
        'The Platform may rely on third-party service providers, including payment processors, delivery providers, hosting providers, analytics providers and technology providers.',
        "Urban Nomad is not responsible for the independent acts, omissions, policies or availability of third-party services that are outside Urban Nomad's reasonable control.",
      ],
    },
  },
  {
    id: 'platform-availability',
    number: '9',
    title: 'PLATFORM AVAILABILITY',
    content: {
      paragraphs: [
        'Urban Nomad does not guarantee that the Platform will always be available, uninterrupted, error-free or free from security vulnerabilities.',
        'We may temporarily suspend or restrict access to the Platform for maintenance, upgrades, security reasons or other operational requirements.',
      ],
    },
  },
  {
    id: 'links-to-third-party-websites',
    number: '10',
    title: 'LINKS TO THIRD-PARTY WEBSITES',
    content: {
      paragraphs: [
        'The Platform may contain links to third-party websites or services.',
        'Such links are provided for convenience and do not constitute an endorsement of those websites or services. Urban Nomad is not responsible for the content, security or privacy practices of third-party websites.',
      ],
    },
  },
  {
    id: 'privacy',
    number: '11',
    title: 'PRIVACY',
    content: {
      paragraphs: [
        'Urban Nomad processes personal information in accordance with its Privacy Policy and applicable South African data protection laws, including the Protection of Personal Information Act 4 of 2013 (POPIA).',
        'Our Privacy Policy explains what information we collect, why we collect it, how it is used, how it is protected and how long it is retained.',
      ],
    },
  },
  {
    id: 'limitation-of-liability',
    number: '12',
    title: 'LIMITATION OF LIABILITY',
    content: {
      paragraphs: [
        'Nothing in these Terms is intended to exclude, restrict or limit any right, remedy, warranty or liability that cannot lawfully be excluded or limited under applicable law.',
        'Subject to applicable law, Urban Nomad will not be liable for losses arising from circumstances beyond its reasonable control, including failures of telecommunications networks, payment systems, delivery providers, hosting providers or other third-party infrastructure.',
      ],
    },
  },
  {
    id: 'changes-to-these-terms',
    number: '13',
    title: 'CHANGES TO THESE TERMS',
    content: {
      paragraphs: [
        'Urban Nomad may update these Terms from time to time.',
        'The updated version will be published on the Platform and will indicate the date on which it was last updated.',
        'Where required by law, users will be provided with appropriate notice of material changes.',
      ],
    },
  },
  {
    id: 'governing-law',
    number: '14',
    title: 'GOVERNING LAW',
    content: {
      paragraphs: [
        'These Terms are governed by the laws of the Republic of South Africa.',
        'Any dispute arising from these Terms will be subject to the jurisdiction of the competent courts of South Africa, subject to any mandatory rights or remedies available to consumers under applicable law.',
      ],
    },
  },
  {
    id: 'contact',
    number: '15',
    title: 'CONTACT',
    content: {
      paragraphs: [
        'Questions regarding these Terms may be directed to:',
        'Urban Nomad',
        '1140A Margaret Street Ext 1 Geluksdal, Gauteng',
        'urbannomad381@gmail.com',
        '081 424 1429',
      ],
    },
  },
];

@Component({
  selector: 'app-legal-topics',
  templateUrl: './legal-topics.html',
  styleUrl: './legal-topics.css',
  host: {
    class: 'sticky top-[64px] z-30 block bg-white lg:static lg:z-auto lg:bg-transparent',
  },
})
export class LegalTopics implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly route = inject(ActivatedRoute);

  @Input() sectionEl?: HTMLElement;

  protected readonly topics = LEGAL_TOPICS;
  protected selectedTopicId = LEGAL_TOPICS[0].id;
  protected mobileDropdownOpen = false;
  protected desktopOffsetY = 0;

  private rafId: number | null = null;
  private querySub?: Subscription;

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const topicParam = params.get('topic');
      if (topicParam && this.topics.some((t) => t.id === topicParam)) {
        this.selectedTopicId = topicParam;
      }
    });

    this.updateDesktopPosition();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  protected get selectedTopic(): LegalTopic {
    return this.topics.find((t) => t.id === this.selectedTopicId) ?? this.topics[0];
  }

  protected toggleDropdown(): void {
    this.mobileDropdownOpen = !this.mobileDropdownOpen;
  }

  protected onSelectTopic(id: string): void {
    this.selectedTopicId = id;
    this.mobileDropdownOpen = false;
    window.dispatchEvent(new CustomEvent('legal-topic-selected', { detail: id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  protected onViewportChange(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateDesktopPosition();
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.mobileDropdownOpen) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.mobileDropdownOpen = false;
    }
  }

  private updateDesktopPosition(): void {
    if (window.innerWidth < 1024) {
      this.desktopOffsetY = 0;
      return;
    }

    const hostEl = this.elementRef.nativeElement;
    const asideEl = hostEl.querySelector('aside') as HTMLElement | null;
    const section = this.sectionEl ?? (hostEl.closest('section') as HTMLElement | null);

    if (!asideEl || !section) {
      this.desktopOffsetY = 0;
      return;
    }

    const topOffset = 112; // aligns with lg:top-28 (7rem = 112px)
    const bottomGap = 32;
    const hostRect = hostEl.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const asideHeight = asideEl.offsetHeight;

    // Desired offset to keep aside aligned at topOffset while inside section
    const desiredTopInHost = Math.max(0, topOffset - hostRect.top);
    // Max offset so aside bottom never passes section bottom minus bottomGap
    const maxOffsetInHost = Math.max(0, sectionRect.height - 112 - bottomGap - asideHeight);

    this.desktopOffsetY = Math.min(desiredTopInHost, maxOffsetInHost);
  }
}