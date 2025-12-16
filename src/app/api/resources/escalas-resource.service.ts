import { Injectable } from '@angular/core';
import {
  IResourceMethodObservable,
  Resource,
  ResourceAction,
  ResourceHandler,
  ResourceParams,
  ResourceRequestMethod
} from '@ngx-resource/core';
import { IEscala } from '../models/i-escala';
import { environment } from 'src/environments/environment';

@Injectable()
@ResourceParams(
  {
    pathPrefix: `${environment.apiUrl}/api`
  }
)
export class EscalasResource extends Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  @ResourceAction({
    path: '/escalas/proveedor/{!proveedorId}',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<{ proveedorId: number }, IEscala[]>

  @ResourceAction({
    path: '/escalas/proveedor/{!proveedorId}/unmapped',
    method: ResourceRequestMethod.Get
  })
  getUnmapped!: IResourceMethodObservable<{ proveedorId: number }, IEscala[]>

  @ResourceAction({
    path: '/escalas/proveedor/{!proveedorId}/status',
    method: ResourceRequestMethod.Get
  })
  getStatus!: IResourceMethodObservable<{ proveedorId: number }, { proveedorId: number, totalScales: number, mappedScales: number, unmappedScales: number, allMapped: boolean }>

  @ResourceAction({
    path: '/escalas',
    method: ResourceRequestMethod.Post
  })
  saveMappings!: IResourceMethodObservable<IEscala[], IEscala[]>
}
