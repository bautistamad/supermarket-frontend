  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { HttpClientModule } from '@angular/common/http';
  import { ResourceModule } from '@ngx-resource/handler-ngx-http';

  import { AppComponent } from './app.component';
  import { AppRoutingModule } from './app-routing.module';
  import { MainModule } from './main/main.module';

  @NgModule({
    declarations: [
      AppComponent
    ],
    imports: [
      BrowserModule,
      HttpClientModule,
      ResourceModule.forRoot(),
      MainModule,
      AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
  export class AppModule { }