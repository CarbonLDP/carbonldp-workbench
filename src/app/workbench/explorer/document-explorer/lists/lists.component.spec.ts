import { Component, EventEmitter, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { ListsComponent } from "./../lists/lists.component";
import { ListRow, ListComponent } from "./../lists/list.component";
import { LiteralStatus, LiteralComponent } from "./../literals/literal.component";
import { PointerStatus, PointerComponent } from "./../pointers/pointer.component";
import { PointerValidator, LiteralValueValidator } from "./../document-explorer-validators";
import { BlankNodeRow } from "app/workbench/explorer/document-explorer/blank-nodes/blank-node.component";
import { NamedFragmentStatus } from "app/workbench/explorer/document-explorer/named-fragments/named-fragment.component";

export function listsSpecs() {

	describe( "ListsComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<cw-lists [documentURI]="documentURI"
								 [lists]="lists"
								 [blankNodes]="blankNodes"
								 [namedFragments]="namedFragments"></cw-lists>`
		} )
		class TestComponent {

			documentURI:string = "";
			lists:ListRow[] = [];
			blankNodes:BlankNodeRow[] = [];
			namedFragments:NamedFragmentStatus[] = [];

			@ViewChild( ListsComponent ) listsCmp:ListsComponent;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [
					TestComponent,
					ListsComponent, ListComponent,
					PointerComponent, PointerValidator,
					LiteralComponent, LiteralValueValidator
				],
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
			let lists:ListRow[] = [
				{
					copy: [
						blankNodes[ 0 ],
						namedFragments[ 0 ],
						blankNodes[ 1 ],
						namedFragments[ 1 ],
					]
				}
			];

			comp.documentURI = documentURI;
			comp.namedFragments = namedFragments;
			comp.blankNodes = blankNodes;
			comp.lists = lists;
			fixture.detectChanges();
		} );

		fit( "Should emit blank node id when a list emits it", ( done ) => {
			comp.listsCmp.onGoToBlankNode.subscribe( ( blankNodeId:string ) => {
				expect( blankNodeId ).toEqual( comp.lists[ 0 ].copy[ 0 ].copy[ "@id" ] );
				done()
			} );

			let blankNode:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer .read-mode a" );
			blankNode.click();
		} );

		fit( "Should emit named fragment id when a list emits it", ( done ) => {
			comp.listsCmp.onGoToNamedFragment.subscribe( ( namedFragmentId:string ) => {
				expect( namedFragmentId ).toEqual( comp.lists[ 0 ].copy[ 1 ].copy[ "@id" ] );
				done()
			} );

			let namedFragment:HTMLElement = de.nativeElement.querySelectorAll( "tr.cw-pointer .read-mode a" )[ 1 ];
			namedFragment.click();
		} );

		describe( "When clicking on delete list", () => {

			fit( "Should emit lists with new list with property `deleted`", ( done ) => {

				comp.listsCmp.onListsChanges.subscribe( ( lists:ListRow[] ) => {
					let deletedList:ListRow = lists[ 0 ];
					expect( deletedList ).toBeDefined();
					expect( deletedList.deleted ).toBeDefined();
					expect( deletedList.deleted ).toEqual( deletedList.copy );
					done();
				} );

				let deleteButton:HTMLButtonElement = de.nativeElement.querySelector( "cw-list .bottom.menu .item" );
				deleteButton.click();
				let confirmButton:HTMLButtonElement = de.nativeElement.querySelector( "cw-list .confirm-deletion .red.button" );
				confirmButton.click();
			} );
		} );

		describe( "When clicking on creating a new list", () => {

			fit( "Should add a new empty list", () => {
				let lists:HTMLElement[] = fixture.nativeElement.querySelectorAll( "cw-list" );
				expect( lists.length ).toEqual( 1 );
				comp.listsCmp.onAddNewList.emit( true );
				fixture.detectChanges();
				lists = fixture.nativeElement.querySelectorAll( "cw-list" );
				expect( lists.length ).toEqual( 2 );
			} );

			fit( "Should emit lists with empty list with property `added`", ( done ) => {

				comp.listsCmp.onListsChanges.subscribe( ( lists:ListRow[] ) => {
					let addedList:ListRow = lists.find( ( list:ListRow ) => ! ! list.added );
					expect( lists.length ).toEqual( 2 );
					expect( addedList ).toBeDefined();
					expect( addedList.added ).toBeDefined();
					done();
				} );

				comp.listsCmp.onAddNewList.emit( true );
				fixture.detectChanges();
			} );
		} );

		describe( "When clicking on save", () => {

			fit( "Should emit lists with list with property added", ( done ) => {

				comp.listsCmp.onListsChanges.subscribe( ( lists:ListRow[] ) => {
					let addedList:ListRow = lists.find( ( list:ListRow ) => ! ! list.added );
					expect( lists.length ).toEqual( 2 );
					expect( addedList ).toBeDefined();
					expect( addedList.added ).toBeDefined();
					done();
				} );

				comp.listsCmp.onAddNewList.emit( true );
				fixture.detectChanges();
			} );
		} );

		fit( "Should return all added lists when calling `getAddedLists`", () => {

			expect( comp.lists.length ).toEqual( 1 );
			comp.listsCmp.onAddNewList.emit( true );
			comp.listsCmp.onAddNewList.emit( true );
			comp.listsCmp.onAddNewList.emit( true );
			comp.listsCmp.onAddNewList.emit( true );
			fixture.detectChanges();
			expect( comp.listsCmp.getAddedLists().length ).toEqual( 4 );
		} );

		fit( "Should return all deleted lists when calling `getDeletedLists`", ( done ) => {

			comp.lists = [
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				}
			];
			fixture.detectChanges();


			comp.listsCmp.onListsChanges.subscribe( ( lists:ListRow[] ) => {
				let deletedList:ListRow = lists[ 0 ];
				expect( deletedList ).toBeDefined();
				expect( deletedList.deleted ).toBeDefined();
				expect( deletedList.deleted ).toEqual( deletedList.copy );
				expect( comp.listsCmp.getDeletedLists().length ).toEqual( 1 );
				done();
			} );

			let deleteButton:HTMLButtonElement = de.nativeElement.querySelector( "cw-list .bottom.menu .item" );
			deleteButton.click();
			let confirmButton:HTMLButtonElement = de.nativeElement.querySelector( "cw-list .confirm-deletion .red.button" );
			confirmButton.click();
		} );

		fit( "Should return all modified lists when calling `getModifiedLists`", () => {

			comp.lists = [
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					],
					modified: [
						{
							copy: { "@value": "modified value" }
						}
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				}
			];
			fixture.detectChanges();

			expect( comp.listsCmp.getModifiedLists().length ).toEqual( 1 );
		} );

		fit( "Should return all untouched lists when calling `getUntouchedLists`", () => {

			comp.lists = [
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					],
					modified: [
						{
							copy: { "@value": "modified value" }
						}
					]
				},
				{
					copy: [
						comp.blankNodes[ 0 ],
						comp.namedFragments[ 0 ],
						comp.blankNodes[ 1 ],
						comp.namedFragments[ 1 ],
					]
				}
			];
			fixture.detectChanges();

			expect( comp.listsCmp.getUntouchedLists().length ).toEqual( 2 );
		} );
	} );

}