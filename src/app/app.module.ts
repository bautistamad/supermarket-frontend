  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  import { HttpClientModule } from '@angular/common/http';
  import { FormsModule } from '@angular/forms';
  import { ResourceModule } from '@ngx-resource/handler-ngx-http';

  import { AppComponent } from './app.component';
  import { AppRoutingModule } from './app-routing.module';
  import { MainModule } from './main/main.module';
  import { LoginComponent } from './pages/login/login.component';
  import { AuthResource } from './api/resources/auth-resource.service';

  @NgModule({
    declarations: [
      AppComponent,
      LoginComponent
    ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      FormsModule,
      ResourceModule.forRoot(),
      MainModule,
      AppRoutingModule
    ],
    providers: [
      AuthResource
    ],
    bootstrap: [AppComponent]
  })
  export class AppModule { }