import { AfterViewInit, Component } from "@angular/core";

import { MessagesAreaService } from "./messages-area.service";
import { Message } from "./message.component";


@Component( {
	selector: "app-messages-area",
	templateUrl: "./messages-area.component.html",
	styleUrls: [ "./messages-area.component.scss" ]
} )
export class MessagesAreaComponent implements AfterViewInit {
	messages:Message[] = [];
	messagesAreaService:MessagesAreaService;

	constructor( errorsAreaService:MessagesAreaService ) {
		this.messagesAreaService = errorsAreaService;
	}

	ngAfterViewInit():void {
		this.messagesAreaService.addMessageEmitter.subscribe(
			( message ):void => {
				if( this.messages.some( messageExists ) ) return;
				this.messages.push( message );

				function messageExists( messageAux ) {
					return (message.statusCode === messageAux.statusCode
						&& message.title === messageAux.title &&
						message.content === messageAux.content &&
						message.statusMessage === messageAux.statusMessage);
				}
			}
		);
	}

	removeMessage( index:number ):void {
		this.messages.splice( index, 1 );
	}

}
