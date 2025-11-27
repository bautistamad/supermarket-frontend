import { IPedidoProducto } from './i-pedido-producto';

export interface IPedido {
  id?: number;
  estadoId: number;
  proveedorId: number;
  puntuacion?: number;
  fechaEstimada: string;
  fechaEntrega?: string;
  evaluacionEscala?: number;
  fechaRegistro?: string;
  estadoNombre?: string;
  estadoDescripcion?: string;
  proveedorNombre?: string;
  productos: IPedidoProducto[];
}
