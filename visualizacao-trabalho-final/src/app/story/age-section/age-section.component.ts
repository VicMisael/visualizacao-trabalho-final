import { Component, input } from '@angular/core';
import { IdadeSexoBairrosChartComponent } from '../../vega-lite-visualizacoes/idade-sexo-bairros-chart.component';

@Component({
  selector: 'app-age-section',
  standalone: true,
  imports: [IdadeSexoBairrosChartComponent],
  templateUrl: './age-section.component.html',
})
export class AgeSectionComponent {
  selectedBairros = input<string[]>([]);

}
