import { Component, ViewChild, ContentChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { MessagesAreaService } from "./messages-area.service";
import { MessagesAreaComponent } from "./messages-area.component";
import { Message, MessageComponent, Types } from "./message.component";

export function messageAreaComponentSpecs() {

	describe( "MessageAreaComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;
		let service:MessagesAreaService;

		@Component( {
			template: `<cw-messages-area></cw-messages-area>`
		} )
		class TestComponent {

			@ViewChild( MessagesAreaComponent ) messagesArea:MessagesAreaComponent;
			@ContentChild( MessageComponent ) messageComponent:MessageComponent;

			ngAfterViewInit() {}
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ MessagesAreaComponent, MessageComponent, TestComponent, ],
				providers: [ MessagesAreaService ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			service = TestBed.get( MessagesAreaService );
			fixture.detectChanges();
		} );

		it( "Should receive message from service", () => {
			let message:Message = {
				title: "My CHANGED message",
				content: "The CHANGED content of the message",
				duration: 2000,
				type: Types.INFO,
			};
			expect( comp.messagesArea.messages.length ).toBe( 0 );
			service.addMessage( message );
			fixture.detectChanges();
			expect( comp.messagesArea.messages.length ).toBe( 1 );
		} );

		it( "Should render received message from service", () => {
			let messages:Message[] = [
				{
					title: "My info message",
					content: "The content of the info message",
					duration: 1000,
					type: Types.INFO,
				}
			];
			service.addMessage( messages[ 0 ] );
			fixture.detectChanges();

			let messageDiv:HTMLElement = fixture.nativeElement.querySelector( "cw-message" );
			expect( messageDiv ).toBeDefined();
		} );

		it( "Should remove message", () => {
			spyOn( comp.messagesArea, "removeMessage" ).and.callThrough();

			let messages:Message[] = [
				{
					title: "My info message",
					content: "The content of the info message",
					duration: 1000,
					type: Types.INFO,
				}
			];
			service.addMessage( messages[ 0 ] );
			fixture.detectChanges();
			expect( comp.messagesArea.messages.length ).toBe( 1 );
			comp.messagesArea.removeMessage( 0 );
			expect( comp.messagesArea.messages.length ).toBe( 0 );
		} );

		it( "Should change the type of the message", () => {
			debugger;

			let message:Message = {
				title: "My info message",
				content: "The content of the info message",
				duration: 1000,
				type: Types.INFO,
			};
			service.addMessage( message );
			fixture.detectChanges();
			let messageDiv:HTMLElement = fixture.nativeElement.querySelector( "cw-message .message" );
			expect( messageDiv.classList ).toContain( Types.INFO );

			message.type = Types.ERROR;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.ERROR );

			message.type = Types.NEGATIVE;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.NEGATIVE );

			message.type = Types.NORMAL;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.NORMAL );

			message.type = Types.POSITIVE;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.POSITIVE );

			message.type = Types.SUCCESS;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.SUCCESS );

			message.type = Types.WARNING;
			fixture.detectChanges();
			expect( messageDiv.classList ).toContain( Types.WARNING );
		} );

	} );

}