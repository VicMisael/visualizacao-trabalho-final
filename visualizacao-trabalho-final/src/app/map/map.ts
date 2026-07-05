import { afterNextRender, Component, DestroyRef, effect, ElementRef, inject, model, output, viewChild } from '@angular/core';
import * as d3 from 'd3';
import { GeoDataService } from '../../core/services/geo-data';
import { DrillLevel } from '../../core/models/drill-level';
import { Controls } from './controls/controls';
import { Description } from './description/description';
import { FortalezaFeatureCollection, FortalezaMapFeature } from './map.types';
import { SubdivisionDataService } from '../../core/services/subdivision-data';
import { SimplifiedCensusRow } from '../../core/models/public-data.models';

type MapMetric = {
  key: string;
  label: string;
  missingColor: string;
  interpolator: (value: number) => string;
};

@Component({
  selector: 'fortal-map',
  imports: [Controls, Description],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class FortalMap {

  currentDrillDownLevel = model<DrillLevel>(DrillLevel.DISTRITOS);
  automaticDrilldown = model(false);

  elementClicked = output<FortalezaMapFeature>();
  selectedBairros = output<string[]>();

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly geoData = inject(GeoDataService);
  private readonly subdivisionData = inject(SubdivisionDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly metrics = {
    averageIncome: {
      key: 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados',
      label: 'Renda média',
      missingColor: '#eef2ef',
      interpolator: d3.interpolateYlGnBu,
    },
  } satisfies Record<string, MapMetric>;

  private readonly selectedMetric = this.metrics.averageIncome;
  private readonly dataByLevel = new Map<DrillLevel, Promise<Map<string, SimplifiedCensusRow>>>();

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoom?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private viewportLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private mapLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private detailLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;

  private path?: d3.GeoPath;
  private width = 0;
  private height = 0;
  private detailFrameId: number | null = null;
  private detailRenderVersion = 0;
  private mapReady = false;


  constructor() {
    effect(() => {
      const drillLevel = this.currentDrillDownLevel();

      if (this.mapReady) {
        if (drillLevel === DrillLevel.DISTRITOS) {
          this.resetSelectedBairros();
        }

        this.scheduleDrawDetail();
      }
    });

    effect(() => {
      const automaticDrilldown = this.automaticDrilldown();

      if (automaticDrilldown && this.mapReady) {
        this.syncDrilldownWithCurrentZoom();
      }
    });

    afterNextRender(() => {
      void this.initializeMap();
    });

    this.destroyRef.onDestroy(() => {
      if (this.detailFrameId !== null) {
        cancelAnimationFrame(this.detailFrameId);
      }
    });
  }

  private async initializeMap() {
    await this.drawMap();
    await this.drawDetail();
  }

  private async drawMap() {


    await this.renderMap();
  }

  private async drawDetail() {
    const renderVersion = ++this.detailRenderVersion;
    const drillLevel = this.currentDrillDownLevel();

    if (drillLevel != DrillLevel.DISTRITOS) {
      const geojson = (await this.geoData.loadLayer(drillLevel)) as FortalezaFeatureCollection;

      if (renderVersion !== this.detailRenderVersion) {
        return;
      }

      const transform = d3.zoomTransform(this.svg?.node()!);
      await this.renderDetail(
        this.getVisibleFeatures(geojson.features, transform),
        drillLevel,
        renderVersion,
      );
      return;
    }

    this.clearDetailLayer();
  }

  private async renderMap() {
    const geojson = (await this.geoData.loadLayer(DrillLevel.DISTRITOS)) as FortalezaFeatureCollection;
    const fillColor = await this.getFillColor(DrillLevel.DISTRITOS);
    const container = this.mapContainer().nativeElement;

    this.width = container.clientWidth || 900;
    this.height = container.clientHeight;

    d3.select(container).selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([this.width, this.height], geojson);
    const path = d3.geoPath(projection);
    this.path = path;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('width', '100%')
      .attr('height', '100%');
    this.svg = svg;


    const viewportLayer = svg.append('g').attr('class', 'viewport-layer');
    this.mapLayer = viewportLayer.append('g').attr('class', 'map-layer');
    this.detailLayer = viewportLayer.append('g').attr('class', 'bairros-layer');
    this.viewportLayer = viewportLayer;

    this.zoom = this.setupZoom(svg, this.viewportLayer, this.width, this.height);

    this.mapLayer
      .selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path)
      .attr('fill', fillColor)
      .attr('stroke', '#38514a')
      .attr('stroke-width', 0.6)
      .on('click', (event, feature) => this.handleFeatureClick(event, feature, DrillLevel.DISTRITOS));

    this.mapReady = true;
  }

  private setupZoom(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    layer: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number,
  ): d3.ZoomBehavior<SVGSVGElement, unknown> {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [2 * width, 2 * height],
      ])
      .translateExtent([
        [-width / 2, -height / 2],
        [2 * width, 2 * height],
      ])
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        layer.attr('transform', event.transform.toString());

        if (this.automaticDrilldown()) {
          this.processZoom(event);
          return;
        }

        this.scheduleDrawDetail();
      });

    svg.call(zoom);

    return zoom;
  }



  private async renderDetail(
    features: FortalezaMapFeature[],
    drillLevel: DrillLevel,
    renderVersion: number,
  ) {
    if (this.detailLayer == null || this.path == null) {
      return;
    }

    const fillColor = await this.getFillColor(drillLevel);

    if (renderVersion !== this.detailRenderVersion) {
      return;
    }

    this.detailLayer
      .selectAll('path')
      .data(features, (feature) => this.getFeatureKey(feature as FortalezaMapFeature, drillLevel))
      .join('path')
      .attr('d', this.path)
      .attr('fill', fillColor)
      .attr('stroke', '#38514a')
      .attr('stroke-width', 0.6)
      .on('click', (event, feature) => this.handleFeatureClick(event, feature, drillLevel));

  }

  private handleFeatureClick(
    event: MouseEvent,
    feature: FortalezaMapFeature,
    drillLevel: DrillLevel,
  ): void {
    event.stopPropagation();
    this.elementClicked.emit(feature);
    void this.emitSelectedBairros(feature, drillLevel);
    this.zoomToFeature(feature);
  }

  private async emitSelectedBairros(
    feature: FortalezaMapFeature,
    drillLevel: DrillLevel,
  ): Promise<void> {
    this.selectedBairros.emit(await this.getSelectedBairroCodes(feature, drillLevel));
  }

  private async getSelectedBairroCodes(
    feature: FortalezaMapFeature,
    drillLevel: DrillLevel,
  ): Promise<string[]> {
    switch (drillLevel) {
      case DrillLevel.DISTRITOS:
        return [];
      case DrillLevel.SUBDISTRITOS:
        return this.getBairroCodesByPrefix('CD_SUBDIST', feature.properties?.CD_SUBDIST);
      case DrillLevel.BAIRRO:
        return this.toCodeList(feature.properties?.CD_BAIRRO);
      case DrillLevel.SETORES:
        return this.toCodeList(feature.properties?.CD_BAIRRO);
    }
  }

  private async getBairroCodesByPrefix(
    prefixField: keyof FortalezaMapFeature['properties'],
    prefixValue: unknown,
  ): Promise<string[]> {
    const prefix = this.normalizeCode(prefixValue);

    if (!prefix) {
      return [];
    }

    const bairros = (await this.geoData.loadLayer(DrillLevel.BAIRRO)) as FortalezaFeatureCollection;
    const bairroCodes = bairros.features
      .filter((bairro) => this.normalizeCode(bairro.properties?.[prefixField]).startsWith(prefix))
      .map((bairro) => this.normalizeCode(bairro.properties?.CD_BAIRRO))
      .filter((code): code is string => code.length > 0);

    return [...new Set(bairroCodes)];
  }

  private toCodeList(value: unknown): string[] {
    const code = this.normalizeCode(value);

    return code ? [code] : [];
  }

  private normalizeCode(value: unknown): string {
    return value == null ? '' : String(value).trim();
  }

  protected resetSelectedBairros(): void {
    this.selectedBairros.emit([]);
  }

  private clearDetailLayer(): void {
    this.detailLayer?.selectAll('*').remove();
  }

  private async getFillColor(
    drillLevel: DrillLevel,
  ): Promise<(feature: FortalezaMapFeature) => string> {
    const metric = this.selectedMetric;
    const rowsByCode = await this.getDataByLevel(drillLevel);
    const values = [...rowsByCode.values()]
      .map((row) => this.getNumericMetricValue(row, metric.key))
      .filter((value): value is number => value != null);
    const domain = d3.extent(values);

    if (domain[0] == null || domain[1] == null) {
      return () => metric.missingColor;
    }

    const scale = domain[0] === domain[1]
      ? () => metric.interpolator(0.65)
      : d3.scaleSequential(domain as [number, number], metric.interpolator);

    return (feature) => {
      const row = this.getFeatureData(feature, drillLevel, rowsByCode);
      const value = row ? this.getNumericMetricValue(row, metric.key) : null;

      return value == null ? metric.missingColor : scale(value);
    };
  }

  private getFeatureData(
    feature: FortalezaMapFeature,
    drillLevel: DrillLevel,
    rowsByCode: Map<string, SimplifiedCensusRow>,
  ): SimplifiedCensusRow | undefined {
    if (drillLevel === DrillLevel.DISTRITOS) {
      return rowsByCode.get(DrillLevel.DISTRITOS);
    }

    const codeField = this.getCodeField(drillLevel);
    const code = codeField ? feature.properties?.[codeField] : null;

    return code == null ? undefined : rowsByCode.get(String(code).trim());
  }

  private getNumericMetricValue(row: SimplifiedCensusRow, key: string): number | null {
    const value = row[key];

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const numericValue = Number(value.replace(',', '.'));

      return Number.isFinite(numericValue) ? numericValue : null;
    }

    return null;
  }

  private getDataByLevel(drillLevel: DrillLevel): Promise<Map<string, SimplifiedCensusRow>> {
    const cached = this.dataByLevel.get(drillLevel);

    if (cached) {
      return cached;
    }

    const request = this.loadDataByLevel(drillLevel);
    this.dataByLevel.set(drillLevel, request);

    return request;
  }

  private async loadDataByLevel(drillLevel: DrillLevel): Promise<Map<string, SimplifiedCensusRow>> {
    switch (drillLevel) {
      case DrillLevel.DISTRITOS: {
        const [district] = await this.subdivisionData.getFortalezaDistrictAsync();

        return new Map([[DrillLevel.DISTRITOS, district]]);
      }
      case DrillLevel.SUBDISTRITOS: {
        const rows = await this.subdivisionData.getSubdistritosAsync();

        return this.mapRowsByCode(rows, 'CD_SUBDIST');
      }
      case DrillLevel.BAIRRO: {
        const rows = await this.subdivisionData.getBairrosAsync();

        return this.mapRowsByCode(rows, 'CD_BAIRRO');
      }
      case DrillLevel.SETORES: {
        const rows = await this.subdivisionData.getSectors();

        return this.mapRowsByCode(rows, 'CD_SETOR');
      }
    }
  }

  private mapRowsByCode<T extends SimplifiedCensusRow>(
    rows: T[],
    codeField: keyof T,
  ): Map<string, SimplifiedCensusRow> {
    return new Map(
      rows.map((row) => [String(row[codeField]).trim(), row]),
    );
  }

  private getCodeField(drillLevel: DrillLevel): keyof FortalezaMapFeature['properties'] | null {
    switch (drillLevel) {
      case DrillLevel.SUBDISTRITOS:
        return 'CD_SUBDIST';
      case DrillLevel.BAIRRO:
        return 'CD_BAIRRO';
      case DrillLevel.SETORES:
        return 'CD_SETOR';
      case DrillLevel.DISTRITOS:
        return null;
    }
  }

  private getFeatureKey(feature: FortalezaMapFeature, drillLevel: DrillLevel): string {
    const codeField = this.getCodeField(drillLevel);

    return String(codeField ? feature.properties?.[codeField] : feature.properties?.id);
  }


  // ==========================================
  // 1. ZOOM
  // ==========================================



  private processZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    //console.log("[Zoom level]", event.transform.k);
    this.setDrillLevelFromScale(event.transform.k);
  }

  private syncDrilldownWithCurrentZoom(): void {
    const svgNode = this.svg?.node();

    if (!svgNode) {
      return;
    }

    this.setDrillLevelFromScale(d3.zoomTransform(svgNode).k);
  }

  private setDrillLevelFromScale(k: number): void {
    let d: DrillLevel = DrillLevel.DISTRITOS;

    if (k > 5) {
      d = DrillLevel.SETORES;
    } else if (k > 3) {
      d = DrillLevel.BAIRRO;
    } else if (k > 2.4) {
      d = DrillLevel.SUBDISTRITOS;
    }

    if (this.currentDrillDownLevel() === d) {
      this.scheduleDrawDetail();
      return;
    }

    this.currentDrillDownLevel.set(d);
  }

  private scheduleDrawDetail(): void {
    if (this.detailFrameId !== null) {
      return;
    }

    this.detailFrameId = window.requestAnimationFrame(() => {
      this.detailFrameId = null;
      void this.drawDetail();
    });
  }

  private getVisibleFeatures(
    features: FortalezaMapFeature[],
    transform: d3.ZoomTransform,
  ): FortalezaMapFeature[] {
    if (!this.path || this.width === 0 || this.height === 0) {
      return [];
    }

    const viewportBounds = this.getViewportBounds(transform);

    return features.filter((feature) => {
      const featureBounds = this.path!.bounds(feature);

      return this.boundsIntersect(featureBounds, viewportBounds);
    });
  }

  private getViewportBounds(
    transform: d3.ZoomTransform,
  ): [[number, number], [number, number]] {
    return [
      transform.invert([0, 0]),
      transform.invert([this.width, this.height]),
    ];
  }

  private boundsIntersect(
    featureBounds: [[number, number], [number, number]],
    viewportBounds: [[number, number], [number, number]],
  ): boolean {
    const [[featureX0, featureY0], [featureX1, featureY1]] = featureBounds;
    const [[viewportX0, viewportY0], [viewportX1, viewportY1]] = viewportBounds;

    return (
      featureX1 >= viewportX0 &&
      featureX0 <= viewportX1 &&
      featureY1 >= viewportY0 &&
      featureY0 <= viewportY1
    );
  }

  private zoomToFeature(
    feature: FortalezaMapFeature,
  ) {
    if (!this.path || !this.svg || !this.zoom || this.width === 0 || this.height === 0) {
      return;
    }

    console.log("Zooming to Feature")
    const [[x0, y0], [x1, y1]] = this.path.bounds(feature);

    const dx = x1 - x0;
    const dy = y1 - y0;

    if (dx === 0 || dy === 0) {
      return;
    }

    const centerX = (x0 + x1) / 2;
    const centerY = (y0 + y1) / 2;
    const scale = Math.min(20, 0.60 / Math.max(dx / this.width, dy / this.height));
    const translateX = this.width / 2 - scale * centerX;
    const translateY = this.height / 2 - scale * centerY;
    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    this.svg
      .transition()
      .duration(350)
      .call(this.zoom.transform, transform);

  }
}
