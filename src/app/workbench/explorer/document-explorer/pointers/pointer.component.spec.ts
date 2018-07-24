import { Component, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { Modes } from "../property/property.component"
import { Pointer, PointerComponent, PointerStatus } from "./../pointers/pointer.component";
import { PointerValidator } from "../document-explorer-validators";
import { BlankNodeRow } from "./../blank-nodes/blank-node.component";
import { NamedFragmentRow } from "./../named-fragments/named-fragment.component";

export function pointerSpecs() {

	describe( "PointerComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<table>
					<tr class="cw-pointer" 
						[pointer]="pointerRow"
						[blankNodes]="blankNodes" [namedFragments]="namedFragments"
						[partOfList]="partOfList" [documentURI]="documentURI"></tr>
				</table>`
		} )
		class TestComponent {

			pointer:Pointer;
			pointerRow:PointerStatus;

			blankNodes:BlankNodeRow[] = [];
			namedFragments:NamedFragmentRow[] = [];

			documentURI:string = "";
			partOfList:boolean = false;
			@ViewChild( PointerComponent ) pointerCmp:PointerComponent;

		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ PointerComponent, PointerValidator, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
		} );


		describe( "On READ mode", () => {

			let pointer:Pointer;
			let pointerRow:PointerStatus;

			beforeEach( () => {
				pointer = { "@id": "http://www.example.com" };
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				fixture.detectChanges();
			} );

			it( "Should display @id", () => {

				let idLabel:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".id .read-mode p" );
				expect( idLabel.innerText ).toEqual( "http://www.example.com" );
			} );

			it( "Should display Edit & Delete buttons", () => {

				let editButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".button[title='Edit Pointer']" );
				let deleteButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".button[title='Delete Pointer']" );
				expect( editButton ).not.toBeNull();
				expect( deleteButton ).not.toBeNull();
			} );

			it( "Should not display buttons when canEdit is false", () => {

				comp.pointerCmp.canEdit = false;
				fixture.detectChanges();

				let actionButtons:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".buttons" );
				expect( actionButtons ).toBeNull();
			} );

			it( "Should emit id when clicking the id and the id is a BNode", ( done ) => {

				let blankNodes:BlankNodeRow[] = [
					{
						id: "_:sq23wLWUDsXhst823",
						copy: { "@id": "_:sq23wLWUDsXhst823" }
					}, {
						id: "_:a8987w903nfVst5hs",
						copy: { "@id": "_:a8987w903nfVst5hs" }
					}, {
						id: "_:ffd23wsa83Xf8xz82",
						copy: { "@id": "_:ffd23wsa83Xf8xz82" }
					}
				];

				pointer = blankNodes[ 0 ].copy;
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				comp.blankNodes = blankNodes;
				fixture.detectChanges();

				comp.pointerCmp.onGoToBlankNode.subscribe( ( id:string ) => {
					expect( id ).not.toBeNull();
					expect( id ).toEqual( blankNodes[ 0 ].copy[ "@id" ] );
					done();
				} );

				let idLink:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".id .read-mode a" );
				idLink.click();
			} );

			it( "Should emit id when clicking the id and the id is a Named Fragment", ( done ) => {

				let documentURI:string = "http://localhost:8083/";
				let namedFragments:NamedFragmentRow[] = [
					{
						id: "http://localhost:8083/#New-Fragment-Name-1",
						name: "http://localhost:8083/#New-Fragment-Name-1",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-1",
						}
					}, {
						id: "http://localhost:8083/#New-Fragment-Name-2",
						name: "http://localhost:8083/#New-Fragment-Name-2",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-2"
						}
					}, {
						id: "http://localhost:8083/#New-Fragment-Name-3",
						name: "http://localhost:8083/#New-Fragment-Name-3",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-3",
						}
					}
				];

				pointer = namedFragments[ 0 ].copy;
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				comp.documentURI = documentURI;
				comp.namedFragments = namedFragments;
				fixture.detectChanges();

				comp.pointerCmp.onGoToNamedFragment.subscribe( ( id:string ) => {
					expect( id ).not.toBeNull();
					expect( id ).toEqual( namedFragments[ 0 ].copy[ "@id" ] );
					done();
				} );

				let idLink:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".id .read-mode a" );
				idLink.click();
			} );

			describe( "When being part of a list", () => {

				beforeEach( () => {

					comp.partOfList = true;
					fixture.detectChanges();
				} );

				it( "Should display Up and Down buttons", () => {

					let upButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".updown.buttons .button .up.chevron" );
					let downButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".updown.buttons .button .down.chevron" );
					expect( upButton ).not.toBeNull();
					expect( downButton ).not.toBeNull();
				} );

				it( "Should emit pointer when clicking moveUp button", ( done ) => {

					pointer = { "@id": "http://www.example.com" };
					pointerRow = { copy: pointer };
					comp.pointerRow = pointerRow;
					fixture.detectChanges();

					comp.pointerCmp.onMoveUp.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let upButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".updown.buttons .button .up.chevron" );
					upButton.click();
				} );

				it( "Should emit pointer when clicking moveDown button", ( done ) => {

					pointer = { "@id": "http://www.example.com" };
					pointerRow = { copy: pointer };
					comp.pointerRow = pointerRow;
					fixture.detectChanges();

					comp.pointerCmp.onMoveDown.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let downButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".updown.buttons .button .down.chevron" );
					downButton.click();
				} );
			} );

			describe( "When clicking on edit pointer", () => {

				it( "Should change mode to edit", () => {

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();
					expect( comp.pointerCmp.mode ).toEqual( Modes.EDIT );
				} );
			} );

			describe( "When clicking on delete pointer", () => {

				it( "Should emit pointer when pointer already exists", ( done ) => {

					let pointer:Pointer = { "@id": "http://www.example.com" };
					let pointerRow:PointerStatus = { copy: pointer };
					comp.pointerRow = pointerRow;
					fixture.detectChanges();

					comp.pointerCmp.onDeletePointer.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let removeButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".button[title='Delete Pointer']" );
					removeButton.click();
				} );

				it( "Should emit pointer with property added when pointer is being added", ( done ) => {

					let pointer:Pointer = { "@id": "http://www.example.com" };
					let pointerRow:PointerStatus = { copy: undefined, added: pointer };
					comp.pointerRow = pointerRow;
					fixture.detectChanges();

					comp.pointerCmp.onDeletePointer.subscribe( ( value:PointerStatus ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						expect( value.added ).toBeDefined();
						done();
					} );
					let removeButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".button[title='Delete Pointer']" );
					removeButton.click();
				} );
			} );

		} );


		describe( "On EDIT mode", () => {

			let pointer:Pointer;
			let pointerRow:PointerStatus;

			beforeEach( () => {
				pointer = { "@id": "http://www.example.com" };
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				fixture.detectChanges();
			} );

			it( "Should display Confirm & Cancel buttons", () => {

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				let cancelButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".buttons button[title='Cancel']" );
				let confirmButton:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".buttons button[title='Save']" );
				expect( cancelButton ).not.toBeNull();
				expect( confirmButton ).not.toBeNull();
			} );

			it( "Should display fragments dropdown with the pointer @id as the value", () => {

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				let pointersDropdown:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit-mode .fragments.dropdown" );
				expect( pointersDropdown.innerText ).toEqual( "http://www.example.com" )
			} );

			it( "Should display blankNodes in the dropdown when they are passed as Input", () => {

				let blankNodes:BlankNodeRow[] = [
					{
						id: "_:sq23wLWUDsXhst823",
						copy: { "@id": "_:sq23wLWUDsXhst823" }
					}, {
						id: "_:a8987w903nfVst5hs",
						copy: { "@id": "_:a8987w903nfVst5hs" }
					}, {
						id: "_:ffd23wsa83Xf8xz82",
						copy: { "@id": "_:ffd23wsa83Xf8xz82" }
					}
				];

				pointer = blankNodes[ 0 ].copy;
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				comp.blankNodes = blankNodes;
				fixture.detectChanges();

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();


				let items:HTMLElement[] = comp.pointerCmp.element.nativeElement.querySelectorAll( ".fragments.dropdown optgroup[label='blankNodes'] .item" );
				expect( items[ 0 ].innerText ).toContain( blankNodes[ 0 ].id );
				expect( items[ 1 ].innerText ).toContain( blankNodes[ 1 ].id );
				expect( items[ 2 ].innerText ).toContain( blankNodes[ 2 ].id );
			} );

			it( "Should display fragments in the dropdown when they are passed as Input", () => {

				let documentURI:string = "http://localhost:8083/";
				let namedFragments:NamedFragmentRow[] = [
					{
						id: "http://localhost:8083/#New-Fragment-Name-1",
						name: "http://localhost:8083/#New-Fragment-Name-1",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-1",
						}
					}, {
						id: "http://localhost:8083/#New-Fragment-Name-2",
						name: "http://localhost:8083/#New-Fragment-Name-2",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-2"
						}
					}, {
						id: "http://localhost:8083/#New-Fragment-Name-3",
						name: "http://localhost:8083/#New-Fragment-Name-3",
						copy: {
							"@id": "http://localhost:8083/#New-Fragment-Name-3",
						}
					}
				];

				pointer = namedFragments[ 0 ].copy;
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				comp.documentURI = documentURI;
				comp.namedFragments = namedFragments;
				fixture.detectChanges();

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				let items:HTMLElement[] = comp.pointerCmp.element.nativeElement.querySelectorAll( ".fragments.dropdown optgroup[label='Named Fragments'] .item" );
				expect( items[ 0 ].innerText ).toContain( namedFragments[ 0 ].id );
				expect( items[ 1 ].innerText ).toContain( namedFragments[ 1 ].id );
				expect( items[ 2 ].innerText ).toContain( namedFragments[ 2 ].id );
			} );

			it( "Should display `Enter a valid @id value` when entering wrong IRI's", () => {

				pointer = { "@id": "http://www.exa mple.com" };
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				fixture.detectChanges();

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				let errorMessage:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit-mode .error.message" );
				expect( errorMessage.innerText ).toContain( "Enter a valid @id value" );
			} );

			it( "Should set @id when selecting one fragment from the dropdown", () => {

				let blankNodes:BlankNodeRow[] = [
					{
						id: "_:sq23wLWUDsXhst823",
						copy: { "@id": "_:sq23wLWUDsXhst823" }
					}, {
						id: "_:a8987w903nfVst5hs",
						copy: { "@id": "_:a8987w903nfVst5hs" }
					}, {
						id: "_:ffd23wsa83Xf8xz82",
						copy: { "@id": "_:ffd23wsa83Xf8xz82" }
					}
				];
				pointer = blankNodes[ 0 ].copy;
				pointerRow = { copy: pointer };
				comp.pointerRow = pointerRow;
				comp.blankNodes = blankNodes;
				fixture.detectChanges();

				let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
				editButton.click();
				fixture.detectChanges();

				comp.pointerCmp.pointersDropdown.dropdown().find( `[data-value='${blankNodes[ 1 ].id}']` ).trigger( "click" );
				fixture.detectChanges();

				expect( comp.pointerCmp.id ).toEqual( blankNodes[ 1 ].id );
			} );

			it( "Should not display buttons when canEdit is false", () => {

				comp.pointerCmp.canEdit = false;
				fixture.detectChanges();

				let actionButtons:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".buttons" );
				expect( actionButtons ).toBeNull();
			} );

			describe( "When clicking on cancel", () => {

				it( "Should show original @id", () => {

					let blankNodes:BlankNodeRow[] = [
						{
							id: "_:sq23wLWUDsXhst823",
							copy: { "@id": "_:sq23wLWUDsXhst823" }
						}, {
							id: "_:a8987w903nfVst5hs",
							copy: { "@id": "_:a8987w903nfVst5hs" }
						}, {
							id: "_:ffd23wsa83Xf8xz82",
							copy: { "@id": "_:ffd23wsa83Xf8xz82" }
						}
					];
					let pointer:Pointer = blankNodes[ 0 ].copy; // Here we set the original value
					let pointerRow:PointerStatus = { copy: pointer };
					comp.pointerRow = pointerRow;
					comp.blankNodes = blankNodes;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					// We change the @id
					comp.pointerCmp.pointersDropdown.dropdown().find( `[data-value='${blankNodes[ 2 ].id}']` ).trigger( "click" );
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();

					let idLabel:HTMLElement = comp.pointerCmp.element.nativeElement.querySelector( ".read-mode" );
					expect( idLabel.innerText.trim() ).toEqual( blankNodes[ 0 ].id ); // We expect the cancelled value is the original blankNode
				} );

				it( "Should change mode to read", () => {

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let cancelButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
					fixture.detectChanges();
					expect( comp.pointerCmp.mode === Modes.READ );
				} );

				it( "Should emit pointer when cancelled pointer is being added", ( done ) => {

					let blankNodes:BlankNodeRow[] = [
						{
							id: "_:sq23wLWUDsXhst823",
							copy: { "@id": "_:sq23wLWUDsXhst823" }
						}, {
							id: "_:a8987w903nfVst5hs",
							copy: { "@id": "_:a8987w903nfVst5hs" }
						}, {
							id: "_:ffd23wsa83Xf8xz82",
							copy: { "@id": "_:ffd23wsa83Xf8xz82" }
						}
					];
					let pointer:Pointer = { "@id": "" };
					let pointerRow:PointerStatus = { copy: undefined, added: pointer };
					comp.pointerRow = pointerRow;
					comp.blankNodes = blankNodes;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					comp.pointerCmp.pointersDropdown.dropdown().find( `[data-value='${blankNodes[ 2 ].id}']` ).trigger( "click" );
					fixture.detectChanges();

					comp.pointerCmp.onDeletePointer.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let cancelButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Cancel']" );
					cancelButton.click();
				} );
			} );

			describe( "When clicking on save", () => {

				let blankNodes:BlankNodeRow[];
				let pointer:Pointer;
				let pointerRow:PointerStatus;

				beforeEach( () => {
					blankNodes = [
						{
							id: "_:sq23wLWUDsXhst823",
							copy: { "@id": "_:sq23wLWUDsXhst823" }
						}, {
							id: "_:a8987w903nfVst5hs",
							copy: { "@id": "_:a8987w903nfVst5hs" }
						}, {
							id: "_:ffd23wsa83Xf8xz82",
							copy: { "@id": "_:ffd23wsa83Xf8xz82" }
						}
					];
					pointer = blankNodes[ 0 ].copy;
					pointerRow = { copy: pointer };
					comp.pointerRow = pointerRow;
					comp.blankNodes = blankNodes;
					fixture.detectChanges();
				} );

				it( "Should emit pointer", ( done ) => {

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					comp.pointerCmp.pointersDropdown.dropdown().find( `[data-value='${blankNodes[ 2 ].id}']` ).trigger( "click" );
					fixture.detectChanges();
					let idInput:HTMLInputElement = comp.pointerCmp.element.nativeElement.querySelector( "input[name='idInput']" );
					idInput.value = blankNodes[ 0 ].id;
					idInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.pointerCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should emit pointer with property added if it's a new pointer", ( done ) => {

					let pointer:Pointer = { "@id": "http://example.com" };
					let pointerRow:PointerStatus = { copy: undefined, added: pointer };
					comp.pointerRow = pointerRow;
					fixture.detectChanges();

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let valueInput:HTMLInputElement = comp.pointerCmp.element.nativeElement.querySelector( "input[name='idInput']" );
					valueInput.value = pointerRow.added[ "@id" ] + "";
					valueInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.pointerCmp.onSave.subscribe( ( value ) => {
						expect( value ).toBeDefined();
						expect( value.added ).toBeDefined();
						expect( value ).toEqual( pointerRow );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should emit pointer with property modified if it's been modified", ( done ) => {

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					comp.pointerCmp.pointersDropdown.dropdown().find( `[data-value='${blankNodes[ 2 ].id}']` ).trigger( "click" );
					fixture.detectChanges();
					let idInput:HTMLInputElement = comp.pointerCmp.element.nativeElement.querySelector( "input[name='idInput']" );
					idInput.value = blankNodes[ 2 ].id;
					idInput.dispatchEvent( new Event( "input" ) );
					fixture.detectChanges();

					comp.pointerCmp.onSave.subscribe( ( value:PointerStatus ) => {
						expect( value ).toBeDefined();
						expect( value.copy ).toEqual( pointerRow.copy );
						expect( value.modified ).toBeDefined();
						expect( value.modified[ "@id" ] ).toEqual( blankNodes[ 2 ].copy[ "@id" ] );
						done();
					} );
					let saveButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
				} );

				it( "Should change mode to read", () => {

					let editButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( ".edit.button" );
					editButton.click();
					fixture.detectChanges();

					let saveButton:HTMLButtonElement = comp.pointerCmp.element.nativeElement.querySelector( "button[title='Save']" );
					saveButton.click();
					fixture.detectChanges();
					expect( comp.pointerCmp.mode === Modes.READ );
				} );
			} );
		} );

	} );

}