import { TestBed } from '@angular/core/testing';

import { MapaSalonApi } from './mapa-salon-api';

describe('MapaSalonApi', () => {
  let service: MapaSalonApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapaSalonApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
