import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingService, Loader } from '../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit, OnDestroy {

  private _subscription!: Subscription;
  private _loaded: boolean = false;

  constructor(private _service: LoadingService) {}

  ngOnInit(): void {
    this._subscription = this._service.loader$.subscribe((ref: Loader) => {
      this._loaded = ref.loaded;
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  get loaded(): boolean {
    return this._loaded;
  }
}
