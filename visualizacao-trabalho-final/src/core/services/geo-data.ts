import { Injectable } from '@angular/core';

export type MapLayer = 'bairros' | 'setores' | 'distritos' | 'subdistritos';

const layerPaths: Record<MapLayer, string> = {
  bairros: 'geojsons/FORTALEZA_BAIRROS.geojson',
  setores: 'geojsons/FORTALEZA_SETORES.geojson',
  distritos: 'geojsons/FORTALEZA_DISTRITOS.geojson',
  subdistritos: 'geojsons/FORTALEZA_SUBDISTRITOS.geojson',
};

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly cache = new Map<MapLayer, GeoJSON.FeatureCollection>();

  async loadLayer(layer: MapLayer): Promise<GeoJSON.FeatureCollection> {
    const cached = this.cache.get(layer);

    if (cached) {
      return cached;
    }

    const response = await fetch(layerPaths[layer]);

    if (!response.ok) {
      throw new Error(`Could not load ${layerPaths[layer]}: ${response.status}`);
    }

    const geojson = (await response.json()) as GeoJSON.FeatureCollection;
    this.cache.set(layer, geojson);

    return geojson;
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
}
