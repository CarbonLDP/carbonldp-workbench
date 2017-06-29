import { Component, Input, Output, EventEmitter } from "@angular/core";

import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-widgets",
	templateUrl: "./widget.component.html",
	styleUrls: [ "./widget.component.scss" ],
} )

export class WidgetComponent {
	private messagesAreaService:MessagesAreaService;

	@Input() widgetsList:Widget[];
	@Output() widgetsListChange:EventEmitter<Widget[]> = new EventEmitter<Widget[]>();

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

	widgetsListChildChange( widgetHide:boolean, widgetId:number ):void {
		this.widgetsList[ widgetId - 1 ].hide = widgetHide;
		this.widgetsListChange.emit( this.widgetsList );
	}

}

export interface Widget {
	id:number,
	name:string,
	queriedObject:string,
	hide:boolean
}