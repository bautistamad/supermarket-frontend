import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

@NgModule({
  declarations: [
    MessageDialogComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MessageDialogComponent,
    LoadingComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
