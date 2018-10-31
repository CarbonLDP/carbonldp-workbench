import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { XSD } from "carbonldp/Vocabularies";

import { JsonLDKeyword, Modes } from "../document-explorer-library"
import { Literal, LiteralComponent, LiteralStatus } from "./literal.component";
import { LiteralValueValidator } from "../document-explorer-validators";

export function literalSpecs() {

	describe( "LiteralComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<table>
					<tr class="app-literal" [literal]="literalStatus" [partOfList]="partOfList"></tr>
				</table>`
		} )
		class TestComponent {

			literal:Literal;
			literalStatus:LiteralStatus;
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
			let literalStatus:LiteralStatus;

			beforeEach( () => {
				literal = { [ JsonLDKeyword.VALUE ]: "My value" };
				literalStatus = { copy: literal };
				comp.literalStatus = literalStatus;
				fixture.detectChanges();
			} );

			it( "Should display @value", () => {

				let valueLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".value .read-mode p.value" );
				expect( valueLabel.innerText ).toEqual( "My value" );
			} );

			it( "Should display @type", () => {

				let literal:Literal = { [ JsonLDKeyword.VALUE ]: 42, [ JsonLDKeyword.TYPE ]: XSD.int };
				let literalStatus:LiteralStatus = { copy: literal };
				comp.literalStatus = literalStatus;
				fixture.detectChanges();

				let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
				expect( typeLabel.innerText ).toEqual( XSD.int );
			} );

			it( "Should display @type as string if not present", () => {

				let literal:Literal = { [ JsonLDKeyword.VALUE ]: 42 };
				let literalStatus:LiteralStatus = { copy: literal };
				comp.literalStatus = literalStatus;
				fixture.detectChanges();

				let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
				expect( typeLabel.innerText ).toEqual( XSD.string );
			} );

			it( "Should display @language if present", () => {

				let literal:Literal = {
					[ JsonLDKeyword.VALUE ]: "My value",
					[ JsonLDKeyword.LANGUAGE ]: "en",
				};
				let literalStatus:LiteralStatus = { copy: literal };
				comp.literalStatus = literalStatus;
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

					literal = { [ JsonLDKeyword.VALUE ]: "My value" };
					literalStatus = { copy: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					comp.literalCmp.onMoveUp.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
						done();
					} );
					let upButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".updown.buttons .button .up.chevron" );
					upButton.click();
				} );

				it( "Should emit literal when clicking moveDown button", ( done ) => {

					literal = { [ JsonLDKeyword.VALUE ]: "My value" };
					literalStatus = { copy: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					comp.literalCmp.onMoveDown.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
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
						[ JsonLDKeyword.VALUE ]: "My value",
						[ JsonLDKeyword.LANGUAGE ]: "en",
					};
					let literalStatus:LiteralStatus = { copy: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
						done();
					} );
					let removeButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Delete Literal']" );
					removeButton.click();
				} );

				it( "Should emit literal with property added when literal is being added", ( done ) => {

					let literal:Literal = {
						[ JsonLDKeyword.VALUE ]: "My value",
						[ JsonLDKeyword.LANGUAGE ]: "en",
					};
					let literalStatus:LiteralStatus = { copy: undefined, added: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
						done();
					} );
					let removeButton:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".button[title='Delete Literal']" );
					removeButton.click();
				} );
			} );
		} );

		describe( "On EDIT mode", () => {

			let literal:Literal;
			let literalStatus:LiteralStatus;

			beforeEach( () => {
				literal = { [ JsonLDKeyword.VALUE ]: "42" };
				literalStatus = { copy: literal };
				comp.literalStatus = literalStatus;
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

				let type:string | number | string[] = comp.literalCmp.typesDropdown.val();
				expect( type ).toEqual( XSD.string );
			} );

			it( "Should show `invalid value type` when entering wrong value types", () => {

				let literal:Literal = {
					[ JsonLDKeyword.VALUE ]: 42,
					[ JsonLDKeyword.TYPE ]: XSD.int,
				};
				let literalStatus:LiteralStatus = { copy: literal };
				comp.literalStatus = literalStatus;
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
				expect( errorMessage.innerText ).toContain( `Invalid value type, please enter a valid ${XSD.int}.` );


				valueInput.value = "4";
				valueInput.dispatchEvent( new Event( "input" ) );
				fixture.detectChanges();

				errorMessage = comp.literalCmp.element.nativeElement.querySelector( ".error.message" );
				expect( errorMessage ).toBeNull();
			} );

			it( "Should display dropdown language when @language is present", () => {

				let literal:Literal = {
					[ JsonLDKeyword.VALUE ]: "my value",
					[ JsonLDKeyword.TYPE ]: XSD.string,
					[ JsonLDKeyword.LANGUAGE ]: "en"
				};
				let literalStatus:LiteralStatus = {
					copy: literal
				};
				comp.literalStatus = literalStatus;
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
						[ JsonLDKeyword.VALUE ]: 42,
						[ JsonLDKeyword.TYPE ]: XSD.int,
					};
					let literalStatus:LiteralStatus = {
						copy: literal
					};
					comp.literalStatus = literalStatus;
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
						[ JsonLDKeyword.VALUE ]: 42,
						[ JsonLDKeyword.TYPE ]: XSD.int,
					};
					let literalStatus:LiteralStatus = {
						copy: literal
					};
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();
					comp.literalCmp.ngAfterViewChecked();

					comp.literalCmp.typesDropdown.dropdown( "set selected", XSD.decimal );
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();

					let typeLabel:HTMLElement = comp.literalCmp.element.nativeElement.querySelector( ".type .read-mode p.value" );
					expect( typeLabel.innerText ).toEqual( XSD.int );
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
						[ JsonLDKeyword.VALUE ]: "",
						[ JsonLDKeyword.LANGUAGE ]: "en",
					};
					let literalStatus:LiteralStatus = { copy: undefined, added: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					comp.literalCmp.onDeleteLiteral.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
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
					valueInput.value = literalStatus.copy[ JsonLDKeyword.VALUE ] + "";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.literalCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should emit literal with property added if it's a new literal", ( done ) => {

					let literal:Literal = {
						[ JsonLDKeyword.VALUE ]: "new literal",
						[ JsonLDKeyword.LANGUAGE ]: "en",
					};
					let literalStatus:LiteralStatus = { copy: undefined, added: literal };
					comp.literalStatus = literalStatus;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.literalCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let valueInput:HTMLInputElement = comp.literalCmp.element.nativeElement.querySelector( "input[name='valueInput']" );
					valueInput.value = literalStatus.added[ JsonLDKeyword.VALUE ] + "";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.literalCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( literalStatus );
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

					comp.literalCmp.onSave.subscribe( ( value:LiteralStatus ) => {
						expect( value ).toBeDefined();
						expect( value.copy ).toEqual( literalStatus.copy );
						expect( value.modified ).toBeDefined();
						expect( value.modified[ JsonLDKeyword.VALUE ] ).toEqual( "My changed text" );
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
