  import { NgModule, ErrorHandler } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  import { HttpClientModule } from '@angular/common/http';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';
  import { ResourceModule } from '@ngx-resource/handler-ngx-http';
  import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

  import { AppComponent } from './app.component';
  import { AppRoutingModule } from './app-routing.module';
  import { MainModule } from './main/main.module';
  import { LoginComponent } from './pages/login/login.component';
  import { AuthResource } from './api/resources/auth-resource.service';
  import { CoreModule } from './core/core.module';
  import { AppErrorService } from './core/handlers/app-error.service';
import { SplashPageComponent } from './pages/splash-page/splash-page.component';

  @NgModule({
    declarations: [
      AppComponent,
      LoginComponent,
      SplashPageComponent
    ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      ResourceModule.forRoot(),
      NgbModule,
      CoreModule,
      MainModule,
      AppRoutingModule
    ],
    providers: [
      AuthResource,
      { provide: ErrorHandler, useClass: AppErrorService }
    ],
    bootstrap: [AppComponent]
  })
  export class AppModule { }