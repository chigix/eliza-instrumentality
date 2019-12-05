import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSpaceComponent } from './input-space.component';

describe('InputSpaceComponent', () => {
  let component: InputSpaceComponent;
  let fixture: ComponentFixture<InputSpaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputSpaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
