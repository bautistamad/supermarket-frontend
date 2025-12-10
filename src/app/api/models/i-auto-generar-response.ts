export interface IAutoGenerarResponse {
  exito: boolean;
  mensaje: string;
  pedidoId?: number;
  proveedorSeleccionado?: string;
  productosOrdenados?: number;
  costoTotal?: number;
  ratingProveedor?: number;
}
