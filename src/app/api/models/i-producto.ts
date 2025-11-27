export interface IProducto {
  codigoBarra: number;
  nombre: string;
  imagen?: string;
  minStock: number;
  maxStock: number;
  actualStock: number;
  updateDate?: Date;
  estadoId: number;
  estadoNombre?: string;
  estadoDescripcion?: string;
}
