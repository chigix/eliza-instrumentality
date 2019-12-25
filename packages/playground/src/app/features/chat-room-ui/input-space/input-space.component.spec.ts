import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InputSpaceComponent } from './input-space.component';

describe('InputSpaceComponent', () => {
  let component: InputSpaceComponent;
  let fixture: ComponentFixture<InputSpaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputSpaceComponent],
      imports: [
        NoopAnimationsModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatIconModule],
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
