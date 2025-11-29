import { Component, OnInit } from '@angular/core';
import { IProveedor } from '../../api/models/i-proveedor';
import { ProveedoresResource } from '../../api/resources/proveedores-resource.service';
import { ProductosResource } from '../../api/resources/productos-resource.service';
import { IProducto } from '../../api/models/i-producto';

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
   nuevoProveedor: IProveedor = {
    name: '',
    apiEndpoint: '',
    tipoServicio: 1,
    apiKey: '',
    clientId: ''
  };

  constructor(
    private _proveedoresService: ProveedoresResource,
    private _productosService: ProductosResource
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

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
        this.cargarProveedores();
        this.toggleFormulario();
        alert('Proveedor creado exitosamente');
      },
      error: (error: any) => {
        console.error('Error al crear proveedor:', error);
        alert('Error al crear el proveedor. Por favor, intenta nuevamente.');
      }
    })
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
}
