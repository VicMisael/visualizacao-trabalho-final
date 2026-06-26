export interface IMapData {
  id?: number;

  CD_REGIAO?: string;
  NM_REGIAO?: string;

  CD_UF?: string;
  NM_UF?: string;

  CD_MUN?: string;
  NM_MUN?: string;

  CD_DIST?: string;
  NM_DIST?: string;

  CD_SUBDIST?: string;
  NM_SUBDIST?: string | null;

  CD_BAIRRO?: string;
  NM_BAIRRO?: string;

  CD_SETOR?: string;

  CD_RGINT?: string;
  NM_RGINT?: string;

  CD_RGI?: string;
  NM_RGI?: string;

  CD_CONCURB?: string;
  NM_CONCURB?: string;

  AREA_KM2?: number | null;

  v0001?: string | number | null;
  v0002?: string | number | null;
  v0003?: string | number | null;
  v0004?: string | number | null;
  v0005?: string | number | null;
  v0006?: string | number | null;
  v0007?: string | number | null;

  [key: string]: string | number | null | undefined;
}

export type FortalezaMapFeature = GeoJSON.Feature<GeoJSON.Geometry, IMapData>;
export type FortalezaFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, IMapData>;
