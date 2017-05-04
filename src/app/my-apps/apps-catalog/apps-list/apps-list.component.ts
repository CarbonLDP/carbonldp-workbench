import { Component, Input, Output, EventEmitter } from "@angular/core";

import * as App from "../../app-content/app";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-apps-list",
	templateUrl: "./apps-list.component.html",
	styleUrls: [  "./apps-list.component.scss"  ],
} )
export class AppsListComponent {
	@Input() apps:App.Class[];
	@Output() openApp:EventEmitter<App.Class> = new EventEmitter<App.Class>();
	@Output() deleteApp:EventEmitter<App.Class> = new EventEmitter<App.Class>();

	headers:Header[] = [ { name: "Name", value: "name" }, { name: "Created", value: "created" }, { name: "Modified", value: "modified" } ];
	sortedColumn:string = null;
	ascending:boolean = false;

	constructor() {}

	sortColumn( header:Header ):void {
		if( this.sortedColumn === header.value ) this.ascending = ! this.ascending;
		this.sortedColumn = header.value;

		this.apps.sort( ( appA, appB ) => {
			if( appA[ this.sortedColumn ] > appB[ this.sortedColumn ] ) return this.ascending ? - 1 : 1;
			if( appA[ this.sortedColumn ] < appB[ this.sortedColumn ] ) return this.ascending ? 1 : - 1;
			return 0;
		} );
	}

	onOpenApp( appContext:App.Class ):void {
		this.openApp.emit( appContext );
	}

	onDeleteApp( appContext:App.Class ):void {
		this.deleteApp.emit( appContext );
	}
}

export interface Header {
	name:string;
	value:string;
}

