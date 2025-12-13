  import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { LoginComponent } from './pages/login/login.component';
import { SplashPageComponent } from './pages/splash-page/splash-page.component';

  const routes: Routes = [
    { path: '', component: SplashPageComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: '/main'}
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
