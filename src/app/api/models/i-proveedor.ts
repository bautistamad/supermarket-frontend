export interface IProveedor {
  id?: number;
  name: string;
  apiEndpoint: string;
  tipoServicio: number;
  tipoServicioNombre?: string;
  apiKey: string;
}
