import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProveedor } from '../../api/models/i-proveedor';
import { ProveedoresResource } from '../../api/resources/proveedores-resource.service';
import { ProductosResource } from '../../api/resources/productos-resource.service';
import { IProducto } from '../../api/models/i-producto';
import { EscalasResource } from '../../api/resources/escalas-resource.service';
import { IEscala } from '../../api/models/i-escala';
import { AppMessageService } from '../../core/services/app-message.service';

@Component({
  selector: 'app-proveedores-cards',
  templateUrl: './proveedores-cards.component.html',
  styleUrls: ['./proveedores-cards.component.css']
})
export class ProveedoresCardsComponent implements OnInit {

  proveedores: IProveedor[] = [];
  mostrarFormulario: boolean = false;
  proveedorSeleccionado: IProveedor | null = null;
  productosProveedor: IProducto[] = [];
  mostrarProductos: boolean = false;
  mostrarModalEscalas: boolean = false;
  escalasParaMapear: IEscala[] = [];
  proveedorPendienteEscala: IProveedor | null = null;

  // Nuevas propiedades para modal de sincronización de productos
  mostrarModalProductos: boolean = false;
  productosProveedorDisponibles: any[] = [];
  seleccionarTodos: boolean = false;
  modoAgregarProductos: boolean = false;

  proveedorForm!: FormGroup;

  constructor(
    private _proveedoresService: ProveedoresResource,
    private _productosService: ProductosResource,
    private _escalasService: EscalasResource,
    private _fb: FormBuilder,
    private _messageService: AppMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarProveedores();
  }

