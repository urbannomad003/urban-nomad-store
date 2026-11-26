import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loyalty',
  imports: [RouterLink],
  templateUrl: './loyalty.html',
  styleUrl: './loyalty.css',
})
export class Loyalty {
  protected signupDate = '06/13/2026';
}