import { Injectable } from '@angular/core';
import {
  IResourceMethodObservable,
  Resource,
  ResourceAction,
  ResourceHandler,
  ResourceParams,
  ResourceRequestMethod
} from '@ngx-resource/core';
import { IPedido } from '../models/i-pedido';
import { environment } from 'src/environments/environment';

@Injectable()
@ResourceParams(
  {
    pathPrefix: `${environment.apiUrl}/api`
  }
)
export class PedidosResource extends Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  @ResourceAction({
    path: '/pedidos',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<void, IPedido[]>

  @ResourceAction({
    path: '/pedidos/{!id}',
    method: ResourceRequestMethod.Get
  })
  getById!: IResourceMethodObservable<{ id: number }, IPedido>

  @ResourceAction({
    path: '/pedidos/proveedor/{!proveedorId}',
    method: ResourceRequestMethod.Get
  })
  getByProveedor!: IResourceMethodObservable<{ proveedorId: number }, IPedido[]>

  @ResourceAction({
    path: '/pedidos',
    method: ResourceRequestMethod.Post
  })
  create!: IResourceMethodObservable<IPedido, IPedido>

  @ResourceAction({
    path: '/pedidos/{!id}',
    method: ResourceRequestMethod.Delete
  })
  delete!: IResourceMethodObservable<{ id: number }, void>
}
