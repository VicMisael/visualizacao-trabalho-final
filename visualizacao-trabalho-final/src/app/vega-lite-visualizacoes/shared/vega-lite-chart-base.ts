import {
  AfterViewInit,
  Directive,
  ElementRef,
  effect,
  input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import embed, { VisualizationSpec } from 'vega-embed';

@Directive()
export abstract class VegaLiteChartBase
  implements AfterViewInit, OnDestroy
{
  selectedBairros = input<string[]>([]);

  @ViewChild('chart', { static: true })
  protected chartContainer!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;
  private viewReady = false;

  constructor() {
    effect(() => {
      this.selectedBairros();

      if (this.viewReady) {
        void this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;

    void this.render();

    this.resizeObserver = new ResizeObserver(() => {

      void this.render();

    });

    this.resizeObserver.observe(
      this.chartContainer.nativeElement.parentElement!
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected hasSelectedBairros(): boolean {
    return this.selectedBairros().length > 0;
  }

  protected isSelectedBairro(row: Record<string, unknown>): boolean {
    const code = this.getBairroCode(row);

    return code.length > 0 && this.selectedBairros().map(String).includes(code);
  }

  protected withSelectedFlag<T extends Record<string, unknown>>(
    rows: T[],
  ): Array<T & { selecionado: boolean }> {
    return rows.map((row) => ({
      ...row,
      selecionado: this.isSelectedBairro(row),
    }));
  }

  protected includeSelectedRows<T extends Record<string, unknown>>(
    visibleRows: T[],
    allRows: T[],
  ): T[] {
    if (!this.hasSelectedBairros()) {
      return visibleRows;
    }

    const visibleCodes = new Set(visibleRows.map((row) => this.getBairroCode(row)));
    const selectedRows = allRows.filter((row) => {
      const code = this.getBairroCode(row);

      return code.length > 0 && !visibleCodes.has(code) && this.isSelectedBairro(row);
    });

    return [...visibleRows, ...selectedRows];
  }

  private getBairroCode(row: Record<string, unknown>): string {
    return String(row['CD_BAIRRO'] ?? row['cdBairro'] ?? '').trim();
  }

  protected async loadData(): Promise<Array<Record<string, unknown>>> {
    const dataUrl = new URL(
      'data/bairros/Base_Fortaleza_Consolidada.json',
      document.baseURI,
    );
    const response = await fetch(dataUrl);
    return response.json();
  }

  protected async embedChart(spec: any): Promise<void> {

    spec.width =
      this.chartContainer.nativeElement.parentElement!.clientWidth;

    await embed(this.chartContainer.nativeElement, spec, {
      actions: false,
    });
  }

 protected abstract createSpec(
  data: Array<Record<string, unknown>>,
  width: number
): Promise<VisualizationSpec> | VisualizationSpec;

  protected async render(): Promise<void> {

  const data = await this.loadData();

  const width =
    this.chartContainer.nativeElement.parentElement!.clientWidth;

  const spec = await this.createSpec(data, width);

  await this.embedChart(spec);

}
}
