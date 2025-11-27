import { TestBed } from '@angular/core/testing';

import { ProveedoresResourceService } from './proveedores-resource.service';

describe('ProveedoresResourceService', () => {
  let service: ProveedoresResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveedoresResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
