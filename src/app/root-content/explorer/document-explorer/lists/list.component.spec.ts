import { Component, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { ListRow, ListComponent } from "./../lists/list.component";
import { LiteralRow, LiteralComponent } from "./../literals/literal.component";
import { PointerRow, PointerComponent } from "./../pointers/pointer.component";
import { PointerValidator, LiteralValueValidator } from "./../document-explorer-validators";
import { BlankNodeRow } from "app/root-content/explorer/document-explorer/blank-nodes/blank-node.component";
import { NamedFragmentRow } from "app/root-content/explorer/document-explorer/named-fragments/named-fragment.component";

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
			list:ListRow = <ListRow>{};
			pointers:PointerRow[] = [];
			blankNodes:BlankNodeRow[] = [];
			namedFragments:NamedFragmentRow[] = [];

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
			let namedFragments:NamedFragmentRow[] = [
				{
					id: "http://localhost:8083/#Fragment-1",
					name: "http://localhost:8083/#Fragment-1",
					copy: {
						"@id": "http://localhost:8083/#Fragment-1",
					}
				}, {
					id: "http://localhost:8083/#Fragment-2",
					name: "http://localhost:8083/#Fragment-2",
					copy: {
						"@id": "http://localhost:8083/#Fragment-2"
					}
				}, {
					id: "http://localhost:8083/#Fragment-3",
					name: "http://localhost:8083/#Fragment-3",
					copy: {
						"@id": "http://localhost:8083/#Fragment-3",
					}
				}
			];
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

			comp.documentURI = documentURI;
			comp.namedFragments = namedFragments;
			comp.blankNodes = blankNodes;
			comp.listCmp.ngAfterViewInit();
		} );

		it( "Should emit blank node id when clicking on it", ( done ) => {

			comp.list = <ListRow>{
				copy: [
					{
						copy: { "@id": "_:sq23wLWUDsXhst823" },
					},
					{
						copy: { "@value": "my value" },
					},
					{
						copy: { "@id": "http://example-2.com" }
					}
				]
			};
			fixture.detectChanges();

			comp.listCmp.onGoToBlankNode.subscribe( ( id:string ) => {
				expect( id ).toEqual( comp.list.copy[ 0 ].copy[ "@id" ] );
				done();
			} );

			let pointerId:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer .read-mode a" );
			pointerId.click();
		} );

		it( "Should emit named fragment id when clicking on it", ( done ) => {

			comp.list = <ListRow>{
				copy: [
					{
						copy: { "@id": "http://localhost:8083/#Fragment-1" }
					},
					{
						copy: { "@id": "_:sq23wLWUDsXhst823" },
					},
					{
						copy: { "@value": "my value" },
					}
				]
			};
			fixture.detectChanges();

			comp.listCmp.onGoToNamedFragment.subscribe( ( id:string ) => {
				expect( id ).toEqual( comp.list.copy[ 0 ].copy[ "@id" ] );
				done();
			} );

			let pointerId:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer .read-mode a" );
			pointerId.click();
		} );

		it( "Should display Empty list when the list doesn't have any children", () => {

			comp.list = <ListRow>{
				added: [],
				isBeingCreated: true
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( "table .message" );
			expect( content.innerText ).toContain( "Empty table" );
		} );

		it( "Should display New! on top right when list is being added", () => {

			comp.list = <ListRow>{
				added: [],
				isBeingCreated: true
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( ".top.menu .right.menu .item" );
			expect( content.innerText ).toContain( "New!" );
		} );

		it( "Should display Modified! on top right when list is modified", () => {

			let modifiedItem:PointerRow = {
				copy: { "@id": "http://example.com" },
				modified: { "@id": "http://example-modified.com" },
			};
			comp.list = <ListRow>{
				copy: [ modifiedItem ],
				modified: [ modifiedItem ]
			};
			fixture.detectChanges();

			let content:HTMLElement = de.nativeElement.querySelector( ".top.menu .right.menu .item" );
			expect( content.innerText ).toContain( "Modified" );
		} );

		describe( "When clicking on delete list", () => {

			it( "Should display confirmation message", () => {

				comp.list = <ListRow>{
					copy: [
						{
							copy: { "@id": "http://example.com" },
						},
						{
							copy: { "@value": "my value" },
						},
						{
							copy: { "@id": "http://example-2.com" }
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

				comp.list = <ListRow>{
					added: [],
					isBeingCreated: true
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onDeleteList.subscribe( ( list:ListRow ) => {

					expect( list ).toBeDefined();
					expect( list ).toEqual( comp.list );
					done();
				} );

				deleteButton.click();
				let acceptDeleteButton:HTMLElement = de.nativeElement.querySelector( ".button[title='Confirm deletion' ]" );
				acceptDeleteButton.click();
			} );

			it( "Should emit onSave when list is already exists", ( done ) => {

				comp.list = <ListRow>{
					copy: [
						{
							copy: { "@id": "http://example.com" },
						},
						{
							copy: { "@value": "my value" },
						},
						{
							copy: { "@id": "http://example-2.com" }
						}
					]
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onSave.subscribe( ( list:ListRow ) => {
					expect( list ).toBeDefined();
					expect( list ).toEqual( comp.list );
					done();
				} );

				deleteButton.click();
				let acceptDeleteButton:HTMLElement = de.nativeElement.querySelector( ".button[title='Confirm deletion' ]" );
				acceptDeleteButton.click();
			} );

			it( "Should emit onSave when list is already exists", ( done ) => {

				comp.list = <ListRow>{
					copy: [
						{
							copy: { "@id": "http://example.com" },
						},
						{
							copy: { "@value": "my value" },
						},
						{
							copy: { "@id": "http://example-2.com" }
						}
					]
				};
				fixture.detectChanges();

				let deleteButton:HTMLElement = de.nativeElement.querySelector( ".bottom.menu a.item" );
				comp.listCmp.onSave.subscribe( ( list:ListRow ) => {
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

			comp.list = <ListRow>{
				copy: [
					{
						copy: { "@id": "http://example.com" },
					}
				]
			};
			fixture.detectChanges();

			let addLiteralButton:HTMLElement = de.nativeElement.querySelectorAll( ".bottom.menu .right.menu a.item" )[ 0 ];
			addLiteralButton.click();
			fixture.detectChanges();

			let literalRow:HTMLElement = de.nativeElement.querySelector( "tr.cw-literal" );
			expect( literalRow ).not.toBeNull();
			expect( comp.listCmp.tempList.length ).toEqual( 2 );
		} );

		it( "Should add new pointer when clicking on Add New Pointer", () => {

			comp.list = <ListRow>{
				copy: [
					{
						copy: { "@id": "http://example.com" },
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

			comp.list = <ListRow>{
				copy: [
					{
						copy: { "@id": "http://example.com" },
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

			let addedItems:Array<PointerRow | LiteralRow> = comp.listCmp.getAddedItems();
			expect( addedItems.length ).toEqual( 6 );
			expect( addedItems.filter( item => typeof item.added[ "@id" ] !== "undefined" ).length ).toEqual( 3 );
			expect( addedItems.filter( item => typeof item.added[ "@value" ] !== "undefined" ).length ).toEqual( 3 );
		} );

		it( "Should return all deleted items when calling `getDeletedItems`", () => {

			comp.list = <ListRow>{
				copy: [
					{ copy: { "@id": "http://example-1.com" }, },
					{ copy: { "@id": "http://example-2.com" }, deleted: { "@id": "http://example-2.com" } },
					{ copy: { "@id": "http://example-3.com" }, deleted: { "@id": "http://example-3.com" } },
					{ copy: { "@id": "http://example-4.com" }, deleted: { "@id": "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			let deletedItems:Array<PointerRow | LiteralRow> = comp.listCmp.getDeletedItems();
			expect( deletedItems.length ).toEqual( 3 );
		} );

		it( "Should return all modified items when calling `getModifiedItems`", () => {

			comp.list = <ListRow>{
				copy: [
					{ copy: { "@id": "http://example-1.com" }, },
					{ copy: { "@id": "http://example-2.com" }, modified: { "@id": "http://modified-example-2.com" } },
					{ copy: { "@id": "http://example-3.com" }, modified: { "@id": "http://modified-example-3.com" } },
					{ copy: { "@id": "http://example-4.com" }, modified: { "@id": "http://modified-example-4.com" } }
				]
			};
			fixture.detectChanges();

			let modifiedItems:Array<PointerRow | LiteralRow> = comp.listCmp.getModifiedItems();
			expect( modifiedItems.length ).toEqual( 3 );
		} );

		it( "Should return all untouched items when calling `getUntouchedItems`", () => {

			comp.list = <ListRow>{
				copy: [
					{ copy: { "@id": "http://example-1.com" }, },
					{ copy: { "@id": "http://example-2.com" }, modified: { "@id": "http://modified-example-2.com" } },
					{ copy: { "@id": "http://example-3.com" }, modified: { "@id": "http://modified-example-3.com" } },
					{ copy: { "@id": "http://example-4.com" }, modified: { "@id": "http://modified-example-4.com" } }
				]
			};
			fixture.detectChanges();

			let untouchedItems:Array<PointerRow | LiteralRow> = comp.listCmp.getUntouchedItems();
			expect( untouchedItems.length ).toEqual( 1 );
		} );

		it( "Should move items up when item emits onMoveUp", () => {

			comp.list = <ListRow>{
				copy: [
					{ copy: { "@id": "http://example-1.com" }, },
					{ copy: { "@id": "http://example-2.com" }, },
					{ copy: { "@id": "http://example-3.com" }, },
					{ copy: { "@id": "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 2 ].copy[ "@id" ] ).toEqual( "http://example-3.com" );

			comp.listCmp.moveUp( comp.listCmp.tempList[ 3 ], 3 );
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 2 ].copy[ "@id" ] ).toEqual( "http://example-4.com" );
			expect( comp.listCmp.tempList[ 3 ].copy[ "@id" ] ).toEqual( "http://example-3.com" );
		} );

		it( "Should move items down when item emits onMoveDown", () => {

			comp.list = <ListRow>{
				copy: [
					{ copy: { "@id": "http://example-1.com" }, },
					{ copy: { "@id": "http://example-2.com" }, },
					{ copy: { "@id": "http://example-3.com" }, },
					{ copy: { "@id": "http://example-4.com" } }
				]
			};
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 0 ].copy[ "@id" ] ).toEqual( "http://example-1.com" );

			comp.listCmp.moveDown( comp.listCmp.tempList[ 0 ], 0 );
			fixture.detectChanges();

			expect( comp.listCmp.tempList[ 0 ].copy[ "@id" ] ).toEqual( "http://example-2.com" );
			expect( comp.listCmp.tempList[ 1 ].copy[ "@id" ] ).toEqual( "http://example-1.com" );
		} );

	} );

}