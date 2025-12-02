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
  showModal: boolean = false;
  isSubmitting: boolean = false;

  // Modelo del formulario
  nuevoProducto: IProducto = {
    codigoBarra: 0,
    nombre: '',
    imagen: '',
    minStock: 0,
    maxStock: 0,
    actualStock: 0,
    estadoId: 1
  };

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

  abrirModal(): void {
    this.showModal = true;
    this.resetForm();
  }

  cerrarModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.nuevoProducto = {
      codigoBarra: 0,
      nombre: '',
      imagen: '',
      minStock: 0,
      maxStock: 0,
      actualStock: 0,
      estadoId: 1
    };
  }

  crearProducto(): void {
    // Validaciones básicas
    if (!this.validarFormulario()) {
      return;
    }

    this.isSubmitting = true;

    this._productosService.create(this.nuevoProducto).subscribe({
      next: (producto: IProducto) => {
        console.log('Producto creado exitosamente:', producto);
        alert(`Producto "${producto.nombre}" creado exitosamente`);
        this.cerrarModal();
        this.cargarProductos(); // Recargar la lista
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error al crear producto:', error);
        alert('Error al crear el producto. Verifica los datos e intenta nuevamente.');
        this.isSubmitting = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.nuevoProducto.codigoBarra || this.nuevoProducto.codigoBarra <= 0) {
      alert('El código de barra debe ser un número positivo');
      return false;
    }

    if (!this.nuevoProducto.nombre || this.nuevoProducto.nombre.trim() === '') {
      alert('El nombre del producto es requerido');
      return false;
    }

    if (this.nuevoProducto.minStock < 0) {
      alert('El stock mínimo no puede ser negativo');
      return false;
    }

    if (this.nuevoProducto.maxStock <= this.nuevoProducto.minStock) {
      alert('El stock máximo debe ser mayor al stock mínimo');
      return false;
    }

    if (this.nuevoProducto.actualStock < 0) {
      alert('El stock actual no puede ser negativo');
      return false;
    }

    return true;
  }

  eliminarProducto(producto: IProducto): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    this._productosService.delete({ barCode: producto.codigoBarra }).subscribe({
      next: () => {
        console.log(`Producto ${producto.codigoBarra} eliminado exitosamente`);
        alert(`Producto "${producto.nombre}" eliminado exitosamente`);
        this.cargarProductos(); // Recargar la lista
      },
      error: (error: any) => {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto. Puede que tenga relaciones con otros datos.');
      }
    });
  }
}
