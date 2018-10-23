import { Component, DebugElement, EventEmitter, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { PointerComponent, PointerStatus } from "./../pointers/pointer.component";
import { PointersComponent } from "./../pointers/pointers.component";
import { PointerValidator } from "../document-explorer-validators";
import { JsonLDKeyword } from "./../document-explorer-library";

export function pointersSpecs() {

	describe( "PointersComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<cw-pointers [pointers]="pointers" [canEdit]="canEdit" [onAddNewPointer]="addEmiter"></cw-pointers>`
		} )
		class TestComponent {
			canEdit:boolean = true;
			addEmiter:EventEmitter<boolean> = new EventEmitter();
			pointers:PointerStatus[] = [];
			@ViewChild( PointersComponent ) pointersCmp:PointersComponent;
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ PointerComponent, PointerValidator, PointersComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
		} );

		beforeEach( () => {
			let pointers:PointerStatus[] = [
				{
					copy: { [ JsonLDKeyword.ID ]: "http://pointer-1.com" }
				},
				{
					copy: { [ JsonLDKeyword.ID ]: "http://pointer-2.com" }
				},
				{
					copy: { [ JsonLDKeyword.ID ]: "http://pointer-3.com" }
				},
			];
			comp.pointers = pointers;
			fixture.detectChanges();
		} );


		it( "Should add class `added-pointer` to pointers that are being added", () => {

			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let addedPointer:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer.added-pointer" );
			expect( addedPointer ).not.toBeNull();
		} );

		it( "Should add class `modified-pointer` to pointers that are being modified", () => {

			comp.pointersCmp.pointers[ 0 ] = {
				copy: { [ JsonLDKeyword.ID ]: "http://pointer-1.com" },
				modified: { [ JsonLDKeyword.ID ]: "http://pointer-2.com" },
			};
			fixture.detectChanges();

			let modifiedPointer:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer.modified-pointer" );
			expect( modifiedPointer ).not.toBeNull();
		} );

		it( "Should emit pointers when a pointer is saved", ( done ) => {

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toModifyPointerIdx:number = 0;
			let toModifyPointer:PointerStatus = comp.pointersCmp.pointers[ toModifyPointerIdx ];
			toModifyPointer.modified = { [ JsonLDKeyword.ID ]: "http://modified-pointer-1" };

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerStatus[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				expect( pointers[ toModifyPointerIdx ].modified ).toBeDefined();
				expect( pointers[ toModifyPointerIdx ].modified[ JsonLDKeyword.ID ] ).toEqual( "http://modified-pointer-1" );
				done();
			} );
			comp.pointersCmp.savePointer();
			fixture.detectChanges();
		} );

		it( "Should emit pointers when a pointer is deleted", ( done ) => {


			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerStatus = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerStatus[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				expect( pointers[ toDeletePointerIdx ].deleted ).toBeDefined();
				expect( pointers[ toDeletePointerIdx ].deleted[ JsonLDKeyword.ID ] ).toEqual( "http://pointer-1.com" );
				done();
			} );

			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();

			pointers = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 2 );
		} );

		it( "Should emit pointers and remove the deleted pointer if it was an added pointer", ( done ) => {

			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 4 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerStatus = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerStatus[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				done();
			} );

			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();
		} );

		it( "Should not display pointer when it's been deleted", () => {

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerStatus = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;
			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();

			pointers = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 2 );
		} );

		it( "Should return all added pointers when calling `getAddedPointers`", () => {

			comp.pointersCmp.addNewPointer();
			comp.pointersCmp.addNewPointer();
			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let addedPointers:PointerStatus[] = comp.pointersCmp.getAddedPointers();
			expect( addedPointers.length ).toEqual( 3 );
		} );

		it( "Should return all deleted pointers when calling `getDeletedPointers`", () => {

			comp.pointersCmp.pointers[ 0 ].deleted = comp.pointersCmp.pointers[ 0 ].copy;
			comp.pointersCmp.pointers[ 2 ].deleted = comp.pointersCmp.pointers[ 2 ].copy;

			comp.pointersCmp.deletePointer( comp.pointersCmp.pointers[ 0 ], 0 );
			fixture.detectChanges();
			comp.pointersCmp.deletePointer( comp.pointersCmp.pointers[ 2 ], 2 );
			fixture.detectChanges();

			let deletedPointers:PointerStatus[] = comp.pointersCmp.getDeletedPointers();
			expect( deletedPointers.length ).toEqual( 2 );
		} );

		it( "Should return all modified pointers when calling `getModifiedPointers`", () => {

			comp.pointersCmp.pointers[ 1 ] = {
				copy: { [ JsonLDKeyword.ID ]: "http://pointer-2" },
				modified: { [ JsonLDKeyword.ID ]: "http://modified-pointer-2" },
			};
			comp.pointersCmp.pointers[ 2 ] = {
				copy: { [ JsonLDKeyword.ID ]: "http://pointer-3" },
				modified: { [ JsonLDKeyword.ID ]: "http://modified-pointer-3" },
			};
			fixture.detectChanges();

			let modifiedPointers:PointerStatus[] = comp.pointersCmp.getModifiedPointers();
			expect( modifiedPointers.length ).toEqual( 2 );
		} );

		it( "Should return all untouched pointers when calling `getUntouchedPointers`", () => {

			let untouchedPointers:PointerStatus[] = comp.pointersCmp.getUntouchedPointers();
			expect( untouchedPointers.length ).toEqual( 3 );
		} );

		it( "Should add new pointer when `onAddNewPointer` emitter is fired", ( done ) => {

			comp.pointersCmp.onAddNewPointer.subscribe( ( value:boolean ) => {
				fixture.detectChanges();
				expect( value ).toBe( true );

				let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
				expect( pointers.length ).toEqual( 4 );
				expect( pointers[ 0 ].classList ).toContain( "added-pointer" );
				done();
			} );

			comp.addEmiter.emit( true );
		} );

		it( "Should not display Actions column if cannot edit", () => {

			let headers:HTMLElement[] = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 2 );

			comp.canEdit = false;
			fixture.detectChanges();

			headers = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 1 );
		} );

		it( "Should not display any pointers if there isn't any added, modified or deleted pointer", () => {

			comp.pointers = [];
			fixture.detectChanges();
			comp.pointersCmp.ngOnInit();
			fixture.detectChanges();

			let pointersTable:HTMLElement = de.nativeElement.querySelector( "table" );
			expect( pointersTable ).toBeNull();
		} );

	} );

}