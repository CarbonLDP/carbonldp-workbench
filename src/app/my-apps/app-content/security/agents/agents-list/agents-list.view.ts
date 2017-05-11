import { Component } from "@angular/core";

import { AppContentService } from "app/root-content/app-content.service";
import * as App from "app/root-content/app";

@Component( {
	selector: "cw-agents-list-view",
	templateUrl: "./agents-list.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class AgentsListView {
	app:App.Class;
	canDisplay:boolean = true;

	constructor( appContentService:AppContentService ) {
		this.app = appContentService.activeApp;
		appContentService.onAppHasChanged.subscribe( ( app:App.Class ) => {
			this.app = app;
			this.canDisplay = false;
			setTimeout( () => { this.canDisplay = true;}, 0 );
		} );
	}

}

