import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { ListComponent, ListStatus } from "./../lists/list.component";
import { LiteralComponent, LiteralStatus } from "./../literals/literal.component";
import { PointerComponent, PointerStatus } from "./../pointers/pointer.component";
import { BlankNodeStatus } from "../blank-nodes/blank-node.component";
import { NamedFragmentStatus } from "../named-fragments/named-fragment.component";
import { LiteralValueValidator, PointerValidator } from "./../document-explorer-validators";
import { JsonLDKeyword } from "../document-explorer-library";

export function listSpecs() {

	describe( "ListComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<cw-list [documentURI]="documentURI"
								[list]="list"
								[pointers]="pointers"
								[blankNodes]="blankNodes"
								[namedFragments]="namedFragments"></cw-list>`
		} )
		class TestComponent {

			documentURI:string = "";
			list:ListStatus = <ListStatus>{};
			pointers:PointerStatus[] = [];
			blankNodes:BlankNodeStatus[] = [];
			namedFragments:NamedFragmentStatus[] = [];

			@ViewChild( ListComponent ) listCmp:ListComponent;
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ ListComponent, TestComponent,
					LiteralComponent, LiteralValueValidator,
					PointerComponent, PointerValidator ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
		} );

		beforeEach( () => {

			let documentURI:string = "http://localhost:8083/";
			let namedFragments:NamedFragmentStatus[] = [
				{
					id: "http://localhost:8083/#Fragment-1",
					name: "http://localhost:8083/#Fragment-1",
					copy: {
						[ JsonLDKeyword.ID ]: "http://localhost:8083/#Fragment-1",
					}
				}, {
					id: "http://localhost:8083/#Fragment-2",
					name: "http://localhost:8083/#Fragment-2",
					copy: {
						[ JsonLDKeyword.ID ]: "http://localhost:8083/#Fragment-2"
					}
				}, {
					id: "http://localhost:8083/#Fragment-3",
					name: "http://localhost:8083/#Fragment-3",
					copy: {
						[ JsonLDKeyword.ID ]: "http://localhost:8083/#Fragment-3",
					}
				}
			];
			let blankNodes:BlankNodeStatus[] = [
				{
					id: "_:sq23wLWUDsXhst823",
					copy: { [ JsonLDKeyword.ID ]: "_:sq23wLWUDsXhst823" }
				}, {
					id: "_:a8987w903nfVst5hs",
					copy: { [ JsonLDKeyword.ID ]: "_:a8987w903nfVst5hs" }
				}, {
					id: "_:ffd23wsa83Xf8xz82",
					copy: { [ JsonLDKeyword.ID ]: "_:ffd23wsa83Xf8xz82" }
				}
			];

			comp.documentURI = documentURI;
			comp.namedFragments = namedFragments;
			comp.blankNodes = blankNodes;
			comp.listCmp.ngAfterViewInit();
		} );

		it( "Should emit blank node id when clicking on it", ( done ) => {

			comp.list = <ListStatus>{
				copy: [
					{
						copy: { [ JsonLDKeyword.ID ]: "_:sq23wLWUDsXhst823" },
					},
					{
						copy: { [ JsonLDKeyword.VALUE ]: "my value" },
					},
					{
						copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }
					}
				]
			};
			fixture.detectChanges();

			comp.listCmp.onGoToBlankNode.subscribe( ( id:string ) => {
				expect( id ).toEqual( comp.list.copy[ 0 ].copy[ JsonLDKeyword.ID ] );
				done();
			} );

			let pointerId:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer .read-mode a" );
			pointerId.click();
		} );

		it( "Should emit named fragment id when clicking on it", ( done ) => {

			comp.list = <ListStatus>{
				copy: [
					{
						copy: { [ JsonLDKeyword.ID ]: "http://localhost:8083/#Fragment-1" }
					},
					{
						copy: { [ JsonLDKeyword.ID ]: "_:sq23wLWUDsXhst823" },
					},
					{
						copy: { [ JsonLDKeyword.VALUE ]: "my value" },
					}
				]
			};
			fixture.detectChanges();

			comp.listCmp.onGoToNamedFragment.subscribe( ( id:string ) => {
				expect( id ).toEqual( comp.list.copy[ 0 ].copy[ JsonLDKeyword.ID ] );
				done();
			} );

			let pointerId:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer .read-mode a" );
			pointerId.click();
		} );

		it( "Should display Empty list when the list doesn't have any children", () => {

			comp.list = <ListStatus>{
				added: [],
				isBeingCreated: true
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( "table .message" );
			expect( content.innerText ).toContain( "Empty table" );
		} );

		it( "Should display New! on top right when list is being added", () => {

			comp.list = <ListStatus>{
				added: [],
				isBeingCreated: true
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( ".top.menu .right.menu .item" );
			expect( content.innerText ).toContain( "New!" );
		} );

		it( "Should display Modified! on top right when list is modified", () => {

			let modifiedItem:PointerStatus = {
				copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
				modified: { [ JsonLDKeyword.ID ]: "http://example-modified.com" },
			};
			comp.list = <ListStatus>{
				copy: [ modifiedItem ],
				modified: [ modifiedItem ]
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( ".top.menu .right.menu .item" );
			expect( content.innerText ).toContain( "Modified" );
		} );

		describe( "When clicking on delete list", () => {

			it( "Should display confirmation message", () => {

				comp.list = <ListStatus>{
					copy: [
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
						},
						{
							copy: { [ JsonLDKeyword.VALUE ]: "my value" },
						},
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }
						}
					]
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				deleteButton.click();

				let confirmMessage:HTMLElement = de.nativeElement.querySelector( ".confirm-deletion.dimmer" );

				expect( confirmMessage ).not.toBeNull();
				expect( confirmMessage.innerText ).toContain( "Are you sure?" );
			} );

			it( "Should emit onDeleteList when list is being added", ( done ) => {

				comp.list = <ListStatus>{
					added: [],
					isBeingCreated: true
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onDeleteList.subscribe( ( list:ListStatus ) => {

					expect( list ).toBeDefined();
					expect( list ).toEqual( comp.list );
					done();
				} );

				deleteButton.click();
				let acceptDeleteButton:HTMLElement = de.nativeElement.querySelector( ".button[title='Confirm deletion' ]" );
				acceptDeleteButton.click();
			} );

			it( "Should emit onSave when list is already exists", ( done ) => {

				comp.list = <ListStatus>{
					copy: [
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
						},
						{
							copy: { [ JsonLDKeyword.VALUE ]: "my value" },
						},
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }
						}
					]
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onSave.subscribe( ( list:ListStatus ) => {
					expect( list ).toBeDefined();
					expect( list ).toEqual( comp.list );
					done();
				} );

				deleteButton.click();
				let acceptDeleteButton:HTMLElement = de.nativeElement.querySelector( ".button[title='Confirm deletion' ]" );
				acceptDeleteButton.click();
			} );

			it( "Should emit onSave when list is already exists", ( done ) => {

				comp.list = <ListStatus>{
					copy: [
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
						},
						{
							copy: { [ JsonLDKeyword.VALUE ]: "my value" },
						},
						{
							copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }
						}
					]
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onSave.subscribe( ( list:ListStatus ) => {
					expect( list ).toBeDefined();
					expect( list ).toEqual( comp.list );
					expect( list.deleted ).toBeDefined();
					expect( list.deleted ).toEqual( comp.list.copy );
					done();
				} );

				deleteButton.click();
				let acceptDeleteButton:HTMLElement = de.nativeElement.querySelector( ".button[title='Confirm deletion' ]" );
				acceptDeleteButton.click();
			} );
		} );

		it( "Should add new literal when clicking on Add New Literal", () => {

			comp.list = <ListStatus>{
				copy: [
					{
						copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
					}
				]
			};
			fixture.detectChanges();

			let addLiteralButton:HTMLElement = de.nativeElement.querySelectorAll( ".bottom.menu .right.menu a.item" )[ 0 ];
			addLiteralButton.click();
			fixture.detectChanges();

			let literalStatus:HTMLElement = de.nativeElement.querySelector( "tr.cw-literal" );
			expect( literalStatus ).not.toBeNull();
			expect( comp.listCmp.tempList.length ).toEqual( 2 );
		} );

		it( "Should add new pointer when clicking on Add New Pointer", () => {

			comp.list = <ListStatus>{
				copy: [
					{
						copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
					}
				]
			};
			fixture.detectChanges();

			let addPointerButton:HTMLElement = de.nativeElement.querySelectorAll( ".bottom.menu .right.menu a.item" )[ 1 ];
			addPointerButton.click();
			fixture.detectChanges();

			let pointerRow:HTMLElement = de.nativeElement.querySelectorAll( "tr.cw-pointer" )[ 0 ];
			expect( pointerRow ).not.toBeNull();
			expect( comp.listCmp.tempList.length ).toEqual( 2 );
		} );

		it( "Should return all added items when calling `getAddedItems`", () => {

			comp.list = <ListStatus>{
				copy: [
					{
						copy: { [ JsonLDKeyword.ID ]: "http://example.com" },
					}
				]
			};
			fixture.detectChanges();

			let addLiteralButton:HTMLElement = de.nativeElement.querySelectorAll( ".bottom.menu .right.menu a.item" )[ 0 ];
			let addPointerButton:HTMLElement = de.nativeElement.querySelectorAll( ".bottom.menu .right.menu a.item" )[ 1 ];
			addLiteralButton.click();
			addPointerButton.click();
			addLiteralButton.click();
			addPointerButton.click();
			addLiteralButton.click();
			addPointerButton.click();
			fixture.detectChanges();

			let addedItems:Array<PointerStatus | LiteralStatus> = comp.listCmp.getAddedItems();
			expect( addedItems.length ).toEqual( 6 );
			expect( addedItems.filter( item => typeof item.added[ JsonLDKeyword.ID ] !== "undefined" ).length ).toEqual( 3 );
			expect( addedItems.filter( item => typeof item.added[ JsonLDKeyword.VALUE ] !== "undefined" ).length ).toEqual( 3 );
		} );

		it( "Should return all deleted items when calling `getDeletedItems`", () => {

			comp.list = <ListStatus>{
				copy: [
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-1.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }, deleted: { [ JsonLDKeyword.ID ]: "http://example-2.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-3.com" }, deleted: { [ JsonLDKeyword.ID ]: "http://example-3.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-4.com" }, deleted: { [ JsonLDKeyword.ID ]: "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			let deletedItems:Array<PointerStatus | LiteralStatus> = comp.listCmp.getDeletedItems();
			expect( deletedItems.length ).toEqual( 3 );
		} );

		it( "Should return all modified items when calling `getModifiedItems`", () => {

			comp.list = <ListStatus>{
				copy: [
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-1.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-2.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-3.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-3.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-4.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-4.com" } }
				]
			};
			fixture.detectChanges();

			let modifiedItems:Array<PointerStatus | LiteralStatus> = comp.listCmp.getModifiedItems();
			expect( modifiedItems.length ).toEqual( 3 );
		} );

		it( "Should return all untouched items when calling `getUntouchedItems`", () => {

			comp.list = <ListStatus>{
				copy: [
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-1.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-2.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-3.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-3.com" } },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-4.com" }, modified: { [ JsonLDKeyword.ID ]: "http://modified-example-4.com" } }
				]
			};
			fixture.detectChanges();

			let untouchedItems:Array<PointerStatus | LiteralStatus> = comp.listCmp.getUntouchedItems();
			expect( untouchedItems.length ).toEqual( 1 );
		} );

		it( "Should move items up when item emits onMoveUp", () => {

			comp.list = <ListStatus>{
				copy: [
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-1.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-3.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 2 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-3.com" );

			comp.listCmp.moveUp( comp.listCmp.tempList[ 3 ], 3 );
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 2 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-4.com" );
			expect( comp.listCmp.tempList[ 3 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-3.com" );
		} );

		it( "Should move items down when item emits onMoveDown", () => {

			comp.list = <ListStatus>{
				copy: [
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-1.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-2.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-3.com" }, },
					{ copy: { [ JsonLDKeyword.ID ]: "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 0 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-1.com" );

			comp.listCmp.moveDown( comp.listCmp.tempList[ 0 ], 0 );
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 0 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-2.com" );
			expect( comp.listCmp.tempList[ 1 ].copy[ JsonLDKeyword.ID ] ).toEqual( "http://example-1.com" );
		} );

	} );

}