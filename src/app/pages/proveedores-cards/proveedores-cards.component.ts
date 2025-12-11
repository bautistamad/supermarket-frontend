import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProveedor } from '../../api/models/i-proveedor';
import { ProveedoresResource } from '../../api/resources/proveedores-resource.service';
import { ProductosResource } from '../../api/resources/productos-resource.service';
import { IProducto } from '../../api/models/i-producto';
import { EscalasResource } from '../../api/resources/escalas-resource.service';
import { IEscala } from '../../api/models/i-escala';

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

  proveedorForm!: FormGroup;

  constructor(
    private _proveedoresService: ProveedoresResource,
    private _productosService: ProductosResource,
    private _escalasService: EscalasResource,
    private _fb: FormBuilder
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
      apiKey: ['', [Validators.required, Validators.minLength(10)]]
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
          // Asegurar que sea un número o null
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
      alert('Por favor completa todos los campos correctamente.');
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
        alert('Error al crear el proveedor. Por favor, intenta nuevamente.');
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
          alert('Proveedor creado exitosamente. No requiere configuración de escalas.');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar escalas:', error);
        alert('Proveedor creado pero hubo un error al cargar las escalas. Recarga la página.');
        this.cargarProveedores();
      }
    });
  }

  guardarMapeosEscalas(): void {
    // Validar que todas las escalas tengan un valor asignado
    const escalasSinMapear = this.escalasParaMapear.filter(e => e.escalaInt === null || e.escalaInt === undefined);

    if (escalasSinMapear.length > 0) {
      alert('Por favor asigna un valor a todas las escalas antes de continuar.');
      return;
    }

    // Validar que los valores estén entre 1 y 5
    const escalasInvalidas = this.escalasParaMapear.filter(e => e.escalaInt! < 1 || e.escalaInt! > 5);

    if (escalasInvalidas.length > 0) {
      alert('Los valores de escala deben estar entre 1 y 5.');
      return;
    }

    this._escalasService.saveMappings(this.escalasParaMapear).subscribe({
      next: (escalasGuardadas: IEscala[]) => {
        console.log('Escalas mapeadas:', escalasGuardadas);
        this.cerrarModalEscalas();
        this.cargarProveedores();
        alert(`Proveedor ${this.proveedorPendienteEscala?.name} configurado exitosamente.`);
      },
      error: (error: any) => {
        console.error('Error al guardar escalas:', error);
        alert('Error al guardar las escalas. Por favor, intenta nuevamente.');
      }
    });
  }

  cerrarModalEscalas(): void {
    this.mostrarModalEscalas = false;
    this.escalasParaMapear = [];
    this.proveedorPendienteEscala = null;
  }

  sincronizarPrecios(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    if (confirm(`¿Deseas sincronizar los precios del proveedor ${proveedor.name}?`)) {
      this._proveedoresService.syncPrecios({ id: proveedor.id }).subscribe({
        next: (resultado) => {
          console.log('Sincronización exitosa:', resultado);
          alert(`Sincronización completada:\n- Precios creados: ${resultado.pricesCreated}\n- Precios actualizados: ${resultado.pricesUpdated}\n- Errores: ${resultado.errors}`);
        },
        error: (error: any) => {
          console.error('Error al sincronizar precios:', error);
          alert('Error al sincronizar precios. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  verProductosProveedor(proveedor: IProveedor): void {
    if (!proveedor.id) return;

    this.proveedorSeleccionado = proveedor;
    this.mostrarProductos = true;

    this._productosService.getByProveedor({ id: proveedor.id, history: true }).subscribe({
      next: (productos: IProducto[]) => {
        this.productosProveedor = productos;
        console.log(`Productos del proveedor ${proveedor.name}:`, productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos del proveedor.');
        this.cerrarProductos();
      }
    });
  }

  cerrarProductos(): void {
    this.mostrarProductos = false;
    this.proveedorSeleccionado = null;
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
