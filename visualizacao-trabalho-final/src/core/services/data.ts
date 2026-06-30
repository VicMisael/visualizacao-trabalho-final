import { Injectable } from '@angular/core';
import {
  CensusSectorRow,
  ConsolidatedNeighborhoodRow,
  DistrictRow,
  SubdistrictRow,
} from '../models/public-data.models';

@Injectable({
  providedIn: 'root',
})
export class SubdivisionData {
  private readonly cache = new Map<string, Promise<unknown>>();

  async getSubdistritosAsync(cdSubdistritos: string[] = []): Promise<SubdistrictRow[]> {
    const data = await this.fetchJson<SubdistrictRow[]>(
      '/data/Base_fortaleza_subdistritos.json',
    );

    return this.filterByCodes(data, 'CD_SUBDIST', cdSubdistritos);
  }

  async getFortalezaDistrictAsync(cdDistritos: string[] = []): Promise<DistrictRow[]> {
    const data = await this.fetchJson<DistrictRow[]>(
      '/data/Base_fortaleza_Renda_Cor_Raca_distritos.json',
    );

    return this.filterByCodes(data, 'CD_DIST', cdDistritos);
  }

  async getBairrosAsync(cdBairros: string[] = []): Promise<ConsolidatedNeighborhoodRow[]> {
    const data = await this.fetchJson<ConsolidatedNeighborhoodRow[]>(
      '/data/bairros/Base_Fortaleza_Consolidada.json',
    );

    return this.filterByCodes(data, 'CD_BAIRRO', cdBairros);
  }

  async getSectors(cdSetores: string[] = []): Promise<CensusSectorRow[]> {
    const data = await this.fetchJson<CensusSectorRow[]>(
      '/data/Base_fortaleza_Renda_Cor_Raca_setores.json',
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
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Could not load ${path}: ${response.status}`);
    }

    return (await response.json()) as T;
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
