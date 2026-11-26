import { Component } from '@angular/core';
import { LegalInfo } from '../../../components/store-front-module/legal-module/legal-info/legal-info';
import { LegalTopics } from '../../../components/store-front-module/legal-module/legal-topics/legal-topics';

@Component({
  selector: 'app-legal',
  imports: [LegalInfo, LegalTopics],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {}