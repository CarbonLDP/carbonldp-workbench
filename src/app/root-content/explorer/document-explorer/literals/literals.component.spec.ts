import { Component, EventEmitter, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { LiteralComponent, LiteralRow } from "./literal.component";
import { LiteralsComponent } from "./literals.component";
import { LiteralValueValidator } from "../document-explorer-validators";

export function literalsSpecs() {

	describe( "LiteralsComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<cw-literals [literals]="literals" [canEdit]="canEdit" [onAddNewLiteral]="addEmiter"></cw-literals>`
		} )
		class TestComponent {
			canEdit:boolean = true;
			addEmiter:EventEmitter<boolean> = new EventEmitter();
			literals:LiteralRow[] = [];
			@ViewChild( LiteralsComponent ) literalsCmp:LiteralsComponent;
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ LiteralComponent, LiteralValueValidator, LiteralsComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
		} );

		beforeEach( () => {
			let literals:LiteralRow[] = [
				{
					copy: { "@value": "literal 1" }
				},
				{
					copy: { "@value": "literal 2" }
				},
				{
					copy: { "@value": "literal 3" }
				},
			];
			comp.literals = literals;
			fixture.detectChanges();
		} );


		it( "Should display language column when a literal has @language property", () => {

			let literals:LiteralRow[] = [
				{
					copy: { "@value": "literal 1" }
				},
				{
					copy: { "@value": "literal 2", "@language": "en" }
				},
				{
					copy: { "@value": "literal 3" }
				},
			];
			comp.literals = literals;
			fixture.detectChanges();
			comp.literalsCmp.ngOnInit();
			fixture.detectChanges();

			let headers:HTMLElement[] = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 4 );
		} );

		it( "Should not display language column when there are no literals with @language property", () => {

			let headers:HTMLElement[] = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 3 );
		} );

		it( "Should add class `added-literal` to literals that are being added", () => {

			comp.literalsCmp.addNewLiteral();
			fixture.detectChanges();

			let addedLiteral:HTMLElement = de.nativeElement.querySelector( "tr.cw-literal.added-literal" );
			expect( addedLiteral ).not.toBeNull();
		} );

		it( "Should add class `modified-literal` to literals that are being added", () => {

			comp.literalsCmp.literals[ 0 ] = {
				copy: { "@value": "literal 3" },
				modified: { "@value": "literal 3", "@language": "en" },
			};
			fixture.detectChanges();

			let modifiedLiteral:HTMLElement = de.nativeElement.querySelector( "tr.cw-literal.modified-literal" );
			expect( modifiedLiteral ).not.toBeNull();
		} );

		it( "Should emit literals when a literal is saved", ( done ) => {


			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 3 );

			let toModifyLiteralIdx:number = 0;
			let toModifyLiteral:LiteralRow = comp.literalsCmp.literals[ toModifyLiteralIdx ];
			toModifyLiteral.modified = {
				"@value": "Modified Literal 1"
			};

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralRow[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				expect( literals[ toModifyLiteralIdx ].modified ).toBeDefined();
				expect( literals[ toModifyLiteralIdx ].modified[ "@value" ] ).toEqual( "Modified Literal 1" );
				done();
			} );
			comp.literalsCmp.saveLiteral( toModifyLiteral.modified, toModifyLiteral.copy, 0 );
			fixture.detectChanges();
		} );

		it( "Should emit literals when a literal is deleted", ( done ) => {


			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 3 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralRow = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralRow[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				expect( literals[ toDeleteLiteralIdx ].deleted ).toBeDefined();
				expect( literals[ toDeleteLiteralIdx ].deleted[ "@value" ] ).toEqual( "literal 1" );
				done();
			} );

			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();

			literals = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 2 );
		} );

		it( "Should emit literals and remove the deleted literal if it was an added literal", ( done ) => {

			comp.literalsCmp.addNewLiteral();
			fixture.detectChanges();

			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 4 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralRow = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralRow[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				done();
			} );

			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();
		} );

		it( "Should not display literal when it's been deleted", () => {

			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 3 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralRow = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;
			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();

			literals = de.nativeElement.querySelectorAll( "tr.cw-literal" );
			expect( literals.length ).toEqual( 2 );
		} );

		it( "Should return all added literals when calling `getAddedLiterals`", () => {

			comp.literalsCmp.addNewLiteral();
			comp.literalsCmp.addNewLiteral();
			comp.literalsCmp.addNewLiteral();
			fixture.detectChanges();

			let addedLiterals:LiteralRow[] = comp.literalsCmp.getAddedLiterals();
			expect( addedLiterals.length ).toEqual( 3 );
		} );

		it( "Should return all deleted literals when calling `getDeletedLiterals`", () => {

			comp.literalsCmp.literals[ 0 ].deleted = comp.literalsCmp.literals[ 0 ].copy;
			comp.literalsCmp.literals[ 2 ].deleted = comp.literalsCmp.literals[ 2 ].copy;

			comp.literalsCmp.deleteLiteral( comp.literalsCmp.literals[ 0 ], 0 );
			fixture.detectChanges();
			comp.literalsCmp.deleteLiteral( comp.literalsCmp.literals[ 2 ], 2 );
			fixture.detectChanges();

			let deletedLiterals:LiteralRow[] = comp.literalsCmp.getDeletedLiterals();
			expect( deletedLiterals.length ).toEqual( 2 );
		} );

		it( "Should return all modified literals when calling `getModifiedLiterals`", () => {

			comp.literalsCmp.literals[ 1 ] = {
				copy: { "@value": "literal 2" },
				modified: { "@value": "literal 2", "@language": "en" },
			};
			comp.literalsCmp.literals[ 2 ] = {
				copy: { "@value": "literal 3" },
				modified: { "@value": "literal 3", "@language": "en" },
			};
			fixture.detectChanges();

			let modifiedLiterals:LiteralRow[] = comp.literalsCmp.getModifiedLiterals();
			expect( modifiedLiterals.length ).toEqual( 2 );
		} );

		it( "Should return all untouched literals when calling `getUntouchedLiterals`", () => {

			let untouchedLiterals:LiteralRow[] = comp.literalsCmp.getUntouchedLiterals();
			expect( untouchedLiterals.length ).toEqual( 3 );
		} );

		it( "Should add new literal when `onAddNewLiteral` emitter is fired", ( done ) => {

			comp.literalsCmp.onAddNewLiteral.subscribe( ( value:boolean ) => {
				fixture.detectChanges();
				expect( value ).toBe( true );

				let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.cw-literal" );
				expect( literals.length ).toEqual( 4 );
				expect( literals[ 0 ].classList ).toContain( "added-literal" );
				done();
			} );

			comp.addEmiter.emit( true );
		} );

		it( "Should not display Actions column if cannot edit", () => {

			comp.canEdit = false;
			fixture.detectChanges();

			let headers:HTMLElement[] = de.nativeElement.querySelectorAll( "th" );
			expect( headers.length ).toEqual( 2 );
		} );

		it( "Should not display any literals if there isn't any added, modified or deleted literal", () => {

			comp.literals = [];
			fixture.detectChanges();
			comp.literalsCmp.ngOnInit();
			fixture.detectChanges();

			let literalsTable:HTMLElement = de.nativeElement.querySelector( "table" );
			expect( literalsTable ).toBeNull();
		} );

	} );

}