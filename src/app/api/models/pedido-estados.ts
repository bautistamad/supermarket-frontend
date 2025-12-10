/**
 * Constantes para los estados de pedidos
 * Basado en la documentación del API backend
 */

export const PEDIDO_ESTADOS = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  ENVIADO: 3,
  ENTREGADO: 4,
  CANCELADO: 5
} as const;

export const PEDIDO_ESTADOS_NOMBRES = {
  [PEDIDO_ESTADOS.PENDIENTE]: 'Pendiente',
  [PEDIDO_ESTADOS.EN_PROCESO]: 'En Proceso',
  [PEDIDO_ESTADOS.ENVIADO]: 'Enviado',
  [PEDIDO_ESTADOS.ENTREGADO]: 'Entregado',
  [PEDIDO_ESTADOS.CANCELADO]: 'Cancelado'
} as const;

export const PEDIDO_ESTADOS_DESCRIPCIONES = {
  [PEDIDO_ESTADOS.PENDIENTE]: 'Pendiente de confirmación',
  [PEDIDO_ESTADOS.EN_PROCESO]: 'Confirmado y en preparación',
  [PEDIDO_ESTADOS.ENVIADO]: 'Despachado y en camino',
  [PEDIDO_ESTADOS.ENTREGADO]: 'Recibido por el supermercado',
  [PEDIDO_ESTADOS.CANCELADO]: 'Pedido cancelado'
} as const;

export const PEDIDO_ESTADOS_COLORES = {
  [PEDIDO_ESTADOS.PENDIENTE]: 'bg-warning',      // Amarillo
  [PEDIDO_ESTADOS.EN_PROCESO]: 'bg-info',        // Azul claro
  [PEDIDO_ESTADOS.ENVIADO]: 'bg-primary',        // Azul oscuro
  [PEDIDO_ESTADOS.ENTREGADO]: 'bg-success',      // Verde
  [PEDIDO_ESTADOS.CANCELADO]: 'bg-danger'        // Rojo
} as const;

export const PEDIDO_ESTADOS_ICONOS = {
  [PEDIDO_ESTADOS.PENDIENTE]: 'bi-clock',
  [PEDIDO_ESTADOS.EN_PROCESO]: 'bi-hourglass-split',
  [PEDIDO_ESTADOS.ENVIADO]: 'bi-truck',
  [PEDIDO_ESTADOS.ENTREGADO]: 'bi-check-circle',
  [PEDIDO_ESTADOS.CANCELADO]: 'bi-x-circle'
} as const;
