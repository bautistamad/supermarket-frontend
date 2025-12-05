import { Injectable } from '@angular/core';
import {
  IResourceMethodObservable,
  Resource,
  ResourceAction,
  ResourceHandler,
  ResourceParams,
  ResourceRequestMethod
} from '@ngx-resource/core';
import { IUsuario, ILoginRequest } from '../models/i-usuario';
import { environment } from 'src/environments/environment';

@Injectable()
@ResourceParams(
  {
    pathPrefix: `${environment.apiUrl}/api`
  }
)
export class AuthResource extends Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  @ResourceAction({
    path: '/auth/login',
    method: ResourceRequestMethod.Post
  })
  login!: IResourceMethodObservable<ILoginRequest, IUsuario>
}
