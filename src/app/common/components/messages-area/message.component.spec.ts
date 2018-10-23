import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { Message, MessageComponent, Types } from "./message.component";

export function messageComponentSpecs() {

	describe( "MessageComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;

		@Component( {
			template: `
			<div>
				<cw-message class="first" [closable]="true" [message]="message"></cw-message>
			</div>`
		} )
		class TestComponent {

			@ViewChild( MessageComponent ) messageComponent:MessageComponent;
			public message:Message = {
				title: "My message",
				content: "The content of the message",
				duration: 1000,
				type: Types.ERROR,
			};
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ MessageComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			comp.message = {
				title: "My message",
				content: "The content of the message",
				duration: 1000,
			};
			de = fixture.debugElement;
			fixture.detectChanges();
		} );

		it( "Should decompose message", () => {

			expect( comp.messageComponent.title ).toEqual( comp.message.title );
			expect( comp.messageComponent.content ).toEqual( comp.message.content );
			expect( comp.messageComponent.type ).toEqual( comp.message.type );

			comp.message = {
				title: "My CHANGED message",
				content: "The CHANGED content of the message",
				duration: 2000,
				type: Types.INFO,
			};
			fixture.detectChanges();

			expect( comp.messageComponent.title ).toEqual( comp.message.title );
			expect( comp.messageComponent.content ).toEqual( comp.message.content );
			expect( comp.messageComponent.type ).toEqual( comp.message.type );
		} );


		it( "Should close message", ( done ) => {
			let messageDiv:HTMLElement = fixture.nativeElement.querySelector( ".message" );
			let closeBtn = fixture.nativeElement.querySelector( ".close.icon" );

			comp.messageComponent.onClose.subscribe( ( value ) => {
				expect( value ).toEqual( true );
				expect( messageDiv.classList ).toContain( "hidden" );
				done();
			} );
			closeBtn.click();
			fixture.detectChanges();
		} );

	} );

}