import { Component, input } from '@angular/core';
import { RendaMulherResponsavelScatterComponent } from '../../vega-lite-visualizacoes/renda-mulher-responsavel-scatter.component';

@Component({
  selector: 'app-women-section',
  standalone: true,
  imports: [RendaMulherResponsavelScatterComponent],
  templateUrl: './women-section.component.html',
})
export class WomenSectionComponent {
  selectedBairros = input<string[]>([]);

}
