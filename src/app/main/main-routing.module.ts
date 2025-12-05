import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosList } from '../pages/productos-list/productos-list';
import { MainComponent } from './main.component';
import { ProveedoresCardsComponent } from '../pages/proveedores-cards/proveedores-cards.component';
import { PedidosListComponent } from '../pages/pedidos-list/pedidos-list.component';

  const routes: Routes = [
    {
      path: 'main',
      component: MainComponent,
      children: [
        { path: '', redirectTo: 'productos', pathMatch: 'full' },
        { path: 'productos', component: ProductosList },
        { path: 'proveedores', component: ProveedoresCardsComponent },
        { path: 'pedidos', component: PedidosListComponent }
      ]
    },
    { path: 'productos', redirectTo: '/main/productos', pathMatch: 'full' }
  ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
