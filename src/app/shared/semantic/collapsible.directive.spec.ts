import { Component, ViewChild, DebugElement, ElementRef } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

import { CollapsibleDirective, CollapsibleTitleDirective, CollapsibleContentDirective } from "./collapsible.directive";

export function collapsibleSpecs() {

	describe( "CollapsibleDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
				<div class="ui styled accordion" suiCollapsible>
					<div class="title">My Title</div>
					<div class="content">My Content</div>
				</div>
			`
		} )
		class TestComponent {
			@ViewChild( CollapsibleDirective ) collapsible:CollapsibleDirective;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TestComponent, CollapsibleDirective, CollapsibleTitleDirective, CollapsibleContentDirective, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should add class 'active'", () => {
			comp.collapsible.ngAfterContentInit();

			let title:HTMLElement = fixture.nativeElement.querySelector( ".title" );
			let content:HTMLElement = fixture.nativeElement.querySelector( ".content" );

			expect( title.classList ).not.toContain( "active" );
			expect( content.classList ).not.toContain( "active" );
			expect( comp.collapsible.title.active ).toBeUndefined();
			expect( comp.collapsible.content.active ).toBeUndefined();
			expect( comp.collapsible.active ).toBeUndefined();

			comp.collapsible.active = true;
			fixture.detectChanges();

			expect( title.classList ).toContain( "active" );
			expect( content.classList ).toContain( "active" );
			expect( comp.collapsible.title.active ).toBe( true );
			expect( comp.collapsible.content.active ).toBe( true );
			expect( comp.collapsible.active ).toBe( true );
		} );

		it( "Should toggle class 'active'", () => {
			comp.collapsible.ngAfterContentInit();

			let title:HTMLElement = fixture.nativeElement.querySelector( ".title" );
			let content:HTMLElement = fixture.nativeElement.querySelector( ".content" );

			expect( title.classList ).not.toContain( "active" );
			expect( content.classList ).not.toContain( "active" );
			expect( comp.collapsible.title.active ).toBeUndefined();
			expect( comp.collapsible.content.active ).toBeUndefined();
			expect( comp.collapsible.active ).toBeUndefined();

			title.click();
			fixture.detectChanges();

			expect( title.classList ).toContain( "active" );
			expect( content.classList ).toContain( "active" );
			expect( comp.collapsible.title.active ).toBe( true );
			expect( comp.collapsible.content.active ).toBe( true );
			expect( comp.collapsible.active ).toBe( true );

			title.click();
			fixture.detectChanges();

			expect( title.classList ).not.toContain( "active" );
			expect( content.classList ).not.toContain( "active" );
			expect( comp.collapsible.title.active ).toBe( false );
			expect( comp.collapsible.content.active ).toBe( false );
			expect( comp.collapsible.active ).toBe( false );
		} );

		it( "Should emit active change", ( done ) => {
			spyOn( comp.collapsible.activeChange, "emit" ).and.callThrough();
			comp.collapsible.ngAfterContentInit();
			comp.collapsible.activeChange.subscribe( ( isActive:boolean ) => {
				expect( comp.collapsible.activeChange.emit ).toHaveBeenCalled();
				expect( isActive ).toBe( true );
				done();
			} );

			let title:HTMLElement = fixture.nativeElement.querySelector( ".title" );
			title.click();
			fixture.detectChanges();
		} );
	} );

	describe( "CollapsibleTitleDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( { template: `<div class="title">My Title</div>` } )
		class TestComponent {
			@ViewChild( CollapsibleTitleDirective ) title:CollapsibleTitleDirective;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TestComponent, CollapsibleTitleDirective, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should add class 'active'", () => {
			let title:HTMLElement = fixture.nativeElement.querySelector( ".title" );

			expect( title.classList ).not.toContain( "active" );
			comp.title.active = true;
			fixture.detectChanges();
			expect( title.classList ).toContain( "active" );
			comp.title.active = false;
			fixture.detectChanges();
			expect( title.classList ).not.toContain( "active" );
		} );

		it( "Should have variable element of ElementRef", () => {
			let title:HTMLElement = fixture.nativeElement.querySelector( ".title" );

			expect( comp.title.element ).toBeDefined();
			expect( comp.title.element instanceof ElementRef ).toBe( true );
		} );

	} );

	describe( "CollapsibleContentDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( { template: `<div class="content">My Content</div>` } )
		class TestComponent {
			@ViewChild( CollapsibleContentDirective ) content:CollapsibleContentDirective;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TestComponent, CollapsibleContentDirective, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should add class 'active'", () => {
			let content:HTMLElement = fixture.nativeElement.querySelector( ".content" );

			expect( content.classList ).not.toContain( "active" );
			comp.content.active = true;
			fixture.detectChanges();
			expect( content.classList ).toContain( "active" );
			comp.content.active = false;
			fixture.detectChanges();
			expect( content.classList ).not.toContain( "active" );
		} );

	} );
}