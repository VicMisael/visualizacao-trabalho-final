import { Component, input } from '@angular/core';
import { RacialCompositionChartComponent } from '../../vega-lite-visualizacoes/racial-composition-chart.component';
import { RacialScatterComponent } from '../../vega-lite-visualizacoes/racial-scatter.component';

@Component({
  selector: 'app-race-section',
  standalone: true,
  imports: [RacialCompositionChartComponent, RacialScatterComponent],
  templateUrl: './race-section.component.html',
})
export class RaceSectionComponent {
  selectedBairros = input<string[]>([]);

}
