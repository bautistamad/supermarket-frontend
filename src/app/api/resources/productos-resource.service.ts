import {Injectable} from '@angular/core';
import {
    IResourceMethodObservable,
    Resource,
    ResourceAction,
    ResourceHandler,
    ResourceParams,
    ResourceRequestMethod
  } from '@ngx-resource/core';
import {IProducto} from '../models/i-producto';
import { environment } from 'src/environments/environment';

@Injectable()
@ResourceParams(
  {
    pathPrefix: `${environment.apiUrl}/api`
  }
)
export class ProductosResource extends  Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  @ResourceAction({
    path: '/productos',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<void, IProducto[]>

  @ResourceAction({
    path: '/productos/{!barCode}',
    method: ResourceRequestMethod.Get
  })
  getById!: IResourceMethodObservable<{ barCode: number},IProducto>
}
