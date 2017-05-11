import { Component } from "@angular/core";

import * as App from "app/root-content/app";

import { AppContentService } from "app/root-content/app-content.service";

@Component( {
	selector: "cw-roles-browser-view",
	templateUrl: "./roles-browser.view.html",
	styles: [ ":host { display: block; }" ]
} )

export class RolesBrowserView {

	private app:App.Class;
	public canDisplay:boolean = true;

	constructor( appContentService:AppContentService ) {
		this.app = appContentService.activeApp;
		appContentService.onAppHasChanged.subscribe( ( app:App.Class ) => {
			this.app = app;
			this.canDisplay = false;
			setTimeout( () => { this.canDisplay = true;}, 0 );
		} );
	}

}
