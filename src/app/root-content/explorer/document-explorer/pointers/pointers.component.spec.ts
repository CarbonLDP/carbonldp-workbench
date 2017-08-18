import { Component, EventEmitter, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { PointerComponent, PointerRow } from "./../pointers/pointer.component";
import { PointersComponent } from "./../pointers/pointers.component";
import { PointerValidator } from "../document-explorer-validators";

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
			pointers:PointerRow[] = [];
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
			let pointers:PointerRow[] = [
				{
					copy: { "@id": "http://pointer-1.com" }
				},
				{
					copy: { "@id": "http://pointer-2.com" }
				},
				{
					copy: { "@id": "http://pointer-3.com" }
				},
			];
			comp.pointers = pointers;
			fixture.detectChanges();
		} );


		fit( "Should add class `added-pointer` to pointers that are being added", () => {

			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let addedPointer:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer.added-pointer" );
			expect( addedPointer ).not.toBeNull();
		} );

		fit( "Should add class `modified-pointer` to pointers that are being modified", () => {

			comp.pointersCmp.pointers[ 0 ] = {
				copy: { "@id": "http://pointer-1.com" },
				modified: { "@id": "http://pointer-2.com" },
			};
			fixture.detectChanges();

			let modifiedPointer:HTMLElement = de.nativeElement.querySelector( "tr.cw-pointer.modified-pointer" );
			expect( modifiedPointer ).not.toBeNull();
		} );

		fit( "Should emit pointers when a pointer is saved", ( done ) => {

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toModifyPointerIdx:number = 0;
			let toModifyPointer:PointerRow = comp.pointersCmp.pointers[ toModifyPointerIdx ];
			toModifyPointer.modified = { "@id": "http://modified-pointer-1" };

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerRow[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				expect( pointers[ toModifyPointerIdx ].modified ).toBeDefined();
				expect( pointers[ toModifyPointerIdx ].modified[ "@id" ] ).toEqual( "http://modified-pointer-1" );
				done();
			} );
			comp.pointersCmp.savePointer( toModifyPointer.modified, toModifyPointer.copy, 0 );
			fixture.detectChanges();
		} );

		fit( "Should emit pointers when a pointer is deleted", ( done ) => {


			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerRow = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerRow[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				expect( pointers[ toDeletePointerIdx ].deleted ).toBeDefined();
				expect( pointers[ toDeletePointerIdx ].deleted[ "@id" ] ).toEqual( "http://pointer-1.com" );
				done();
			} );

			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();

			pointers = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 2 );
		} );

		fit( "Should emit pointers and remove the deleted pointer if it was an added pointer", ( done ) => {

			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 4 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerRow = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;

			comp.pointersCmp.onPointersChanges.subscribe( ( pointers:PointerRow[] ) => {
				expect( pointers ).not.toBeNull();
				expect( pointers.length ).toEqual( 3 );
				done();
			} );

			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();
		} );

		fit( "Should not display pointer when it's been deleted", () => {

			let pointers:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 3 );

			let toDeletePointerIdx:number = 0;
			let toDeletePointer:PointerRow = comp.pointersCmp.pointers[ toDeletePointerIdx ];
			toDeletePointer.deleted = toDeletePointer.copy;
			comp.pointersCmp.deletePointer( toDeletePointer, 0 );
			fixture.detectChanges();

			pointers = de.nativeElement.querySelectorAll( "tr.cw-pointer" );
			expect( pointers.length ).toEqual( 2 );
		} );

		fit( "Should return all added pointers when calling `getAddedPointers`", () => {

			comp.pointersCmp.addNewPointer();
			comp.pointersCmp.addNewPointer();
			comp.pointersCmp.addNewPointer();
			fixture.detectChanges();

			let addedPointers:PointerRow[] = comp.pointersCmp.getAddedPointers();
			expect( addedPointers.length ).toEqual( 3 );
		} );

		fit( "Should return all deleted pointers when calling `getDeletedPointers`", () => {

			comp.pointersCmp.pointers[ 0 ].deleted = comp.pointersCmp.pointers[ 0 ].copy;
			comp.pointersCmp.pointers[ 2 ].deleted = comp.pointersCmp.pointers[ 2 ].copy;

			comp.pointersCmp.deletePointer( comp.pointersCmp.pointers[ 0 ], 0 );
			fixture.detectChanges();
			comp.pointersCmp.deletePointer( comp.pointersCmp.pointers[ 2 ], 2 );
			fixture.detectChanges();

			let deletedPointers:PointerRow[] = comp.pointersCmp.getDeletedPointers();
			expect( deletedPointers.length ).toEqual( 2 );
		} );

		fit( "Should return all modified pointers when calling `getModifiedPointers`", () => {

			comp.pointersCmp.pointers[ 1 ] = {
				copy: { "@id": "http://pointer-2" },
				modified: { "@id": "http://modified-pointer-2" },
			};
			comp.pointersCmp.pointers[ 2 ] = {
				copy: { "@id": "http://pointer-3" },
				modified: { "@id": "http://modified-pointer-3" },
			};
			fixture.detectChanges();

			let modifiedPointers:PointerRow[] = comp.pointersCmp.getModifiedPointers();
			expect( modifiedPointers.length ).toEqual( 2 );
		} );

		fit( "Should return all untouched pointers when calling `getUntouchedPointers`", () => {

			let untouchedPointers:PointerRow[] = comp.pointersCmp.getUntouchedPointers();
			expect( untouchedPointers.length ).toEqual( 3 );
		} );

		fit( "Should add new pointer when `onAddNewPointer` emitter is fired", ( done ) => {

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

		fit( "Should not display Actions column if cannot edit", () => {

			let headers:HTMLElement[] = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 2 );

			comp.canEdit = false;
			fixture.detectChanges();

			headers = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 1 );
		} );

		fit( "Should not display any pointers if there isn't any added, modified or deleted pointer", () => {

			comp.pointers = [];
			fixture.detectChanges();
			comp.pointersCmp.ngOnInit();
			fixture.detectChanges();

			let pointersTable:HTMLElement = de.nativeElement.querySelector( "table" );
			expect( pointersTable ).toBeNull();
		} );

	} );

}