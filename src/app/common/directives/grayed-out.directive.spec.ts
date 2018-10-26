import { Component, DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { GrayedOutDirective } from "./grayed-out.directive";

export function grayedOutSpecs() {

	describe( "GrayedOutDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<h2>Something normal</h2>
				<h2 app-grayed-out>Something grayed out</h2>`
		} )
		class TestComponent {
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TestComponent, GrayedOutDirective, ],
			} ).compileComponents();
		} ) );


		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );


		it( "Should be grayed out", () => {


			let normalH2:HTMLElement = de.query( By.css( "h2:not([app-grayed-out])" ) ).nativeElement;
			let grayedH2:HTMLElement = de.query( By.css( "h2[app-grayed-out]" ) ).nativeElement;


			expect( normalH2.style.color ).toEqual( "" );
			expect( rgbToHex( grayedH2.style.color ) ).toEqual( "#bdbaba" );

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
