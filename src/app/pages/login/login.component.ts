import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResource } from '../../api/resources/auth-resource.service';
import { ILoginRequest } from '../../api/models/i-usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData: ILoginRequest = {
    username: '',
    password: ''
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private _authService: AuthResource,
    private _router: Router
  ) {}

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._authService.login(this.loginData).subscribe({
      next: (usuario) => {
        console.log('Login exitoso:', usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this._router.navigate(['/main/productos']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
