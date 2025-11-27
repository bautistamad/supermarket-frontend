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
}
