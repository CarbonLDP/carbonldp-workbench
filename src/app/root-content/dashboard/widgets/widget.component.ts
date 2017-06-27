import { Component } from "@angular/core";

import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";

import "semantic-ui/semantic";

@Component({
	selector: "cw-widgets",
	templateUrl: "./widget.component.html",
	styleUrls: [ "./widget.component.scss" ],
})

export class WidgetComponent{
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