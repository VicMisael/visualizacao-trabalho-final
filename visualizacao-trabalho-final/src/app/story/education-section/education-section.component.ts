import { Component, input } from '@angular/core';
import { ScatterRendimentoAlfabetizacaoComponent } from '../../vega-lite-visualizacoes/scatter-rendimento-alfabetizacao.component';

@Component({
  selector: 'app-education-section',
  standalone: true,
  imports: [ScatterRendimentoAlfabetizacaoComponent],
  templateUrl: './education-section.component.html',
})
export class EducationSectionComponent {
  selectedBairros = input<string[]>([]);

}
