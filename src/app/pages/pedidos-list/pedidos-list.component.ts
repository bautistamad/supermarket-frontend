import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { IPedido } from '../../api/models/i-pedido';
import { IAutoGenerarResponse } from '../../api/models/i-auto-generar-response';
import { PedidosResource } from '../../api/resources/pedidos-resource.service';
import { PEDIDO_ESTADOS, PEDIDO_ESTADOS_COLORES } from '../../api/models/pedido-estados';
import { AppMessageService } from '../../core/services/app-message.service';

@Component({
  selector: 'app-pedidos-list',
  templateUrl: './pedidos-list.component.html',
  styleUrls: ['./pedidos-list.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class PedidosListComponent implements OnInit {

  pedidos: IPedido[] = [];
  pedidoExpandido: number | null = null;
  proveedorSeleccionado: number | null = null;
  pedidosFiltrados: IPedido[] = [];
  generandoPedido: boolean = false;

  constructor(
    private _pedidosService: PedidosResource,
    private _messageService: AppMessageService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this._pedidosService.getAll().subscribe({
      next: (pedidos: IPedido[]) => {
        this.pedidos = pedidos;
        this.pedidosFiltrados = pedidos;
        console.log('Pedidos cargados:', pedidos);
        console.log('Total de pedidos:', pedidos.length);
        pedidos.forEach((pedido, index) => {
          console.log(`Pedido ${index + 1} - ID: ${pedido.id}, Productos:`, pedido.productos);
          console.log(`  - Cantidad de productos: ${pedido.productos?.length || 0}`);
        });
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
      }
    });
  }

  togglePedido(pedidoId: number): void {
    this.pedidoExpandido = this.pedidoExpandido === pedidoId ? null : pedidoId;
  }

  isPedidoExpandido(pedidoId: number): boolean {
    return this.pedidoExpandido === pedidoId;
  }

  getBadgeClass(estadoId: number): string {
    return PEDIDO_ESTADOS_COLORES[estadoId as keyof typeof PEDIDO_ESTADOS_COLORES] || 'bg-secondary';
  }

  puedeSerCancelado(estadoId: number): boolean {
    // Se puede cancelar todo excepto Entregado (4) y Cancelado (5)
    return estadoId !== PEDIDO_ESTADOS.ENTREGADO && estadoId !== PEDIDO_ESTADOS.CANCELADO;
  }

  cancelarPedido(pedido: IPedido): void {
    if (pedido.id === undefined || pedido.id === null) return;

    if (confirm(`¿Estás seguro de que deseas cancelar el pedido #${pedido.id}?\n\nEsta acción notificará al proveedor y cambiará el estado del pedido a "Cancelado".`)) {
      this._pedidosService.cancelar({ id: pedido.id }).subscribe({
        next: (pedidoCancelado) => {
          console.log(`Pedido #${pedido.id} cancelado exitosamente`, pedidoCancelado);
          this._messageService.showSuccess(
            `Pedido #${pedido.id} cancelado exitosamente.<br>Estado: ${pedidoCancelado.estadoNombre}`,
            'Pedido cancelado'
          );
          this.cargarPedidos(); // Recargar la lista
        },
        error: (error: any) => {
          console.error('Error al cancelar pedido:', error);
          let errorMsg = 'Error al cancelar el pedido.';

          if (error.status === 400) {
            errorMsg = 'El pedido no puede ser cancelado. Verifique que no esté entregado o ya cancelado.';
          } else if (error.status === 404) {
            errorMsg = 'Pedido no encontrado.';
          } else if (error.status === 500) {
            errorMsg = 'Error al comunicarse con el proveedor. Por favor, intenta nuevamente.';
          }

          this._messageService.showError(errorMsg, 'Error al cancelar');
        }
      });
    }
  }

  puedeSerPuntuado(pedido: IPedido): boolean {
    // Solo pedidos entregados pueden ser puntuados y que no hayan sido evaluados antes
    // Verificamos evaluacionEscala porque el backend guarda la evaluación allí, no en puntuacion
    return pedido.estadoId === PEDIDO_ESTADOS.ENTREGADO &&
           !pedido.evaluacionEscala &&
           pedido.evaluacionEscala !== 0;
  }

  puntuarPedido(pedido: IPedido): void {
    if (pedido.id === undefined || pedido.id === null) return;

    // Verificar nuevamente si puede ser puntuado
    if (!this.puedeSerPuntuado(pedido)) {
      this._messageService.showError('Este pedido ya fue puntuado o no está en estado Entregado.', 'No se puede puntuar');
      return;
    }

    // Solicitar puntuación al usuario (1-5)
    const ratingStr = prompt(`Puntuar pedido #${pedido.id}\n\nIngrese una puntuación del 1 al 5:`);

    if (ratingStr === null) {
      // Usuario canceló
      return;
    }

    const rating = parseInt(ratingStr, 10);

    // Validar que sea un número entre 1 y 5
    if (isNaN(rating) || rating < 1 || rating > 5) {
      this._messageService.showError('Por favor ingrese un número válido entre 1 y 5.', 'Valor inválido');
      return;
    }

    // Enviar puntuación al backend
    this._pedidosService.rate({ id: pedido.id, rating }).subscribe({
      next: (pedidoActualizado: IPedido) => {
        // Actualizar el pedido en la lista local
        const index = this.pedidos.findIndex(p => p.id === pedido.id);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
        }

        // Actualizar también en la lista filtrada
        const indexFiltrado = this.pedidosFiltrados.findIndex(p => p.id === pedido.id);
        if (indexFiltrado !== -1) {
          this.pedidosFiltrados[indexFiltrado] = pedidoActualizado;
        }

        this._messageService.showSuccess(
          `Pedido #${pedido.id} puntuado exitosamente con ${rating} estrellas.<br>Evaluación registrada (ID: ${pedidoActualizado.evaluacionEscala})`,
          'Puntuación registrada'
        );
      },
      error: (error: any) => {
        console.error('Error al puntuar pedido:', error);
        let errorMsg = 'Error al puntuar el pedido.';

        if (error.status === 400) {
          errorMsg = 'El pedido no puede ser puntuado. Verifique que esté en estado Entregado.';
        } else if (error.status === 404) {
          errorMsg = 'No se encontró el mapeo de escala para este proveedor.';
        }

        this._messageService.showError(errorMsg, 'Error al puntuar');
      }
    });
  }

 getProveedores(): { id: number, nombre: string }[] {
    const proveedoresMap = new Map<number, string>();
    this.pedidos.forEach(pedido => {
      if (pedido.proveedorId && pedido.proveedorNombre) {
        proveedoresMap.set(pedido.proveedorId, pedido.proveedorNombre);
      }
    });
    return Array.from(proveedoresMap, ([id, nombre]) => ({ id, nombre }));
  }

  filtrarPorProveedor(): void {
    if (this.proveedorSeleccionado === null) {
      this.pedidosFiltrados = this.pedidos;
    } else {
      this.pedidosFiltrados = this.pedidos.filter(p => p.proveedorId === this.proveedorSeleccionado);
    }
  }

  generarPedidoAutomatico(): void {
    if (this.generandoPedido) return;

    if (confirm('¿Deseas generar automáticamente un pedido para productos con stock bajo?\n\nEl sistema seleccionará el proveedor más conveniente.')) {
      this.generandoPedido = true;

      this._pedidosService.autoGenerar().subscribe({
        next: (resultado: IAutoGenerarResponse) => {
          this.generandoPedido = false;

          if (resultado.pedidoId == null){
            let mensaje = `<strong>¡${resultado.mensaje}!</strong><br><br>`;
            this._messageService.showError(mensaje, 'No es necesario realizar un pedido');
          }

          if (resultado.exito && resultado.pedidoId != null) {
            let mensaje = `<strong>¡Pedido generado exitosamente!</strong><br><br>`;
            mensaje += `<strong>Pedido #${resultado.pedidoId}</strong><br>`;
            mensaje += `Proveedor: ${resultado.proveedorSeleccionado}<br>`;
            mensaje += `Productos ordenados: ${resultado.productosOrdenados}<br>`;
            mensaje += `Costo total: $${resultado.costoTotal?.toFixed(2)}<br>`;

            if (resultado.ratingProveedor) {
              mensaje += `Rating del proveedor: ${resultado.ratingProveedor.toFixed(2)}/5`;
            }

            this._messageService.showSuccess(mensaje, 'Pedido Automático Generado');
            this.cargarPedidos();
          }
        },
        error: (error: any) => {
          this.generandoPedido = false;
          console.error('Error al generar pedido automático:', error);

          let errorMsg = 'Error al generar el pedido automático.';

          if (error.status === 400) {
            errorMsg = 'No hay productos con stock bajo o no hay proveedores disponibles.';
          } else if (error.status === 404) {
            errorMsg = 'No se encontraron proveedores configurados.';
          } else if (error.status === 500) {
            errorMsg = 'Error en el servidor. Por favor, intenta nuevamente.';
          }

          this._messageService.showError(errorMsg, 'Error al generar pedido');
        }
      });
    }
  }
}
