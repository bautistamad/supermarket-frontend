import { Injectable } from '@angular/core';
import {
  IResourceMethodObservable,
  Resource,
  ResourceAction,
  ResourceHandler,
  ResourceParams,
  ResourceRequestMethod
} from '@ngx-resource/core';
import { IProveedor } from '../models/i-proveedor';
import { environment } from 'src/environments/environment';

@Injectable()
@ResourceParams(
  {
    pathPrefix: `${environment.apiUrl}/api`
  }
)
export class ProveedoresResource extends Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  @ResourceAction({
    path: '/proveedores',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<void, IProveedor[]>

  @ResourceAction({
    path: '/proveedores/{!id}',
    method: ResourceRequestMethod.Get
  })
  getById!: IResourceMethodObservable<{ id: number }, IProveedor>

  @ResourceAction({
    path: '/proveedores',
    method: ResourceRequestMethod.Post
  })
  create!: IResourceMethodObservable<IProveedor, IProveedor>

  @ResourceAction({
    path: '/proveedores/{!id}/sync',
    method: ResourceRequestMethod.Post
  })
  syncPrecios!: IResourceMethodObservable<{ id: number }, { pricesCreated: number, pricesUpdated: number, errors: number }>

  @ResourceAction({
    path: '/proveedores/{!id}/productos-disponibles',
    method: ResourceRequestMethod.Get
  })
  getProductosDisponibles!: IResourceMethodObservable<{ id: number }, any[]>

  @ResourceAction({
    path: '/proveedores/{!id}/rating',
    method: ResourceRequestMethod.Get
  })
  getRating!: IResourceMethodObservable<{ id: number }, number>

  @ResourceAction({
    path: '/proveedores/{!id}',
    method: ResourceRequestMethod.Delete
  })
  delete!: IResourceMethodObservable<{ id: number }, void>

  @ResourceAction({
    path: '/proveedores/{!id}/toggle-activo',
    method: ResourceRequestMethod.Put
  })
  toggleActivo!: IResourceMethodObservable<{ id: number, activo: boolean }, IProveedor>

  @ResourceAction({
    path: '/proveedores/{!id}/sync-productos',
    method: ResourceRequestMethod.Post
  })
  syncProductos!: IResourceMethodObservable<{ id: number, codigosBarraProveedor: number[] }, { proveedorId: number, total: number, created?: number, updated?: number, errors?: number }>
}
