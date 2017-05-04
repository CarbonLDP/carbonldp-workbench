import { Component, Input, Output, EventEmitter } from "@angular/core";

import * as App from "../../app-content/app";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-app-action-buttons",
	templateUrl: "./app-action-buttons.component.html",
	styles: [ ":host { display:block; }" ],
} )
export class AppActionButtonsComponent {
	@Input() app:App.Class;
	@Output() deleteApp:EventEmitter<App.Class> = new EventEmitter<App.Class>();

	constructor() { }

	onDeleteApp( event:Event ):void {
		event.stopPropagation();
		this.deleteApp.emit( this.app );
	}

	avoidRowClick( event:Event ):void {
		event.stopPropagation();
	}
}

