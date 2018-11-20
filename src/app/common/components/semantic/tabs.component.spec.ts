import { Component, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TabComponent } from "./tab.component";
import { TabsComponent } from "./tabs.component";

export function tabsComponentSpecs() {

	describe( "TabsComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;

		@Component( {
			template: `
				<sui-tabs [activeTab]="1">
					<sui-tab [title]="'Tab 1'">Content of the Tab 1</sui-tab>
					<sui-tab [title]="'Tab 2'">Content of the Tab 2</sui-tab>
					<sui-tab [title]="'Tab 3'">Content of the Tab 3</sui-tab>					
				</sui-tabs>`
		} )
		class TestComponent {
			@ViewChild( TabsComponent ) tabs:TabsComponent;
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ TabComponent, TabsComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			fixture.detectChanges();
		} );

		it( "Should have the amount of titles defined inside sui-tab", () => {
			expect( comp.tabs.titles.length ).toEqual( 3 );
		} );

		it( "Should activate tab when clicking on it", () => {
			comp.tabs.ngAfterContentInit();
			comp.tabs.activeTab = 1;
			fixture.detectChanges();
			expect( comp.tabs.activeTab ).toEqual( 1 );
			let titles:HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll( ".menu a.item" );
			titles[ 2 ].click();
			fixture.detectChanges();
			expect( comp.tabs.activeTab ).toEqual( 2 );
		} );

		it( "Should call activeTabChange when clicking on tab", () => {
			spyOn( comp.tabs.activeTabChange, "emit" ).and.callThrough();
			let titles:HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll( ".menu a.item" );
			titles[ 2 ].click();
			fixture.detectChanges();
			expect( comp.tabs.activeTabChange.emit ).toHaveBeenCalledWith( 2 );
		} );

	} );

}