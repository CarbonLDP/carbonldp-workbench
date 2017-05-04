import { Component, Input, Output, EventEmitter } from "@angular/core";

import * as App from "../../app-content/app";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-app-tile",
	templateUrl: "./app-tile.component.html",
	styles: [ ":host { display: block; }" ],
} )
export class AppTileComponent {
	@Input() app:App.Class;
	@Output() deleteApp:EventEmitter<App.Class> = new EventEmitter<App.Class>();

	constructor() {}

	onDeleteApp( app:App.Class ):void {
		this.deleteApp.emit( app );
	}
}

