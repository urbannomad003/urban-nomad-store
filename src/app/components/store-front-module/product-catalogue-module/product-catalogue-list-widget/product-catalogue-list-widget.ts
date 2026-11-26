import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CatalogueWidgetItem {
  id: number;
  name: string;
  /** One or two short lines shown under the name */
  description: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-product-catalogue-list-widget',
  imports: [RouterLink],
  templateUrl: './product-catalogue-list-widget.html',
  host: { class: 'block font-sans' },
})
export class ProductCatalogueListWidget {
  items: CatalogueWidgetItem[] = [
    {
      id: 1,
      name: 'Skincare',
      description: 'Serums and daily essentials for a clear, healthy glow.',
      link: '/catalogue',
      image: '/attractive-young-middle-eastern-model-touching-her-pretty-face-with-flawless-skin-smiling.jpg',
    },
    {
      id: 2,
      name: 'Trousers',
      description: 'Relaxed, tailored and printed styles for every day.',
      link: '/catalogue',
      image: '/happy-beautiful-woman-trendy-clothes-posing-with-pensive-smile.jpg',
    },
    {
      id: 3,
      name: 'Tops & Tees',
      description: 'Easy layers and statement prints in soft fabrics.',
      link: '/catalogue',
      image: '/attractive-young-middle-eastern-model-touching-her-pretty-face-with-flawless-skin-smiling.jpg',
    },
    {
      id: 4,
      name: 'Dresses',
      description: 'From casual days to evenings out.',
      link: '/catalogue',
      image: '/happy-beautiful-woman-trendy-clothes-posing-with-pensive-smile.jpg',
    },
    {
      id: 5,
      name: 'Bags',
      description: 'Totes and crossbody bags that go with everything.',
      link: '/catalogue',
      image: '/attractive-young-middle-eastern-model-touching-her-pretty-face-with-flawless-skin-smiling.jpg',
    },
    {
      id: 6,
      name: 'Accessories',
      description: 'Scarves, jewellery and the finishing touches.',
      link: '/catalogue',
      image: '/happy-beautiful-woman-trendy-clothes-posing-with-pensive-smile.jpg',
    },
    {
      id: 7,
      name: 'Knitwear',
      description: 'Warm, light knits for cooler evenings.',
      link: '/catalogue',
      image: '/attractive-young-middle-eastern-model-touching-her-pretty-face-with-flawless-skin-smiling.jpg',
    },
    {
      id: 8,
      name: 'Outerwear',
      description: 'Jackets and overshirts built to last the season.',
      link: '/catalogue',
      image: '/happy-beautiful-woman-trendy-clothes-posing-with-pensive-smile.jpg',
    },
  ];
}