import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-page',
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit {
  fadeOut = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Activar fade-out medio segundo antes de redirigir
    setTimeout(() => {
      this.fadeOut = true;
    }, 2500);

    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}
