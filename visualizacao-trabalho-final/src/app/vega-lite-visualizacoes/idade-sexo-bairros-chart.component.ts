import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';
import { RendaDatum } from './models/chart-data.models';
import { buildTopIncomeNeighborhoods } from './models/chart-data.utils';
import { parseNumericValue } from './models/chart-data.models';

type StackedDatum = {
  bairro: string;
  sexo: string;
  FaixaEtaria: string;
  Populacao: number;
};

@Component({
  selector: 'app-idade-sexo-bairros-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class IdadeSexoBairrosChartComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const top10Renda = buildTopIncomeNeighborhoods(data, chaveRenda);
    const dados = this.buildStackedData(top10Renda);
    const faixas = ['0 a 14 anos', '15 a 29 anos', '30 a 59 anos', '60 anos ou mais'];

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Distribuição por sexo e faixa etária nos 10 bairros com maior rendimento',
      width: 400,
      height: 350,
      data: { values: dados },
      transform: [{ fold: faixas, as: ['FaixaEtaria', 'Populacao'] }],
      mark: { type: 'bar' },
      encoding: {
        y: {
          field: 'bairro',
          type: 'nominal',
          sort: top10Renda.map((d) => d.NM_BAIRRO ?? ''),
        },
        x: {
          field: 'Populacao',
          type: 'quantitative',
          stack: 'zero',
        },
        color: {
          field: 'FaixaEtaria',
          type: 'nominal',
        },
        column: {
          field: 'sexo',
          type: 'nominal',
        },
        tooltip: [
          { field: 'bairro', type: 'nominal' },
          { field: 'sexo', type: 'nominal' },
          { field: 'FaixaEtaria', type: 'nominal' },
          { field: 'Populacao', type: 'quantitative' },
        ],
      },
    };

    await embed(this.chartContainer.nativeElement, spec);
  }

  private buildStackedData(top10Renda: RendaDatum[]): StackedDatum[] {
    return top10Renda.flatMap((d) => {
      const masculino = {
        bairro: d.NM_BAIRRO,
        sexo: 'Masculino',
        '0 a 14 anos': this.sumRange(d, ['Sexo masculino, 0 a 4 anos', 'Sexo masculino, 5 a 9 anos', 'Sexo masculino, 10 a 14 anos']),
        '15 a 29 anos': this.sumRange(d, ['Sexo masculino, 15 a 19 anos', 'Sexo masculino, 20 a 24 anos', 'Sexo masculino, 25 a 29 anos']),
        '30 a 59 anos': this.sumRange(d, ['Sexo masculino, 30 a 39 anos', 'Sexo masculino, 40 a 49 anos', 'Sexo masculino, 50 a 59 anos']),
        '60 anos ou mais': this.sumRange(d, ['Sexo masculino, 60 a 69 anos', 'Sexo masculino, 70 anos ou mais']),
      };

      const feminino = {
        bairro: d.NM_BAIRRO,
        sexo: 'Feminino',
        '0 a 14 anos': this.sumRange(d, ['Sexo feminino, 0 a 4 anos', 'Sexo feminino, 5 a 9 anos', 'Sexo feminino, 10 a 14 anos']),
        '15 a 29 anos': this.sumRange(d, ['Sexo feminino, 15 a 19 anos', 'Sexo feminino, 20 a 24 anos', 'Sexo feminino, 25 a 29 anos']),
        '30 a 59 anos': this.sumRange(d, ['Sexo feminino, 30 a 39 anos', 'Sexo feminino, 40 a 49 anos', 'Sexo feminino, 50 a 59 anos']),
        '60 anos ou mais': this.sumRange(d, ['Sexo feminino, 60 a 69 anos', 'Sexo feminino, 70 anos ou mais']),
      };

      return [masculino, feminino];
    }) as unknown as StackedDatum[];
  }

  private sumRange(d: RendaDatum, keys: string[]): number {
    return keys.reduce((acc, key) => acc + parseNumericValue(d[key]), 0);
  }
}
