import { Component, DebugElement, EventEmitter, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FormsModule } from "@angular/forms";

import { LiteralComponent, LiteralStatus } from "./literal.component";
import { LiteralsComponent } from "./literals.component";
import { LiteralValueValidator } from "../document-explorer-validators";
import { JsonLDKeyword } from "./../document-explorer-library";

export function literalsSpecs() {

	describe( "LiteralsComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<app-literals [literals]="literals" [canEdit]="canEdit" [onAddNewLiteral]="addEmiter"></app-literals>`
		} )
		class TestComponent {
			canEdit:boolean = true;
			addEmiter:EventEmitter<boolean> = new EventEmitter();
			literals:LiteralStatus[] = [];
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
			let literals:LiteralStatus[] = [
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 1" }
				},
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 2" }
				},
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 3" }
				},
			];
			comp.literals = literals;
			fixture.detectChanges();
		} );


		it( "Should display language column when a literal has @language property", () => {

			let literals:LiteralStatus[] = [
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 1" }
				},
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 2", [ JsonLDKeyword.LANGUAGE ]: "en" }
				},
				{
					copy: { [ JsonLDKeyword.VALUE ]: "literal 3" }
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

			let addedLiteral:HTMLElement = de.nativeElement.querySelector( "tr.app-literal.added-literal" );
			expect( addedLiteral ).not.toBeNull();
		} );

		it( "Should add class `modified-literal` to literals that are being modified", () => {

			comp.literalsCmp.literals[ 0 ] = {
				copy: { [ JsonLDKeyword.VALUE ]: "literal 3" },
				modified: { [ JsonLDKeyword.VALUE ]: "literal 3", [ JsonLDKeyword.LANGUAGE ]: "en" },
			};
			fixture.detectChanges();

			let modifiedLiteral:HTMLElement = de.nativeElement.querySelector( "tr.app-literal.modified-literal" );
			expect( modifiedLiteral ).not.toBeNull();
		} );

		it( "Should emit literals when a literal is saved", ( done ) => {


			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 3 );

			let toModifyLiteralIdx:number = 0;
			let toModifyLiteral:LiteralStatus = comp.literalsCmp.literals[ toModifyLiteralIdx ];
			toModifyLiteral.modified = {
				[ JsonLDKeyword.VALUE ]: "Modified Literal 1"
			};

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralStatus[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				expect( literals[ toModifyLiteralIdx ].modified ).toBeDefined();
				expect( literals[ toModifyLiteralIdx ].modified[ JsonLDKeyword.VALUE ] ).toEqual( "Modified Literal 1" );
				done();
			} );
			comp.literalsCmp.saveLiteral();
			fixture.detectChanges();
		} );

		it( "Should emit literals when a literal is deleted", ( done ) => {


			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 3 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralStatus = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralStatus[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				expect( literals[ toDeleteLiteralIdx ].deleted ).toBeDefined();
				expect( literals[ toDeleteLiteralIdx ].deleted[ JsonLDKeyword.VALUE ] ).toEqual( "literal 1" );
				done();
			} );

			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();

			literals = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 2 );
		} );

		it( "Should emit literals and remove the deleted literal if it was an added literal", ( done ) => {

			comp.literalsCmp.addNewLiteral();
			fixture.detectChanges();

			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 4 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralStatus = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;

			comp.literalsCmp.onLiteralsChanges.subscribe( ( literals:LiteralStatus[] ) => {
				expect( literals ).not.toBeNull();
				expect( literals.length ).toEqual( 3 );
				done();
			} );

			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();
		} );

		it( "Should not display literal when it's been deleted", () => {

			let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 3 );

			let toDeleteLiteralIdx:number = 0;
			let toDeleteLiteral:LiteralStatus = comp.literalsCmp.literals[ toDeleteLiteralIdx ];
			toDeleteLiteral.deleted = toDeleteLiteral.copy;
			comp.literalsCmp.deleteLiteral( toDeleteLiteral, 0 );
			fixture.detectChanges();

			literals = de.nativeElement.querySelectorAll( "tr.app-literal" );
			expect( literals.length ).toEqual( 2 );
		} );

		it( "Should return all added literals when calling `getAddedLiterals`", () => {

			comp.literalsCmp.addNewLiteral();
			comp.literalsCmp.addNewLiteral();
			comp.literalsCmp.addNewLiteral();
			fixture.detectChanges();

			let addedLiterals:LiteralStatus[] = comp.literalsCmp.getAddedLiterals();
			expect( addedLiterals.length ).toEqual( 3 );
		} );

		it( "Should return all deleted literals when calling `getDeletedLiterals`", () => {

			comp.literalsCmp.literals[ 0 ].deleted = comp.literalsCmp.literals[ 0 ].copy;
			comp.literalsCmp.literals[ 2 ].deleted = comp.literalsCmp.literals[ 2 ].copy;

			comp.literalsCmp.deleteLiteral( comp.literalsCmp.literals[ 0 ], 0 );
			fixture.detectChanges();
			comp.literalsCmp.deleteLiteral( comp.literalsCmp.literals[ 2 ], 2 );
			fixture.detectChanges();

			let deletedLiterals:LiteralStatus[] = comp.literalsCmp.getDeletedLiterals();
			expect( deletedLiterals.length ).toEqual( 2 );
		} );

		it( "Should return all modified literals when calling `getModifiedLiterals`", () => {

			comp.literalsCmp.literals[ 1 ] = {
				copy: { [ JsonLDKeyword.VALUE ]: "literal 2" },
				modified: { [ JsonLDKeyword.VALUE ]: "literal 2", [ JsonLDKeyword.LANGUAGE ]: "en" },
			};
			comp.literalsCmp.literals[ 2 ] = {
				copy: { [ JsonLDKeyword.VALUE ]: "literal 3" },
				modified: { [ JsonLDKeyword.VALUE ]: "literal 3", [ JsonLDKeyword.LANGUAGE ]: "en" },
			};
			fixture.detectChanges();

			let modifiedLiterals:LiteralStatus[] = comp.literalsCmp.getModifiedLiterals();
			expect( modifiedLiterals.length ).toEqual( 2 );
		} );

		it( "Should return all untouched literals when calling `getUntouchedLiterals`", () => {

			let untouchedLiterals:LiteralStatus[] = comp.literalsCmp.getUntouchedLiterals();
			expect( untouchedLiterals.length ).toEqual( 3 );
		} );

		it( "Should add new literal when `onAddNewLiteral` emitter is fired", ( done ) => {

			comp.literalsCmp.onAddNewLiteral.subscribe( ( value:boolean ) => {
				fixture.detectChanges();
				expect( value ).toBe( true );

				let literals:HTMLElement[] = de.nativeElement.querySelectorAll( "tr.app-literal" );
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
