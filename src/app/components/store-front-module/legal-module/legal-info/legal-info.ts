import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LEGAL_DOCUMENT_META,
  LEGAL_TOPICS,
  LegalTopic,
} from '../legal-topics/legal-topics';

@Component({
  selector: 'app-legal-info',
  templateUrl: './legal-info.html',
  styleUrl: './legal-info.css',
})
export class LegalInfo implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  protected readonly documentMeta = LEGAL_DOCUMENT_META;
  protected readonly topics = LEGAL_TOPICS;
  protected selectedTopicId = LEGAL_TOPICS[0].id;

  private querySub?: Subscription;

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const topicParam = params.get('topic');
      if (topicParam && this.topics.some((t) => t.id === topicParam)) {
        this.selectedTopicId = topicParam;
      }
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  protected get currentIndex(): number {
    return this.topics.findIndex((t) => t.id === this.selectedTopicId);
  }

  protected get selectedTopic(): LegalTopic {
    return this.topics[this.currentIndex] ?? this.topics[0];
  }

  protected get previousTopic(): LegalTopic | null {
    return this.currentIndex > 0 ? this.topics[this.currentIndex - 1] : null;
  }

  protected get nextTopic(): LegalTopic | null {
    return this.currentIndex >= 0 && this.currentIndex < this.topics.length - 1
      ? this.topics[this.currentIndex + 1]
      : null;
  }

  @HostListener('window:legal-topic-selected', ['$event'])
  protected onTopicSelected(event: Event): void {
    const customEvent = event as CustomEvent<string>;
    if (customEvent.detail && this.topics.some((t) => t.id === customEvent.detail)) {
      this.selectedTopicId = customEvent.detail;
    }
  }

  protected goToTopic(id: string): void {
    if (!this.topics.some((t) => t.id === id)) return;
    this.selectedTopicId = id;
    window.dispatchEvent(new CustomEvent('legal-topic-selected', { detail: id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}