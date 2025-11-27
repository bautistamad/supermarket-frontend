import { Component, OnInit } from '@angular/core';
import { IProveedor } from '../../api/models/i-proveedor';
import { ProveedoresResource } from '../../api/resources/proveedores-resource.service';

@Component({
  selector: 'app-proveedores-cards',
  templateUrl: './proveedores-cards.component.html',
  styleUrls: ['./proveedores-cards.component.css']
})
export class ProveedoresCardsComponent implements OnInit {

  proveedores: IProveedor[] = [];
  mostrarFormulario: boolean = false;
   nuevoProveedor: IProveedor = {
    name: '',
    apiEndpoint: '',
    tipoServicio: 1,
    apiKey: ''
  };

  constructor(private _proveedoresService: ProveedoresResource) {}

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
      apiKey: ''
    };
  }

  guardarProveedor(): void {
    if( !this.nuevoProveedor.name || !this.nuevoProveedor.apiEndpoint || !this.nuevoProveedor.apiKey){
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
}
