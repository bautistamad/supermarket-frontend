import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosList } from '../pages/productos-list/productos-list';

const routes: Routes = [
  { path: 'main', component: ProductosList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
