import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeGComponent } from './employee-gcomponent';

describe('EmployeeGComponent', () => {
  let component: EmployeeGComponent;
  let fixture: ComponentFixture<EmployeeGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeGComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
