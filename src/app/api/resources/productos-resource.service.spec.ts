import { TestBed } from '@angular/core/testing';

import { ProductosResource } from './productos-resource.service';

describe('ProductosResource', () => {
  let service: ProductosResource;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosResource);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
