import { Component } from '@angular/core';
import { ContactForm } from '../../../components/store-front-module/support-module/contact-form/contact-form';
import { SupportInfo } from '../../../components/store-front-module/support-module/support-info/support-info';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [SupportInfo, ContactForm],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {}