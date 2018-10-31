import { Component, DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ErrorLabelComponent } from "./error-label.component";

export function errorLabelSpecs() {

	describe( "ErrorLabelDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<h2>Something</h2>
				<app-error-label>
					<span>Enter a valid something</span>
				</app-error-label>`
		} )
		class TestComponent {
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TestComponent, ErrorLabelComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should project content within", () => {
			let errorLabel:HTMLElement = de.query( By.css( "app-error-label" ) ).nativeElement;
			expect( errorLabel.innerText ).toEqual( "Enter a valid something" );
		} );

		it( "Should have classes 'ui red basic error label'", () => {
			let errorLabel:HTMLElement = de.query( By.css( "app-error-label" ) ).nativeElement;
			expect( errorLabel.className ).toEqual( "ui red basic error label" );
		} );

	} );
}

function rgbToHex( rgb ) {
	if( /^#[0-9A-F]{6}$/i.test( rgb ) ) return rgb;

	rgb = rgb.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );

	function hex( x ) {
		return ("0" + parseInt( x ).toString( 16 )).slice( - 2 );
	}

	return "#" + hex( rgb[ 1 ] ) + hex( rgb[ 2 ] ) + hex( rgb[ 3 ] );
}
