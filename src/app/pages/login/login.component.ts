import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResource } from '../../api/resources/auth-resource.service';
import { AppMessageService } from '../../core/services/app-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthResource,
    private _router: Router,
    private _messageService: AppMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this._fb.group({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  login(): void {
    this.submitted = true;

    if (!this.loginForm.valid) {
      return;
    }

    this._authService.login(this.loginForm.value).subscribe({
      next: (usuario) => {
        console.log('Login exitoso:', usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this._router.navigate(['/main/productos']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this._messageService.showError('Usuario o contraseña incorrectos', 'Error de autenticación');
      }
    });
  }

  // Helpers para el template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
