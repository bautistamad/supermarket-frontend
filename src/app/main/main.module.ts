import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { ProductosList } from '../pages/productos-list/productos-list';
import { ProductosResource } from '../api/resources/productos-resource.service';
import { ProveedoresResource } from '../api/resources/proveedores-resource.service';
import { PedidosResource } from '../api/resources/pedidos-resource.service';
import { MainComponent } from './main.component';
import { ProveedoresCardsComponent } from '../pages/proveedores-cards/proveedores-cards.component';
import { PedidosListComponent } from '../pages/pedidos-list/pedidos-list.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MainComponent,
    ProductosList,
    ProveedoresCardsComponent,
    PedidosListComponent
  ],
  providers: [
    ProductosResource,
    ProveedoresResource,
    PedidosResource
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    FormsModule
  ]
})
export class MainModule { }
