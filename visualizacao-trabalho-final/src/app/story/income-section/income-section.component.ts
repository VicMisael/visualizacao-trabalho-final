import { Component } from '@angular/core';
import { RendaBairrosChartComponent } from '../../vega-lite-visualizacoes/renda-bairros-chart.component';

@Component({
  selector: 'app-income-section',
  standalone: true,
  imports: [RendaBairrosChartComponent],
  templateUrl: './income-section.component.html',
//   styleUrl: './income-section.component.scss'
})
export class IncomeSectionComponent {

}