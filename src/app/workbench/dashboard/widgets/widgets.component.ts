import { Component, Input } from "@angular/core";

import { MessagesAreaService } from "app/common/components/messages-area/messages-area.service";


/*
*  Displays all the Dashboard's Widgets
* */
@Component( {
	selector: "app-widgets",
	templateUrl: "./widgets.component.html",
	styleUrls: [ "./widgets.component.scss" ],
} )
export class WidgetsComponent {
	private messagesAreaService:MessagesAreaService;

	@Input() widgetsList:Widget[];

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

	closeWidget( widget:Widget ):void {
		widget.hide = ! widget.hide;
	}

}

export interface Widget {
	id:number,
	name:string,
	title:string,
	hide:boolean
}
