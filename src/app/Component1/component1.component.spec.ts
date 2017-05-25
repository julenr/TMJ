import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Component1Component } from './component1.component';

describe('Component1Component', () => {
  let de: DebugElement;
  let comp: Component1Component;
  let fixture: ComponentFixture<Component1Component>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [Component1Component],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(Component1Component);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('div'));
  });

  it('should create Component1Component', () => expect(comp).toBeDefined());

  it('should have expected <div> "This is a Tangram Button"', () => {
    fixture.detectChanges();
    const div = de.nativeElement;
    expect(div.innerText).toMatch(
      /This is a Tangram Button/i
    );
  });
});
