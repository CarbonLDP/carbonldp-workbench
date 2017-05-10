import { Component } from "@angular/core";

import * as App from "carbonldp/App";

import { AppContentService } from "../../../root-content/app-content.service";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";

@Component( {
	selector: "cw-sparql-client-view",
	templateUrl: "./sparql-client.view.html",
	styles: [ ":host { display: block; }" ],
} )
export class SPARQLClientView {
	appContext:App.Context;
	canDisplay:boolean = true;
	private messagesAreaService:MessagesAreaService;

	constructor( messagesAreaService:MessagesAreaService ) {
		this.appContext = appContentService.activeApp.context;
		this.messagesAreaService = messagesAreaService;
		appContentService.onAppHasChanged.subscribe( ( app:App.Class ) => {
			this.appContext = appContentService.activeApp.context;
			this.canDisplay = false;
			setTimeout( () => { this.canDisplay = true;}, 0 );
		} );
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

