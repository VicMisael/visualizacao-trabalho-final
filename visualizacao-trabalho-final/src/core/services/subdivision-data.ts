import { Injectable } from '@angular/core';
import {
  CensusSectorRow,
  DistrictRow,
  NeighborhoodRow,
  SubdistrictRow,
} from '../models/public-data.models';

@Injectable({
  providedIn: 'root',
})
export class SubdivisionDataService {
  private readonly dataPath = 'data/simplificado';
  private readonly cache = new Map<string, Promise<unknown>>();

  async getSubdistritosAsync(cdSubdistritos: string[] = []): Promise<SubdistrictRow[]> {
    const data = await this.fetchJson<SubdistrictRow[]>(
      `${this.dataPath}/Base_fortaleza_subdistritos_simplificado.json`,
    );

    return this.filterByCodes(data, 'CD_SUBDIST', cdSubdistritos);
  }

  async getFortalezaDistrictAsync(): Promise<DistrictRow[]> {
    return this.fetchJson<DistrictRow[]>(
      `${this.dataPath}/Base_fortaleza_distritos_simplificado.json`,
    );
  }

  async getBairrosAsync(cdBairros: string[] = []): Promise<NeighborhoodRow[]> {
    const data = await this.fetchJson<NeighborhoodRow[]>(
      `${this.dataPath}/Base_fortaleza_bairros_simplificado.json`,
    );

    return this.filterByCodes(data, 'CD_BAIRRO', cdBairros);
  }

  async getSectors(cdSetores: string[] = []): Promise<CensusSectorRow[]> {
    const data = await this.fetchJson<CensusSectorRow[]>(
      `${this.dataPath}/Base_fortaleza_setores_simplificada.json`,
    );

    return this.filterByCodes(data, 'CD_SETOR', cdSetores);
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const cached = this.cache.get(path) as Promise<T> | undefined;

    if (cached) {
      return cached;
    }

    const request = this.loadJson<T>(path);
    this.cache.set(path, request);

    return request;
  }

  private async loadJson<T>(path: string): Promise<T> {
    const response = await fetch(this.resolveAssetUrl(path));

    if (!response.ok) {
      throw new Error(`Could not load ${path}: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private resolveAssetUrl(path: string): URL {
    return new URL(path, document.baseURI);
  }

  private filterByCodes<T extends Record<string, unknown>>(
    rows: T[],
    codeField: keyof T,
    codes: string[],
  ): T[] {
    if (codes.length === 0) {
      return rows;
    }

    const allowedCodes = new Set(codes.map((code) => code.trim()));

    return rows.filter((row) => allowedCodes.has(String(row[codeField]).trim()));
  }
}
