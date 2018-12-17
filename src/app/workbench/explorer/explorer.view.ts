import { Component, } from "@angular/core";

@Component( {
	selector: "app-explorer-view",
	templateUrl: "./explorer.view.html",
	host: {
		"class": "ag-rows ag-flexible",
	},
} )
export class ExplorerView {
}

