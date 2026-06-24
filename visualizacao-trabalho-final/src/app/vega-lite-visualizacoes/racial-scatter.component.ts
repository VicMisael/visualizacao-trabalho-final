import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';

type RacialScatterDatum = {
  bairro: string;
  rendimento: number;
  populacao: number;
  racializados: number;
  proporcaoNegra: number;
  destaque: boolean;
};

@Component({
  selector: 'app-racial-scatter',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RacialScatterComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

    const dadosScatter = this.prepareData(data);

    const points = {
      data: { values: dadosScatter },
      mark: { type: 'circle' as const, size: 90, opacity: 0.75 },
      encoding: {
        x: {
          field: 'proporcaoNegra' as const,
          type: 'quantitative' as const,
          title: 'População Racializada (%)',
        },
        y: {
          field: 'rendimento' as const,
          type: 'quantitative' as const,
          title: 'Rendimento Nominal Médio',
        },
        color: {
          field: 'destaque' as const,
          type: 'nominal' as const,
          scale: {
            domain: [true, false],
            range: ['#d62728', '#1f77b4'],
          },
          legend: {
            title: 'Grupo',
            labelExpr: "datum.value ? 'Top 10 renda' : 'Outros bairros'",
          },
        },
        opacity: {
          condition: { test: 'datum.destaque === true', value: 1 },
          value: 0.4,
        },
        tooltip: [
          { field: 'bairro' as const, type: 'nominal' as const },
          { field: 'rendimento' as const, type: 'quantitative' as const },
          { field: 'populacao' as const, type: 'quantitative' as const },
          { field: 'racializados' as const, type: 'quantitative' as const },
          { field: 'proporcaoNegra' as const, type: 'quantitative' as const },
        ],
      },
    };

    const regression = {
      data: { values: dadosScatter },
      transform: [
        {
          regression: 'rendimento' as const,
          on: 'proporcaoNegra' as const,
          method: 'linear' as const,
        },
      ],
      mark: { type: 'line' as const, color: 'black', strokeWidth: 2 },
      encoding: {
        x: { field: 'proporcaoNegra' as const, type: 'quantitative' as const },
        y: { field: 'rendimento' as const, type: 'quantitative' as const },
      },
    };

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Correlação entre Rendimento Nominal Médio e Proporção de População Racializada nos Bairros de Fortaleza',
      width: 650,
      height: 450,
      layer: [points, regression],
    };

    await embed(this.chartContainer.nativeElement, spec);
  }

  private prepareData(data: Array<Record<string, unknown>>): RacialScatterDatum[] {
    const dadosScatter = data.map((d) => {
      const rendimento = this.parseNumber(
        d['Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados']
      );

      const populacao = this.sumValues(d, [
        '0 a 4 anos',
        '5 a 9 anos',
        '10 a 14 anos',
        '15 a 19 anos',
        '20 a 24 anos',
        '25 a 29 anos',
        '30 a 39 anos',
        '40 a 49 anos',
        '50 a 59 anos',
        '60 a 69 anos',
        '70 anos ou mais',
      ]);

      const racializados = this.sumValues(d, [
        'Cor ou raça é preta',
        'Cor ou raça é parda',
        'Cor ou raça é indígena',
        'Cor ou raça é amarela',
      ]);

      const proporcaoNegra = populacao > 0 ? (racializados / populacao) * 100 : 0;

      return {
        bairro: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
        rendimento,
        populacao,
        racializados,
        proporcaoNegra,
        destaque: false,
      } satisfies RacialScatterDatum;
    });

    const topN = new Set(
      [...dadosScatter]
        .sort((a, b) => b.rendimento - a.rendimento)
        .slice(0, 10)
        .map((d) => d.bairro)
    );

    return dadosScatter.map((d) => ({ ...d, destaque: topN.has(d.bairro) }));
  }

  private sumValues(d: Record<string, unknown>, keys: string[]): number {
    return keys.reduce((acc, key) => acc + this.parseNumber(d[key]), 0);
  }

  private parseNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/\./g, '').replace(',', '.').trim();
      const parsed = Number.parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }
}
