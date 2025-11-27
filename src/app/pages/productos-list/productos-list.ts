import {Component, OnInit} from '@angular/core';
import {IProducto} from '../../api/models/i-producto';
import {ProductosResource} from '../../api/resources/productos-resource.service';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.html',
  styleUrls: ['./productos-list.css'],
})

export class ProductosList implements OnInit {

  productos: IProducto[] = [];

  constructor(private _productosService: ProductosResource) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this._productosService.getAll().subscribe({
      next: (productos: IProducto[]) => {
        this.productos = productos;
        console.log('Productos cargados:', productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }
}

