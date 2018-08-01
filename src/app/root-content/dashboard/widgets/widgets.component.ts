import { Component, Input } from "@angular/core";

//Services/Providers
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";

import "semantic-ui/semantic";
import { SPARQLQuery } from "app/root-content/sparql-client/response/response.component";

@Component( {
	selector: "cw-widgets",
	templateUrl: "./widgets.component.html",
	styleUrls: [ "./widgets.component.scss" ],
} )

export class WidgetsComponent {
	private messagesAreaService:MessagesAreaService;

	customWidgetsIndex: Array<number>;
	@Input() widgetsList: Array<Widget|CustomWidget>;

	constructor( messagesAreaService:MessagesAreaService) {
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

	getCustomWidgetIndex():Array<number>{
		let indexArray: Array<number> = [];
		this.widgetsList.forEach((widget, index)=>{
			if(widget.customWidget){
				indexArray.push(index);
			}
		});
		return indexArray;
	}

	ngOnInit(){
		this.customWidgetsIndex = this.getCustomWidgetIndex();
	}
}

export interface Widget {
	id:number,
	name:string,
	title:string,
	hide:boolean
	customWidget:boolean
}

export interface CustomWidget extends Widget{
	id: number,
	name: string,
	title: string,
	hide: boolean,
	query: SPARQLQuery,
	type: string,
	customWidget:boolean
}