import {Component, OnInit} from '@angular/core';
import {IProducto} from '../../api/models/i-producto';
import {IProveedor} from '../../api/models/i-proveedor';
import {ProductosResource} from '../../api/resources/productos-resource.service';
import {ProveedoresResource} from '../../api/resources/proveedores-resource.service';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.html',
  styleUrls: ['./productos-list.css'],
})

export class ProductosList implements OnInit {

  productos: IProducto[] = [];
  showModal: boolean = false;
  isSubmitting: boolean = false;
  modoEdicion: boolean = false; // Indica si estamos editando o creando

  // Modal de asignación a proveedor
  showAsignacionModal: boolean = false;
  proveedores: IProveedor[] = [];
  productosProveedor: any[] = [];
  proveedorSeleccionado: number | null = null;
  productoSeleccionado: any | null = null;
  productoActual: IProducto | null = null;
  isLoadingProveedorProductos: boolean = false;

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

  constructor(
    private _productosService: ProductosResource,
    private _proveedoresService: ProveedoresResource
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarProveedores();
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

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.showModal = true;
    this.resetForm();
  }

  abrirModalEditar(producto: IProducto): void {
    this.modoEdicion = true;
    this.showModal = true;
    // Copiar los datos del producto al formulario
    this.nuevoProducto = {
      codigoBarra: producto.codigoBarra,
      nombre: producto.nombre,
      imagen: producto.imagen || '',
      minStock: producto.minStock,
      maxStock: producto.maxStock,
      actualStock: producto.actualStock,
      estadoId: producto.estadoId || 1
    };
  }

  cerrarModal(): void {
    this.showModal = false;
    this.modoEdicion = false;
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

  guardarProducto(): void {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
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

  actualizarProducto(): void {
    // Validaciones básicas
    if (!this.validarFormularioEdicion()) {
      return;
    }

    this.isSubmitting = true;

    // El método update necesita el barCode explícitamente en el objeto
    const productoActualizado = {
      ...this.nuevoProducto,
      barCode: this.nuevoProducto.codigoBarra
    };

    this._productosService.update(productoActualizado).subscribe({
      next: (producto: IProducto) => {
        console.log('Producto actualizado exitosamente:', producto);
        alert(`Producto "${producto.nombre}" actualizado exitosamente`);
        this.cerrarModal();
        this.cargarProductos(); // Recargar la lista
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar el producto. Verifica los datos e intenta nuevamente.');
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

  validarFormularioEdicion(): boolean {
    // En modo edición, el código de barra no se puede modificar
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

  // Métodos para asignación a proveedor
  cargarProveedores(): void {
    this._proveedoresService.getAll().subscribe({
      next: (proveedores: IProveedor[]) => {
        this.proveedores = proveedores;
        console.log('Proveedores cargados:', proveedores);
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  abrirModalAsignacion(producto: IProducto): void {
    this.productoActual = producto;
    this.showAsignacionModal = true;
    this.proveedorSeleccionado = null;
    this.productosProveedor = [];
    this.productoSeleccionado = null;
  }

  cerrarModalAsignacion(): void {
    this.showAsignacionModal = false;
    this.productoActual = null;
    this.proveedorSeleccionado = null;
    this.productosProveedor = [];
    this.productoSeleccionado = null;
  }

  onProveedorChange(): void {
    if (!this.proveedorSeleccionado) {
      this.productosProveedor = [];
      this.productoSeleccionado = null;
      return;
    }

    this.isLoadingProveedorProductos = true;
    this.productoSeleccionado = null;

    this._proveedoresService.getProductosDisponibles({ id: this.proveedorSeleccionado }).subscribe({
      next: (productos: any[]) => {
        this.productosProveedor = productos;
        console.log('Productos del proveedor:', productos);
        this.isLoadingProveedorProductos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos del proveedor:', error);
        alert('Error al cargar productos del proveedor. Verifica que el proveedor esté configurado correctamente.');
        this.isLoadingProveedorProductos = false;
        this.productosProveedor = [];
      }
    });
  }

  asignarProductoAProveedor(): void {
    if (!this.productoActual || !this.proveedorSeleccionado || !this.productoSeleccionado) {
      alert('Debes seleccionar un proveedor y un producto del proveedor');
      return;
    }

    this.isSubmitting = true;

    const requestData = {
      barCode: this.productoActual.codigoBarra,
      idProveedor: this.proveedorSeleccionado,
      codigoBarraProveedor: this.productoSeleccionado.barCode || this.productoSeleccionado.codigoBarra
    };

    this._productosService.assignToProvider(requestData).subscribe({
      next: () => {
        alert(`Producto "${this.productoActual!.nombre}" asignado exitosamente al proveedor`);
        this.cerrarModalAsignacion();
        this.cargarProductos();
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error al asignar producto al proveedor:', error);
        alert('Error al asignar el producto al proveedor. Verifica que los datos sean correctos.');
        this.isSubmitting = false;
      }
    });
  }
}
