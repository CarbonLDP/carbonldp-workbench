import { Component } from "@angular/core";

import { MessagesAreaService } from "app/common/components/messages-area/messages-area.service";

@Component( {
	selector: "cw-sparql-client-view",
	templateUrl: "./sparql-client.view.html",
	styles: [ ":host { display: block; }" ],
} )
export class SPARQLClientView {
	private messagesAreaService:MessagesAreaService;

	constructor( messagesAreaService:MessagesAreaService ) {
		this.messagesAreaService = messagesAreaService;
	}

	notifyErrorAreaService( error:any ):void {
		this.messagesAreaService.addMessage(
			error.title,
			error.content,
			error.type,
			error.statusCode,
			error.statusMessage,
			error.endpoint
		);
	}

}

