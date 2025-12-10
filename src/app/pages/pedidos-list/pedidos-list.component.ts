import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { IPedido } from '../../api/models/i-pedido';
import { IAutoGenerarResponse } from '../../api/models/i-auto-generar-response';
import { PedidosResource } from '../../api/resources/pedidos-resource.service';
import { PEDIDO_ESTADOS, PEDIDO_ESTADOS_COLORES } from '../../api/models/pedido-estados';

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

  constructor(private _pedidosService: PedidosResource) {}

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
          alert(`Pedido #${pedido.id} cancelado exitosamente. Estado: ${pedidoCancelado.estadoNombre}`);
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

          alert(errorMsg);
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
      alert('Este pedido ya fue puntuado o no está en estado Entregado.');
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
      alert('Por favor ingrese un número válido entre 1 y 5.');
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

        alert(`Pedido #${pedido.id} puntuado exitosamente con ${rating} estrellas.\nEvaluación registrada (ID: ${pedidoActualizado.evaluacionEscala})`);
      },
      error: (error: any) => {
        console.error('Error al puntuar pedido:', error);
        let errorMsg = 'Error al puntuar el pedido.';

        if (error.status === 400) {
          errorMsg = 'El pedido no puede ser puntuado. Verifique que esté en estado Entregado.';
        } else if (error.status === 404) {
          errorMsg = 'No se encontró el mapeo de escala para este proveedor.';
        }

        alert(errorMsg);
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
      this.pedidosFiltrados = this.pedidos.filter(p => p.proveedorId ===
      this.proveedorSeleccionado);
    }
  }

  generarPedidoAutomatico(): void {
    if (this.generandoPedido) return;

    if (confirm('¿Deseas generar automáticamente un pedido para productos con stock bajo?\n\nEl sistema seleccionará el proveedor más conveniente.')) {
      this.generandoPedido = true;

      this._pedidosService.autoGenerar().subscribe({
        next: (resultado: IAutoGenerarResponse) => {
          this.generandoPedido = false;

          if (resultado.exito) {
            let mensaje = `¡Pedido generado exitosamente!\n\n`;
            mensaje += `Pedido #${resultado.pedidoId}\n`;
            mensaje += `Proveedor: ${resultado.proveedorSeleccionado}\n`;
            mensaje += `Productos ordenados: ${resultado.productosOrdenados}\n`;
            mensaje += `Costo total: $${resultado.costoTotal?.toFixed(2)}\n`;

            if (resultado.ratingProveedor) {
              mensaje += `Rating del proveedor: ${resultado.ratingProveedor.toFixed(2)}/5`;
            }

            alert(mensaje);
            this.cargarPedidos(); // Recargar la lista de pedidos
          } else {
            alert(`${resultado.mensaje}`);
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

          alert(errorMsg);
        }
      });
    }
  }
}
