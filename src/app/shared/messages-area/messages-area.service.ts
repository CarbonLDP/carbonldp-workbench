import { EventEmitter, Injectable } from "@angular/core";

import { Message } from "./message.component";

@Injectable()
export class MessagesAreaService {

	addMessageEmitter:EventEmitter<any> = new EventEmitter();

	constructor() { }

	addMessage( message:Message ):void;
	addMessage( title:string, content?:string, type?:string, statusCode?:string, statusMessage?:string, endpoint?:string, duration?:number ):void;
	addMessage( titleOrMessage?:string | Message, content?:string, type?:string, statusCode?:string, statusMessage?:string, endpoint?:string, duration?:number ):void {
		let message:Message = {};
		if( typeof titleOrMessage === "string" ) {
			message.title = titleOrMessage;
			message.content = content;
			message.type = type;
			message.statusCode = statusCode;
			message.statusMessage = statusMessage;
			message.endpoint = endpoint;
			message.duration = duration;
		} else {
			message = titleOrMessage;
		}
		this.addMessageEmitter.emit( message );
	}
}
