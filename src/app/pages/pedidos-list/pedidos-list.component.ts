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

  constructor(private _pedidosService: PedidosResource) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this._pedidosService.getAll().subscribe({
      next: (pedidos: IPedido[]) => {
        this.pedidos = pedidos;
        console.log('Pedidos cargados:', pedidos);
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
}
