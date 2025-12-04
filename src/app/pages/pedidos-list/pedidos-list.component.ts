import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { IPedido } from '../../api/models/i-pedido';
import { PedidosResource } from '../../api/resources/pedidos-resource.service';

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
  pedidosFiltrados: IPedido[] = []

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
    const badges: { [key: number]: string } = {
      1: 'bg-warning',      // Pendiente
      2: 'bg-info',         // Confirmado
      3: 'bg-primary',      // En Preparación
      4: 'bg-secondary',    // En Tránsito
      5: 'bg-success',      // Entregado
      6: 'bg-danger'        // Cancelado
    };
    return badges[estadoId] || 'bg-secondary';
  }

  puedeSerCancelado(estadoId: number): boolean {
    return estadoId === 1; // Solo "Pendiente"
  }

  cancelarPedido(pedido: IPedido): void {
    if (!pedido.id) return;

    if (confirm(`¿Estás seguro de que deseas cancelar el pedido #${pedido.id}?`)) {
      this._pedidosService.delete({ id: pedido.id }).subscribe({
        next: () => {
          console.log(`Pedido #${pedido.id} cancelado exitosamente`);
          this.cargarPedidos(); // Recargar la lista
        },
        error: (error: any) => {
          console.error('Error al cancelar pedido:', error);
          alert('Error al cancelar el pedido. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  puedeSerPuntuado(estadoId: number): boolean {
    return estadoId === 5; // Solo "Entregado"
  }

  puntuarPedido(pedido: IPedido): void {
    if (!pedido.id) return;

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
      next: () => {
        console.log(`Pedido #${pedido.id} puntuado exitosamente con ${rating} estrellas`);
        alert(`Pedido #${pedido.id} puntuado exitosamente con ${rating} estrellas`);
        this.cargarPedidos(); // Recargar la lista para mostrar la puntuación
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
}
