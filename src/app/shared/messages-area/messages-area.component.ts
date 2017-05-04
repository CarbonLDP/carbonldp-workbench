import { Component, AfterViewInit } from "@angular/core";

import { MessagesAreaService } from "./messages-area.service";
import { Message } from "./message.component";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-messages-area",
	templateUrl: "./messages-area.component.html",
	styleUrls: [ "./messages-area.component.scss" ],
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
				this.messages.push( message );
			}
		);
	}

	removeMessage( index:number ):void {
		this.messages.splice( index, 1 );
	}

}
