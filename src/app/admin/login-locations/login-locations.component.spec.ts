import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginLocationsComponent } from './login-locations.component';

describe('LoginLocationsComponent', () => {
  let component: LoginLocationsComponent;
  let fixture: ComponentFixture<LoginLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginLocationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
