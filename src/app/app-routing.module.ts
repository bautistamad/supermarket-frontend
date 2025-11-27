  import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';

  const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: '**', redirectTo: '/main'}
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
