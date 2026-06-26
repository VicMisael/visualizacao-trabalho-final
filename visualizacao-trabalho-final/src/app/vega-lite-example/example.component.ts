import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import embed from 'vega-embed';
import { VisualizationSpec } from 'vega-embed';


@Component({
  selector: 'app-chart',
  template: `<div #chart></div>`
})
export class ChartComponent implements AfterViewInit {

  @ViewChild('chart', { static: true })
  chartContainer!: ElementRef;

  async ngAfterViewInit() {
const spec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  data: {
    values: [
      { a: 'A', b: 28 },
      { a: 'B', b: 55 },
      { a: 'C', b: 43 }
    ]
  },
  mark: 'bar',
  encoding: {
    x: {
      field: 'a',
      type: 'nominal'
    },
    y: {
      field: 'b',
      type: 'quantitative'
    }
  }
};
    await embed(this.chartContainer.nativeElement, spec);
  }
}