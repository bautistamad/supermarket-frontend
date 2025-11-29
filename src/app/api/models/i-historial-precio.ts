export interface IHistorialPrecio {
  codigoBarra: number;
  idProveedor: number;
  precio: number;
  fechaInicio: string;
  fechaFin?: string | null;
  proveedorNombre?: string;
  productoNombre?: string;
}
