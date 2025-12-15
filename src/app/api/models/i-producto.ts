import { IHistorialPrecio } from './i-historial-precio';

export interface IProducto {
  codigoBarra: number;
  nombre: string;
  imagen?: string;
  image?: string;
  minStock: number;
  maxStock: number;
  actualStock: number;
  updateDate?: Date;
  estadoId: number;
  estadoNombre?: string;
  estadoDescripcion?: string;
  precios?: IHistorialPrecio[];
}