  private initForm(): void {
    this.proveedorForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      apiEndpoint: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      tipoServicio: [1, [Validators.required]],
      clientId: ['', [Validators.required, Validators.minLength(5)]],
      apiKey: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  cargarProveedores(): void {
    this._proveedoresService.getAll().subscribe({
      next: (proveedores: IProveedor[]) => {
        this.proveedores = proveedores;
        console.log('Proveedores cargados:', proveedores);

        // Cargar el rating de cada proveedor
        this.proveedores.forEach(proveedor => {
          if (proveedor.id) {
            this.cargarRatingProveedor(proveedor.id);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  cargarRatingProveedor(proveedorId: number): void {
    this._proveedoresService.getRating({ id: proveedorId }).subscribe({
      next: (rating: any) => {
        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (proveedor) {
          if (rating === null || rating === undefined) {
            proveedor.ratingPromedio = null;
          } else {
            const ratingNumero = typeof rating === 'number' ? rating : parseFloat(rating.toString());
            proveedor.ratingPromedio = isNaN(ratingNumero) ? null : ratingNumero;
          }
          console.log(`Rating del proveedor ${proveedorId}:`, proveedor.ratingPromedio);
        }
      },
      error: (error: any) => {
        console.error(`Error al cargar rating del proveedor ${proveedorId}:`, error);
        // En caso de error, establecer null para que no rompa la UI
        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (proveedor) {
          proveedor.ratingPromedio = null;
        }
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  resetearFormulario(): void {
    this.proveedorForm.reset({
      name: '',
      apiEndpoint: '',
      tipoServicio: 1,
      apiKey: '',
      clientId: ''
    });
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      this._messageService.showInfo('Por favor completa todos los campos correctamente.', 'Formulario incompleto');
      return;
    }

    const nuevoProveedor: IProveedor = this.proveedorForm.value;

    this._proveedoresService.create(nuevoProveedor).subscribe({
      next:(proveedor: IProveedor) => {
        console.log('Proveedor creado:', proveedor);
        this.proveedorPendienteEscala = proveedor;
        this.toggleFormulario();

        // Obtener escalas sin mapear para configurar
        if (proveedor.id) {
          this.cargarEscalasSinMapear(proveedor.id);
        }
      },
      error: (error: any) => {
        console.error('Error al crear proveedor:', error);
        this._messageService.showError('Error al crear el proveedor. Por favor, intenta nuevamente.', 'Error al crear');
      }
    })
  }

  // Helper methods para validación en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.proveedorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.proveedorForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    if (field.errors['pattern']) return 'Formato inválido. Debe comenzar con http:// o https://';

    return 'Campo inválido';
  }

  cargarEscalasSinMapear(proveedorId: number): void {
    this._escalasService.getUnmapped({ proveedorId }).subscribe({
      next: (escalas: IEscala[]) => {
        if (escalas.length > 0) {
          this.escalasParaMapear = escalas.map(e => ({ ...e, escalaInt: null }));
          this.mostrarModalEscalas = true;
        } else {
          // No hay escalas para mapear, el proveedor está listo
          this.cargarProveedores();
          this._messageService.showSuccess('Proveedor creado exitosamente. No requiere configuración de escalas.', 'Proveedor creado');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar escalas:', error);
        this._messageService.showError('Proveedor creado pero hubo un error al cargar las escalas. Recarga la página.', 'Error al cargar escalas');
        this.cargarProveedores();
      }
    });
  }

  guardarMapeosEscalas(): void {
    // Validar que todas las escalas tengan un valor asignado
    const escalasSinMapear = this.escalasParaMapear.filter(e => e.escalaInt === null || e.escalaInt === undefined);

    if (escalasSinMapear.length > 0) {
      this._messageService.showInfo('Por favor asigna un valor a todas las escalas antes de continuar.', 'Escalas incompletas');
      return;
    }

    // Validar que los valores estén entre 1 y 5
    const escalasInvalidas = this.escalasParaMapear.filter(e => e.escalaInt! < 1 || e.escalaInt! > 5);

    if (escalasInvalidas.length > 0) {
      this._messageService.showInfo('Los valores de escala deben estar entre 1 y 5.', 'Valores inválidos');
      return;
    }

    this._escalasService.saveMappings(this.escalasParaMapear).subscribe({
      next: (escalasGuardadas: IEscala[]) => {
        console.log('Escalas mapeadas:', escalasGuardadas);
        this.cerrarModalEscalas();
        // Después de mapear las escalas, abrir modal de productos (obligatorio)
        this.abrirModalProductos();
      },
      error: (error: any) => {
        console.error('Error al guardar escalas:', error);
        this._messageService.showError('Error al guardar las escalas. Por favor, intenta nuevamente.', 'Error al guardar');
      }
    });
  }

  cerrarModalEscalas(): void {
    this.mostrarModalEscalas = false;
    this.escalasParaMapear = [];
    // No limpiamos proveedorPendienteEscala aquí porque lo necesitamos para el modal de productos
  }

  // Nuevo método: Abrir modal de productos (llamado después de guardar escalas)
  abrirModalProductos(): void {
    if (!this.proveedorPendienteEscala?.id) return;

    this._proveedoresService.getProductosDisponibles({
      id: this.proveedorPendienteEscala.id
    }).subscribe({
      next: (productos: any[]) => {
        this.productosProveedorDisponibles = productos.map(p => ({
          ...p,
          seleccionado: false,
          yaSincronizado: false
        }));
        this.modoAgregarProductos = false;
        this.mostrarModalProductos = true;
      },
      error: (error: any) => {
        console.error('Error al cargar productos disponibles:', error);
        this._messageService.showError(
          'Error al cargar productos del proveedor.',
          'Error'
        );
      }
    });
  }

  // Método: Abrir modal para agregar productos adicionales a un proveedor existente
  abrirModalAgregarProductos(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    this.proveedorPendienteEscala = proveedor;
    this.modoAgregarProductos = true;
    const proveedorId = proveedor.id;

    // Cargar productos disponibles del proveedor
    this._proveedoresService.getProductosDisponibles({
      id: proveedorId
    }).subscribe({
      next: (productosDisponibles: any[]) => {
        // Cargar productos ya asociados
        this._productosService.getByProveedor({ id: proveedorId, history: false }).subscribe({
          next: (productosActuales: IProducto[]) => {
            const codigosActuales = new Set(productosActuales.map(p => p.codigoBarra));

            // Marcar cuáles ya están sincronizados
            this.productosProveedorDisponibles = productosDisponibles.map(p => ({
              ...p,
              seleccionado: false,
              yaSincronizado: codigosActuales.has(p.barCode || p.codigoBarra)
            }));
            this.mostrarModalProductos = true;
          },
          error: (error: any) => {
            console.error('Error al cargar productos actuales:', error);
            // Si hay error al cargar actuales, mostrar solo los disponibles sin marcar
            this.productosProveedorDisponibles = productosDisponibles.map(p => ({
              ...p,
              seleccionado: false,
              yaSincronizado: false
            }));
            this.mostrarModalProductos = true;
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar productos disponibles:', error);
        this._messageService.showError(
          'Error al cargar productos del proveedor.',
          'Error'
        );
      }
    });
  }

  toggleSeleccionarTodos(): void {
    this.productosProveedorDisponibles.forEach(p => {
      // No permitir seleccionar productos ya sincronizados
      if (!p.yaSincronizado) {
        p.seleccionado = this.seleccionarTodos;
      }
    });
  }

  contarSeleccionados(): number {
    return this.productosProveedorDisponibles.filter(p => p.seleccionado).length;
  }

  sincronizarProductos(): void {
    const seleccionados = this.productosProveedorDisponibles
      .filter(p => p.seleccionado)
      .map(p => p.barCode || p.codigoBarra);

    if (seleccionados.length === 0) {
      this._messageService.showInfo(
        'Debes seleccionar al menos un producto.',
        'Selección requerida'
      );
      return;
    }

    console.log('Productos seleccionados:', seleccionados);
    console.log('Tipo de seleccionados:', Array.isArray(seleccionados), seleccionados.length);

    // Crear objeto con método toJSON personalizado para controlar la serialización
    const payload = {
      id: this.proveedorPendienteEscala!.id!,
      codigosBarraProveedor: seleccionados,
      // Este método se llama automáticamente al serializar a JSON
      toJSON() {
        // Solo enviar codigosBarraProveedor en el body (no el id)
        return { codigosBarraProveedor: this.codigosBarraProveedor };
      }
    };

    console.log('Payload a enviar:', payload);
    console.log('Body que se enviará:', JSON.stringify(payload));

    this._proveedoresService.syncProductos(payload as any).subscribe({
      next: (result) => {
        console.log('Productos sincronizados:', result);
        const mensaje = `Sincronización completada:<br>
          - Total: ${result.total}<br>
          - Creados: ${result.created || 0}<br>
          - Actualizados: ${result.updated || 0}<br>
          - Errores: ${result.errors || 0}`;
        this._messageService.showSuccess(mensaje, 'Proveedor configurado');
        this.cerrarModalProductos();
        this.cargarProveedores();
      },
      error: (error: any) => {
        console.error('Error al sincronizar productos:', error);
        this._messageService.showError(
          'Error al sincronizar productos.',
          'Error'
        );
      }
    });
  }

  cerrarModalProductos(): void {
    this.mostrarModalProductos = false;
    this.productosProveedorDisponibles = [];
    this.seleccionarTodos = false;
    this.modoAgregarProductos = false;
    this.proveedorPendienteEscala = null;
  }

  // Método: Desasignar producto de un proveedor
  desasignarProducto(producto: IProducto, proveedorId: number): void {
    if (!producto.codigoBarra) return;

    if (confirm(`¿Estás seguro de que deseas desasignar "${producto.nombre}" de este proveedor?\n\nEsta acción no se puede deshacer.`)) {
      this._productosService.removeFromProvider({
        barCode: producto.codigoBarra,
        idProveedor: proveedorId
      }).subscribe({
        next: () => {
          console.log(`Producto ${producto.codigoBarra} desasignado del proveedor`);
          this._messageService.showSuccess(
            `"${producto.nombre}" ha sido desasignado exitosamente.`,
            'Producto desasignado'
          );
          // Recargar productos del proveedor
          if (this.proveedorSeleccionado) {
            this.verProductosProveedor(this.proveedorSeleccionado);
          }
        },
        error: (error: any) => {
          console.error('Error al desasignar producto:', error);
          this._messageService.showError(
            'Error al desasignar el producto. Por favor, intenta nuevamente.',
            'Error al desasignar'
          );
        }
      });
    }
  }

  sincronizarPrecios(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    if (confirm(`¿Deseas sincronizar los precios del proveedor ${proveedor.name}?`)) {
      this._proveedoresService.syncPrecios({ id: proveedor.id }).subscribe({
        next: (resultado) => {
          console.log('Sincronización exitosa:', resultado);
          const mensaje = `Sincronización completada:<br>
            - Precios creados: ${resultado.pricesCreated}<br>
            - Precios actualizados: ${resultado.pricesUpdated}<br>
            - Errores: ${resultado.errors}`;
          this._messageService.showSuccess(mensaje, 'Sincronización exitosa');
        },
        error: (error: any) => {
          console.error('Error al sincronizar precios:', error);
          this._messageService.showError('Error al sincronizar precios. Por favor, intenta nuevamente.', 'Error al sincronizar');
        }
      });
    }
  }

  eliminarProveedor(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    if (confirm(`¿Estás seguro de que deseas eliminar el proveedor "${proveedor.name}"?\n\nEsta acción no se puede deshacer.`)) {
      this._proveedoresService.delete({ id: proveedor.id }).subscribe({
        next: () => {
          console.log('Proveedor eliminado:', proveedor.id);
          this._messageService.showSuccess(`El proveedor "${proveedor.name}" ha sido eliminado exitosamente.`, 'Proveedor eliminado');
          this.cargarProveedores(); // Recargar la lista de proveedores
        },
        error: (error: any) => {
          console.error('Error al eliminar proveedor:', error);
          this._messageService.showError('Error al eliminar el proveedor. Por favor, intenta nuevamente.', 'Error al eliminar');
        }
      });
    }
  }

  toggleActivoProveedor(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    const nuevoEstado = !proveedor.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    const mensaje = nuevoEstado
      ? `¿Deseas activar el proveedor "${proveedor.name}"?\n\nPodrá ser usado en pedidos automatizados.`
      : `¿Deseas desactivar el proveedor "${proveedor.name}"?\n\nNo será considerado en futuros pedidos automatizados.`;

    if (confirm(mensaje)) {
      this._proveedoresService.toggleActivo({ id: proveedor.id, activo: nuevoEstado }).subscribe({
        next: (proveedorActualizado: IProveedor) => {
          console.log('Estado del proveedor actualizado:', proveedorActualizado);
          const estadoTexto = nuevoEstado ? 'activado' : 'desactivado';
          this._messageService.showSuccess(
            `El proveedor "${proveedor.name}" ha sido ${estadoTexto} exitosamente.`,
            `Proveedor ${estadoTexto}`
          );
          this.cargarProveedores(); // Recargar la lista de proveedores
        },
        error: (error: any) => {
          console.error(`Error al ${accion} proveedor:`, error);
          this._messageService.showError(
            `Error al ${accion} el proveedor. Por favor, intenta nuevamente.`,
            `Error al ${accion}`
          );
        }
      });
    }
  }

  verProductosProveedor(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    this.proveedorSeleccionado = proveedor;
    this.proveedorPendienteEscala = proveedor;
    this.modoAgregarProductos = false;
    const proveedorId = proveedor.id;

    // Cargar productos disponibles del proveedor
    this._proveedoresService.getProductosDisponibles({
      id: proveedorId
    }).subscribe({
      next: (productosDisponibles: any[]) => {
        // Cargar productos ya asociados
        this._productosService.getByProveedor({ id: proveedorId, history: true }).subscribe({
          next: (productosActuales: IProducto[]) => {
            const codigosActuales = new Set(productosActuales.map(p => p.codigoBarra));

            // Mapear todos los productos y marcar cuáles ya están sincronizados
            this.productosProveedorDisponibles = productosDisponibles.map(p => ({
              ...p,
              seleccionado: false,
              yaSincronizado: codigosActuales.has(p.barCode || p.codigoBarra)
            }));
            this.mostrarModalProductos = true;
            console.log(`Productos del proveedor ${proveedor.name}:`, this.productosProveedorDisponibles);
          },
          error: (error: any) => {
            console.error('Error al cargar productos actuales:', error);
            this._messageService.showError('Error al cargar los productos del proveedor.', 'Error al cargar');
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar productos disponibles:', error);
        this._messageService.showError('Error al cargar los productos del proveedor.', 'Error al cargar');
      }
    });
  }

  cerrarProductos(): void {
    this.mostrarModalProductos = false;
    this.productosProveedorDisponibles = [];
    this.seleccionarTodos = false;
    this.modoAgregarProductos = false;
    this.proveedorSeleccionado = null;
    this.proveedorPendienteEscala = null;
    this.productosProveedor = [];
  }

  obtenerPrecioActual(producto: IProducto): number | null {
    if (!producto.precios || producto.precios.length === 0) {
      return null;
    }
    // El precio actual es el que tiene fechaFin = null
    const precioActual = producto.precios.find(p => p.fechaFin === null);
    return precioActual ? precioActual.precio : null;
  }

  obtenerTextoRating(rating: number | null | undefined): string {
    if (!rating || rating === null || rating === undefined) {
      return 'Sin evaluaciones';
    }
    // Convertir a número por si viene como string
    const ratingNumero = typeof rating === 'number' ? rating : parseFloat(String(rating));

    if (isNaN(ratingNumero)) {
      return 'Sin evaluaciones';
    }

    return ratingNumero.toFixed(2);
  }

}
