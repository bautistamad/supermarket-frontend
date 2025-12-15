import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IProducto} from '../../api/models/i-producto';
import {IProveedor} from '../../api/models/i-proveedor';
import {ProductosResource} from '../../api/resources/productos-resource.service';
import {ProveedoresResource} from '../../api/resources/proveedores-resource.service';
import {AppMessageService} from '../../core/services/app-message.service';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.html',
  styleUrls: ['./productos-list.css'],
})

export class ProductosList implements OnInit {

  productos: IProducto[] = [];
  showModal: boolean = false;
  modoEdicion: boolean = false;

  // Modal de asignación a proveedor
  showAsignacionModal: boolean = false;
  proveedores: IProveedor[] = [];
  productosProveedor: any[] = [];
  proveedorSeleccionado: number | null = null;
  productoSeleccionado: any | null = null;
  productoActual: IProducto | null = null;

  // Reactive Form
  productoForm!: FormGroup;

  constructor(
    private _productosService: ProductosResource,
    private _proveedoresService: ProveedoresResource,
    private _fb: FormBuilder,
    private _messageService: AppMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarProductos();
    this.cargarProveedores();
  }

  private initForm(): void {
    this.productoForm = this._fb.group({
      codigoBarra: [0, [Validators.required, Validators.min(1)]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      image: [''],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [1, [Validators.required, Validators.min(1)]],
      actualStock: [0, [Validators.required, Validators.min(0)]],
      estadoId: [1, [Validators.required]]
    }, { validators: this.stockValidator });
  }

  // Validador personalizado para verificar que maxStock > minStock
  private stockValidator(group: FormGroup): {[key: string]: boolean} | null {
    const minStock = group.get('minStock')?.value;
    const maxStock = group.get('maxStock')?.value;
    return maxStock > minStock ? null : { invalidStockRange: true };
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
    this.productoForm.patchValue({
      codigoBarra: producto.codigoBarra,
      nombre: producto.nombre,
      image: producto.image || '',
      minStock: producto.minStock,
      maxStock: producto.maxStock,
      actualStock: producto.actualStock,
      estadoId: producto.estadoId || 1
    });
  }

  cerrarModal(): void {
    this.showModal = false;
    this.modoEdicion = false;
    this.resetForm();
  }

  resetForm(): void {
    this.productoForm.reset({
      codigoBarra: 0,
      nombre: '',
      image: '',
      minStock: 0,
      maxStock: 1,
      actualStock: 0,
      estadoId: 1
    });
  }

  guardarProducto(): void {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this._messageService.showInfo('Por favor completa todos los campos correctamente.', 'Formulario incompleto');
      return;
    }

    const nuevoProducto: IProducto = this.productoForm.value;

    this._productosService.create(nuevoProducto).subscribe({
      next: (producto: IProducto) => {
        console.log('Producto creado exitosamente:', producto);
        this._messageService.showSuccess(`Producto "${producto.nombre}" creado exitosamente`, 'Producto creado');
        this.cerrarModal();
        this.cargarProductos();
      },
      error: (error: any) => {
        console.error('Error al crear producto:', error);
        this._messageService.showError('Error al crear el producto. Verifica los datos e intenta nuevamente.', 'Error al crear');
      }
    });
  }

  actualizarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this._messageService.showInfo('Por favor completa todos los campos correctamente.', 'Formulario incompleto');
      return;
    }

    const productoActualizado = {
      ...this.productoForm.value,
      barCode: this.productoForm.value.codigoBarra
    };

    this._productosService.update(productoActualizado).subscribe({
      next: (producto: IProducto) => {
        console.log('Producto actualizado exitosamente:', producto);
        this._messageService.showSuccess(`Producto "${producto.nombre}" actualizado exitosamente`, 'Producto actualizado');
        this.cerrarModal();
        this.cargarProductos();
      },
      error: (error: any) => {
        console.error('Error al actualizar producto:', error);
        this._messageService.showError('Error al actualizar el producto. Verifica los datos e intenta nuevamente.', 'Error al actualizar');
      }
    });
  }

  // Helper methods para validación en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['min']) {
      const min = field.errors['min'].min;
      return `El valor mínimo es ${min}`;
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return 'Campo inválido';
  }

  getFormError(): string {
    if (this.productoForm.errors?.['invalidStockRange']) {
      return 'El stock máximo debe ser mayor al stock mínimo';
    }
    return '';
  }

  eliminarProducto(producto: IProducto): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    this._productosService.delete({ barCode: producto.codigoBarra }).subscribe({
      next: () => {
        console.log(`Producto ${producto.codigoBarra} eliminado exitosamente`);
        this._messageService.showSuccess(`Producto "${producto.nombre}" eliminado exitosamente`, 'Producto eliminado');
        this.cargarProductos();
      },
      error: (error: any) => {
        console.error('Error al eliminar producto:', error);
        this._messageService.showError('Error al eliminar el producto. Puede que tenga relaciones con otros datos.', 'Error al eliminar');
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

    this.productoSeleccionado = null;

    this._proveedoresService.getProductosDisponibles({ id: this.proveedorSeleccionado }).subscribe({
      next: (productos: any[]) => {
        this.productosProveedor = productos;
        console.log('Productos del proveedor:', productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos del proveedor:', error);
        this._messageService.showError('Error al cargar productos del proveedor. Verifica que el proveedor esté configurado correctamente.', 'Error al cargar');
        this.productosProveedor = [];
      }
    });
  }

  asignarProductoAProveedor(): void {
    if (!this.productoActual || !this.proveedorSeleccionado || !this.productoSeleccionado) {
      this._messageService.showInfo('Debes seleccionar un proveedor y un producto del proveedor', 'Selección incompleta');
      return;
    }

    const requestData = {
      barCode: this.productoActual.codigoBarra,
      idProveedor: this.proveedorSeleccionado,
      codigoBarraProveedor: this.productoSeleccionado.barCode || this.productoSeleccionado.codigoBarra
    };

    this._productosService.assignToProvider(requestData).subscribe({
      next: () => {
        this._messageService.showSuccess(`Producto "${this.productoActual!.nombre}" asignado exitosamente al proveedor`, 'Producto asignado');
        this.cerrarModalAsignacion();
        this.cargarProductos();
      },
      error: (error: any) => {
        console.error('Error al asignar producto al proveedor:', error);
        this._messageService.showError('Error al asignar el producto al proveedor. Verifica que los datos sean correctos.', 'Error al asignar');
      }
    });
  }
}
