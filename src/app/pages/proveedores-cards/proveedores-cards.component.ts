import { Component, OnInit } from '@angular/core';
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
   nuevoProveedor: IProveedor = {
    name: '',
    apiEndpoint: '',
    tipoServicio: 1,
    apiKey: '',
    clientId: ''
  };

  constructor(
    private _proveedoresService: ProveedoresResource,
    private _productosService: ProductosResource,
    private _escalasService: EscalasResource
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
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
      next: (rating: number) => {
        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (proveedor) {
          proveedor.ratingPromedio = rating;
        }
      },
      error: (error: any) => {
        console.error(`Error al cargar rating del proveedor ${proveedorId}:`, error);
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
    this.nuevoProveedor = {
      name: '',
      apiEndpoint: '',
      tipoServicio: 1,
      apiKey: '',
      clientId: ''
    };
  }

  guardarProveedor(): void {
    if( !this.nuevoProveedor.name || !this.nuevoProveedor.apiEndpoint || !this.nuevoProveedor.apiKey || !this.nuevoProveedor.clientId){
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this._proveedoresService.create(this.nuevoProveedor).subscribe({
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
    if (!rating || rating === null) {
      return 'Sin evaluaciones';
    }
    return rating.toFixed(2);
  }
}
