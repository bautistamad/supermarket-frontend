import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUsuario } from '../api/models/i-usuario';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  usuarioActual: IUsuario | null = null;

  constructor(private _router: Router) {}

  ngOnInit(): void {
    // Cargar el usuario desde localStorage
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      this.usuarioActual = JSON.parse(usuarioString);
    }
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('usuario');

    // Redirigir al login
    this._router.navigate(['/login']);
  }
}
