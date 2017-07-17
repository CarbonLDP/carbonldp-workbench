import { TestBed, inject, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { Message, Types } from "./message.component";
import { MessagesAreaService } from "./messages-area.service";

export function messageAreaServiceSpecs() {

	describe( "MessagesAreaService", () => {
		let service:MessagesAreaService;

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				providers: [ MessagesAreaService ]
			} ).compileComponents();
		} ) );


		beforeEach( () => {
			service = TestBed.get( MessagesAreaService );
		} );

		fit( "can instantiate service when inject service", inject( [ MessagesAreaService ], ( service:MessagesAreaService ) => {
			expect( service instanceof MessagesAreaService ).toBe( true );
		} ) );

		fit( "Should emit message", async () => {
			service.addMessageEmitter.subscribe( ( message:Message ) => {
				expect( message ).toBeDefined();
			} );
			let message:Message = {
				title: "My CHANGED message",
				content: "The CHANGED content of the message",
				duration: 2000,
				type: Types.INFO,
			};
			service.addMessage( message );
		} );

		fit( "Should return Message object when receiving string params", async () => {
			service.addMessageEmitter.subscribe( ( message:Message ) => {
				expect( message ).toBeDefined();
				expect( typeof message ).toEqual( "object" );
				expect( message ).toEqual( {
					title: "My message",
					content: "The content of the message",
					type: Types.ERROR,
					statusCode: null,
					statusMessage: null,
					endpoint: null,
					duration: 2000,
				} );
			} );
			service.addMessage( "My message", "The content of the message", Types.ERROR, null, null, null, 2000 );
		} );
	} );

}