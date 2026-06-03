import { Component, signal } from '@angular/core';
import { FortalMap } from './map/map';

@Component({
  selector: 'app-root',
  imports: [FortalMap],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('visualizacao-trabalho-final');
}
