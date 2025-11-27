import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { ProductosList } from '../pages/productos-list/productos-list';
import { ProductosResource } from '../api/resources/productos-resource';


@NgModule({
  declarations: [
    ProductosList
  ],
  providers: [
    ProductosResource
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
