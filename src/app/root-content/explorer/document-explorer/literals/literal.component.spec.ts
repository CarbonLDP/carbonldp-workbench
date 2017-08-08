import { Component, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { By } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";

import * as NS from "carbonldp/NS";

import { Modes } from "../property/property.component"
import { Literal, LiteralComponent, LiteralRow } from "./literal.component";
import { LiteralValueValidator } from "../document-explorer-validators";

export function literalSpecs() {

	describe( "LiteralComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<table>
					<tr class="cw-literal" [literal]="literalRow"></tr>
				</table>`
		} )
		class TestComponent {

			literal:Literal;
			literalRow:LiteralRow;
			@ViewChild( LiteralComponent ) literalCmp:LiteralComponent;

		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ LiteralComponent, LiteralValueValidator, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
		} );

		describe( "With existing literal", () => {

			describe( "On EDIT mode", () => {

				fit( "Should change mode to edit", () => {

					let literal:Literal = {
						"@type": NS.XSD.DataType.dateTime,
						"@value": "2017-06-10T23:38:19.000Z"
					};
					let literalRow:LiteralRow = {
						copy: literal
					};
					comp.literalRow = literalRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();
					expect( comp.literalCmp.mode ).toEqual( Modes.EDIT );
				} );

				fit( "Should set type to string when no @type present in literal", () => {

					let literal:Literal = {
						"@value": "42"
					};
					let literalRow:LiteralRow = {
						copy: literal
					};
					comp.literalRow = literalRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let type:string = comp.literalCmp.searchDropdown.val();
					expect( type ).toEqual( NS.XSD.DataType.string );
				} );

				fit( "Should show `invalid value type` when entering wrong value types", () => {

					let literal:Literal = {
						"@value": 42,
						"@type": NS.XSD.DataType.int,
					};
					let literalRow:LiteralRow = {
						copy: literal
					};
					comp.literalRow = literalRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();
					comp.literalCmp.ngAfterViewChecked();

					let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
					valueInput.value = "Some text"
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					let errorMessage:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".error.message" );
					expect( errorMessage ).toBeDefined();
					expect( errorMessage.innerText ).toContain( "Invalid value type, please enter a valid http://www.w3.org/2001/XMLSchema#int." )


					valueInput.value = "4";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					errorMessage = comp.literalCmp.element.nativeElement.querySelector( ".error.message" );
					expect( errorMessage ).toBeNull();
				} );

			} );

			describe( "On READ mode", () => {

			} );

			fit( "Should change mode to read when cancel edit", () => {

				let literal:Literal = {
					"@type": NS.XSD.DataType.dateTime,
					"@value": "2017-06-10T23:38:19.000Z"
				};
				let literalRow:LiteralRow = {
					copy: literal
				};
				comp.literalRow = literalRow;
				fixture.detectChanges();

				// Enter edit mode
				let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();
				// Cancel edit mode
				let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
				cancelButton.click();
				fixture.detectChanges();
				expect( comp.literalCmp.mode === Modes.READ );
			} );


		} );

		describe( "With new literal", () => {

		} );

	} );

}