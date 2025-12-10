import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IMessage } from '../models/i-message';
import { AppMessageService } from '../services/app-message.service';

@Injectable({
  providedIn: 'root'
})
export class AppErrorService implements ErrorHandler {

  private _service: AppMessageService | undefined;

  constructor(private _injector: Injector, private _ngZone: NgZone) { }

  handleError(error: any): void {
    let message: IMessage;

    if (!this._service) {
      this._service = this._injector.get(AppMessageService);
    }

    if (error.rejection) {
      error = error.rejection;
    }

    // Manejo de errores HTTP de @ngx-resource
    if (error.body) {
      if (error.body.message) {
        message = { text: error.body.message, num: error.status, title: 'Error' };
      } else if (error.body.error) {
        message = { text: error.body.error, num: error.status, title: 'Error' };
      } else {
        if (error.status == 0) {
          message = { text: 'Error al conectarse al servicio', num: error.status, title: 'Error de Conexión' };
        } else {
          message = { text: error.body, num: error.status, title: 'Error' };
        }
      }
    }
    // Manejo de errores HTTP estándar
    else if (error.error) {
      if (typeof error.error === 'string') {
        message = { text: error.error, num: error.status, title: 'Error' };
      } else if (error.error.message) {
        message = { text: error.error.message, num: error.status, title: 'Error' };
      } else {
        message = { text: JSON.stringify(error.error), num: error.status, title: 'Error' };
      }
    }
    // Errores de JavaScript
    else if (error.message) {
      message = { text: error.message, num: error.status, title: 'Error' };
    }
    // Error genérico
    else {
      message = { text: error.toString(), num: error.status, title: 'Error' };
    }

    // Log solo en desarrollo
    if (!environment.production) {
      console.error('Error capturado por AppErrorService:', error);
    }

    // Mostrar el modal en la zona de Angular
    this._ngZone.run(() => this._service?.showMessage(message));
  }
}
