import { Component, signal } from '@angular/core';
import { FortalMap } from './map/map';
import { RacialCompositionChartComponent } from './vega-lite-visualizacoes/racial-composition-chart.component';
import { RendaBairrosChartComponent } from './vega-lite-visualizacoes/renda-bairros-chart.component';
import { IdadeSexoBairrosChartComponent } from './vega-lite-visualizacoes/idade-sexo-bairros-chart.component';
import { ScatterRendimentoAlfabetizacaoComponent } from './vega-lite-visualizacoes/scatter-rendimento-alfabetizacao.component';
import { RacialScatterComponent } from './vega-lite-visualizacoes/racial-scatter.component';
import { RendaMulherResponsavelScatterComponent } from './vega-lite-visualizacoes/renda-mulher-responsavel-scatter.component';

@Component({
  selector: 'app-root',
  imports: [FortalMap, RacialCompositionChartComponent, RendaBairrosChartComponent, IdadeSexoBairrosChartComponent, ScatterRendimentoAlfabetizacaoComponent, RacialScatterComponent, RendaMulherResponsavelScatterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('visualizacao-trabalho-final');

  mapElementClickListener(obj:Object){

    console.log(obj)
    
  }
}
