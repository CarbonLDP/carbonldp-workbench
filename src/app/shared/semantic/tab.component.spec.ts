import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { TabComponent } from "./tab.component";

export function tabComponentSpecs() {

	describe( "TabComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;

		@Component( {
			template: `<sui-tab></sui-tab> <sui-tab class="second">Second Tab</sui-tab>`
		} )
		class TestComponent {
			@ViewChild( TabComponent ) tab:TabComponent;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TabComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			fixture.detectChanges();
		} );

		it( "Should have property active", () => {
			expect( comp.tab.active ).toBeDefined();
		} );

		it( "Should have 'active' class when setting property active to true", () => {
			expect( comp.tab.active ).toBeDefined();
			comp.tab.active = true;
			fixture.detectChanges();
			let tab:HTMLElement = fixture.nativeElement.querySelector( "sui-tab" );
			expect( tab.classList ).toContain( "active" );
		} );

		it( "Should have property title", () => {
			expect( comp.tab.title ).toBeDefined();
		} );

		it( "Should have content defined inside ng-content", () => {
			debugger;
			let tab:HTMLElement = fixture.nativeElement.querySelector( "sui-tab.second" );

			expect( tab.innerText ).toBe( "Second Tab" );
		} );

	} );

}