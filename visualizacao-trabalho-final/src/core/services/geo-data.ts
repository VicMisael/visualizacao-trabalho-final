import { Injectable } from '@angular/core';
import { DrillLevel } from '../models/drill-level';

const layerPaths: Record<DrillLevel, string> = {
  [DrillLevel.BAIRRO]: 'geojsons/FORTALEZA_BAIRROS.geojson',
  [DrillLevel.SETORES]: 'geojsons/FORTALEZA_SETORES.geojson',
  [DrillLevel.DISTRITOS]: 'geojsons/FORTALEZA_DISTRITOS.geojson',
  [DrillLevel.SUBDISTRITOS]: 'geojsons/FORTALEZA_SUBDISTRITOS.geojson',
};

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly cache = new Map<DrillLevel, GeoJSON.FeatureCollection>();
  private readonly loadAllPromise: Promise<void>;

  constructor() {
    this.loadAllPromise = this.fetchAllLayers();
  }


  private async fetchAllLayers(): Promise<void> {
    const entries = await Promise.all(
      Object.entries(layerPaths).map(async ([layer, path]) => {
        const response = await fetch(path);

        if (!response.ok) {
          throw new Error(`Could not load ${path}: ${response.status}`);
        }

        const geojson = (await response.json()) as GeoJSON.FeatureCollection;

        return [layer as DrillLevel, geojson] as const;
      }),
    );

    for (const [layer, geojson] of entries) {
      this.cache.set(layer, geojson);
    }
  }

  loadAllLayers(): Promise<void> {
    if (this.cache.size === Object.keys(layerPaths).length) {
      return Promise.resolve();
    }

    return this.loadAllPromise;
  }

  loadLayer(layer: DrillLevel): Promise<GeoJSON.FeatureCollection> {
    return this.loadAllLayers().then(() => this.getLayer(layer));
  }

  getLayer(layer: DrillLevel): GeoJSON.FeatureCollection {
    const cached = this.cache.get(layer);

    if (!cached) {
      throw new Error(`Layer "${layer}" was not loaded`);
    }

    return cached;
  }
  
  filterByProperty(
    geojson: GeoJSON.FeatureCollection,
    propertyName: string,
    propertyValue: string | number,
  ): GeoJSON.FeatureCollection {
    const expectedValue = String(propertyValue);

    return {
      ...geojson,
      features: geojson.features.filter((feature) => {
        const properties = feature.properties as Record<string, unknown> | null;

        return String(properties?.[propertyName]) === expectedValue;
      }),
    };
  }

  filterByPropertyIn(
    geojson: GeoJSON.FeatureCollection,
    propertyName: string,
    propertyValues: Array<string>,
  ): GeoJSON.FeatureCollection {
    const expectedValues = new Set(propertyValues.map(String));

    return {
      ...geojson,
      features: geojson.features.filter((feature) => {
        const properties = feature.properties as Record<string, unknown> | null;

        return expectedValues.has(String(properties?.[propertyName]));
      }),
    };
  }

  filterBairrosBySubdistritos(
    codigoSubdistritos: string[],
  ): GeoJSON.FeatureCollection {
    const bairros = this.getLayer(DrillLevel.BAIRRO);

    return this.filterByPropertyIn(bairros, 'CD_SUBDIST', codigoSubdistritos);
  }


  filterSetoresByBairros(codigoBairros: string[]): GeoJSON.FeatureCollection {
    const setores = this.getLayer(DrillLevel.SETORES);

    return this.filterByPropertyIn(setores, 'CD_BAIRRO', codigoBairros);
  }

  filterSubdistritosByDistritos(codigoSubdistritos: string[]): GeoJSON.FeatureCollection {
    const subdistritos = this.getLayer(DrillLevel.SUBDISTRITOS);

    return this.filterByPropertyIn(subdistritos, "CD_DISTRITO", codigoSubdistritos)
  }


}
