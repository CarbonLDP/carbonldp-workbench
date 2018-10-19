import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { PaginatorComponent } from "./paginator.component";

export function paginatorSpecs() {

	describe( "MessageAreaComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `<cw-paginator [activePage]="0" [elementsPerPage]="elementsPerPage" [totalElements]="totalElements"></cw-paginator>`
		} )
		class TestComponent {

			totalElements:number = 10;
			elementsPerPage:number = 3;
			@ViewChild( PaginatorComponent ) paginator:PaginatorComponent;

			ngAfterViewInit() {}
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ PaginatorComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should have the correct amount of pages", () => {
			let totalPages:number;
			let pages:HTMLElement[];
			let backBtn:HTMLElement;
			let nextBtn:HTMLElement;

			comp.elementsPerPage = 5;
			comp.totalElements = 15;
			totalPages = Math.floor( comp.totalElements / comp.elementsPerPage );
			fixture.detectChanges();
			expect( comp.paginator.pages.length ).toEqual( totalPages );
			expect( comp.paginator.totalElements ).toEqual( comp.totalElements );
			expect( comp.paginator.elementsPerPage ).toEqual( comp.elementsPerPage );
			pages = Array.prototype.slice.call( fixture.nativeElement.querySelectorAll( "cw-paginator a" ) );
			backBtn = pages.splice( 0, 1 )[ 0 ];
			nextBtn = pages.splice( pages.length - 1, 1 )[ 0 ];
			expect( pages.length ).toEqual( totalPages );


			comp.elementsPerPage = 3;
			comp.totalElements = 10;
			totalPages = Math.floor( comp.totalElements / comp.elementsPerPage );
			fixture.detectChanges();
			expect( comp.paginator.pages.length ).toEqual( totalPages );
			expect( comp.paginator.totalElements ).toEqual( comp.totalElements );
			expect( comp.paginator.elementsPerPage ).toEqual( comp.elementsPerPage );
			pages = Array.prototype.slice.call( fixture.nativeElement.querySelectorAll( "cw-paginator a" ) );
			backBtn = pages.splice( 0, 1 )[ 0 ];
			nextBtn = pages.splice( pages.length - 1, 1 )[ 0 ];
			expect( pages.length ).toEqual( totalPages );


			// let paginatorDiv:HTMLElement = fixture.nativeElement.querySelector( "cw-paginator .pagination.menu" );
		} );

		it( "Should change the active page number", () => {

			comp.elementsPerPage = 5;
			comp.totalElements = 15;
			comp.paginator.activePage = 0;
			fixture.detectChanges();
			let pages:HTMLElement[] = Array.prototype.slice.call( fixture.nativeElement.querySelectorAll( "cw-paginator a" ) );
			let backBtn:HTMLElement = pages.splice( 0, 1 )[ 0 ];
			let nextBtn:HTMLElement = pages.splice( pages.length - 1, 1 )[ 0 ];


			nextBtn.click();
			fixture.detectChanges();
			expect( comp.paginator.activePage ).toEqual( 1 );
			nextBtn.click();
			fixture.detectChanges();
			expect( comp.paginator.activePage ).toEqual( 2 );
			backBtn.click();
			fixture.detectChanges();
			expect( comp.paginator.activePage ).toEqual( 1 );
			backBtn.click();
			fixture.detectChanges();
			expect( comp.paginator.activePage ).toEqual( 0 );
		} );

		it( "Should emit active page after changing page", ( done ) => {

			spyOn( comp.paginator.onPageChange, "emit" ).and.callThrough();

			comp.elementsPerPage = 5;
			comp.totalElements = 15;
			comp.paginator.activePage = 0;
			fixture.detectChanges();
			let pages:HTMLElement[] = Array.prototype.slice.call( fixture.nativeElement.querySelectorAll( "cw-paginator a" ) );
			let nextBtn:HTMLElement = pages.splice( pages.length - 1, 1 )[ 0 ];

			comp.paginator.onPageChange.subscribe( ( pageNumber:number ) => {
				expect( pageNumber ).toBeDefined();
				expect( typeof pageNumber ).toEqual( "number" );
				done();
			} );

			nextBtn.click();
			fixture.detectChanges();
			expect( comp.paginator.activePage ).toEqual( 1 );
		} );

	} );

}