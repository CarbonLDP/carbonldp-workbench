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
					<tr class="cw-literal" [literal]="literalRow" [partOfList]="partOfList"></tr>
				</table>`
		} )
		class TestComponent {

			literal:Literal;
			literalRow:LiteralRow;
			partOfList:boolean = false;
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


		describe( "On READ mode", () => {

			let literal:Literal;
			let literalRow:LiteralRow;

			beforeEach( () => {
				literal = { "@value": "My value" };
				literalRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();
			} );

			it( "Should display @value", () => {

				let valueLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".value .read-mode p.value" );
				expect( valueLabel.innerText ).toEqual( "My value" );
			} );

			it( "Should display @type", () => {

				let literal:Literal = { "@value": 42, "@type": NS.XSD.DataType.int };
				let literalRow:LiteralRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();

				let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
				expect( typeLabel.innerText ).toEqual( NS.XSD.DataType.int );
			} );

			it( "Should display @type as string if not present", () => {

				let literal:Literal = { "@value": 42 };
				let literalRow:LiteralRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();

				let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
				expect( typeLabel.innerText ).toEqual( NS.XSD.DataType.string );
			} );

			it( "Should display @language if present", () => {

				let literal:Literal = {
					"@value": "My value",
					"@language": "en",
				};
				let literalRow:LiteralRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();

				let languageLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".language .read-mode p.value" );
				expect( languageLabel.innerText ).toEqual( "en" );
			} );

			it( "Should not display @language if not present", () => {

				let languageLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".language .read-mode p.value" );
				expect( languageLabel.innerText.trim() ).toEqual( "" );
			} );

			it( "Should display Edit & Delete buttons", () => {

				let editButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Edit literal']" );
				let deleteButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Delete Literal']" );
				expect( editButton ).not.toBeNull();
				expect( deleteButton ).not.toBeNull();
			} );

			it( "Should not display buttons when canEdit is false", () => {

				comp.literalCmp.canEdit = false;
				fixture.detectChanges();
				comp.literalCmp.ngAfterViewChecked();

				let actionButtons:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".buttons" );
				expect( actionButtons ).toBeNull();
			} );

			describe( "When being part of a list", () => {

				beforeEach( () => {

					comp.partOfList = true;
					fixture.detectChanges();
				} );

				it( "Should display Up and Down buttons", () => {

					let upButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".updown.buttons .button .up.chevron" );
					let downButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".updown.buttons .button .down.chevron" );
					expect( upButton ).not.toBeNull();
					expect( downButton ).not.toBeNull();
				} );

				it( "Should emit literal when clicking moveUp button", ( done ) => {

					literal = { "@value": "My value" };
					literalRow = { copy: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					comp.literalCmp.onMoveUp.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let upButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".updown.buttons .button .up.chevron" );
					upButton.click();
				} );

				it( "Should emit literal when clicking moveDown button", ( done ) => {

					literal = { "@value": "My value" };
					literalRow = { copy: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					comp.literalCmp.onMoveDown.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let downButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".updown.buttons .button .down.chevron" );
					downButton.click();
				} );
			} );

			describe( "When clicking on edit literal", () => {

				it( "Should change mode to edit", () => {

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();
					expect( comp.literalCmp.mode ).toEqual( Modes.EDIT );
				} );
			} );

			describe( "When clicking on delete literal", () => {

				it( "Should emit literal when literal already exists", ( done ) => {

					let literal:Literal = {
						"@value": "My value",
						"@language": "en",
					};
					let literalRow:LiteralRow = { copy: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let removeButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Delete Literal']" );
					removeButton.click();
				} );

				it( "Should emit literal with property added when literal is being added", ( done ) => {

					let literal:Literal = {
						"@value": "My value",
						"@language": "en",
					};
					let literalRow:LiteralRow = { copy: undefined, added: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let removeButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Delete Literal']" );
					removeButton.click();
				} );
			} );
		} );

		describe( "On EDIT mode", () => {

			let literal:Literal;
			let literalRow:LiteralRow;

			beforeEach( () => {
				literal = { "@value": "42" };
				literalRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();
			} );

			it( "Should display Confirm & Cancel buttons", () => {

				let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();
				comp.literalCmp.ngAfterViewChecked();

				let cancelButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".buttons .cancel" );
				let confirmButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".buttons .confirm" );
				expect( cancelButton ).toBeDefined();
				expect( confirmButton ).toBeDefined();
			} );

			it( "Should set type to string when @type is not present in literal", () => {

				let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				let type:string = comp.literalCmp.searchDropdown.val();
				expect( type ).toEqual( NS.XSD.DataType.string );
			} );

			it( "Should show `invalid value type` when entering wrong value types", () => {

				let literal:Literal = {
					"@value": 42,
					"@type": NS.XSD.DataType.int,
				};
				let literalRow:LiteralRow = { copy: literal };
				comp.literalRow = literalRow;
				fixture.detectChanges();

				let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();
				comp.literalCmp.ngAfterViewChecked();

				let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
				valueInput.value = "Some text";
				valueInput.dispatchEvent( new Event( "input" ) );
				fixture.detectChanges();

				let errorMessage:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".error.message" );
				expect( errorMessage ).not.toBeNull();
				expect( errorMessage.innerText ).toContain( `Invalid value type, please enter a valid ${NS.XSD.DataType.int}.` );


				valueInput.value = "4";
				valueInput.dispatchEvent( new Event( "input" ) );
				fixture.detectChanges();

				errorMessage = comp.literalCmp.element.nativeElement.querySelector( ".error.message" );
				expect( errorMessage ).toBeNull();
			} );

			it( "Should display dropdown language when @language is present", () => {

				let literal:Literal = {
					"@value": "my value",
					"@type": NS.XSD.DataType.string,
					"@language": "en"
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

				let languageDiv:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( "td.language" );
				expect( languageDiv.style.display ).not.toEqual( "none" );
			} );

			it( "Should not display buttons when canEdit is false", () => {

				comp.literalCmp.canEdit = false;
				fixture.detectChanges();
				comp.literalCmp.ngAfterViewChecked();

				let actionButtons:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".buttons" );
				expect( actionButtons ).toBeNull();
			} );

			describe( "When clicking on cancel", () => {

				it( "Should show original @value", () => {

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
					valueInput.value = "Some text";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();

					let valueLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".value .read-mode p.value" );
					expect( valueLabel.innerText ).toEqual( "42" );
				} );

				it( "Should show original @type", () => {

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

					comp.literalCmp.searchDropdown.dropdown( "set selected", NS.XSD.DataType.decimal );
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();

					let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
					expect( typeLabel.innerText ).toEqual( NS.XSD.DataType.int );
				} );

				it( "Should change mode to read", () => {

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();
					expect( comp.literalCmp.mode === Modes.READ );
				} );

				it( "Should emit literal when cancelled literal is being added", ( done ) => {

					let literal:Literal = {
						"@value": "",
						"@language": "en",
					};
					let literalRow:LiteralRow = { copy: undefined, added: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
				} );
			} );

			describe( "When clicking on save", () => {

				it( "Should emit literal", ( done ) => {

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
					valueInput.value = literalRow.copy[ "@value" ] + "";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.literalCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should emit literal with property added if it's a new literal", ( done ) => {

					let literal:Literal = {
						"@value": "new literal",
						"@language": "en",
					};
					let literalRow:LiteralRow = { copy: undefined, added: literal };
					comp.literalRow = literalRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
					valueInput.value = literalRow.added[ "@value" ] + "";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.literalCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalRow );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should emit literal with property modified if it's been modified", ( done ) => {

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
					valueInput.value = "My changed text";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.literalCmp.onSave.subscribe( ( value:LiteralRow ) => {
						expect( value ).toBeDefined();
						expect( value.copy ).toEqual( literalRow.copy );
						expect( value.modified ).toBeDefined();
						expect( value.modified[ "@value" ] ).toEqual( "My changed text" );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should change mode to read", () => {

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let saveButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
					fixture.detectChanges();
					expect( comp.literalCmp.mode === Modes.READ );
				} );
			} );

		} );

	} );

}