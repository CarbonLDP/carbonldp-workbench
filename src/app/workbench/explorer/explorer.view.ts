import { Component, } from "@angular/core";

@Component( {
	selector: "app-explorer-view",
	templateUrl: "./explorer.view.html",
	styles: [ ":host { display: block; min-height: 0;}" ],
} )
//min-height: 0; this is necessary to fix issue in firefox related with flexbox overflow
export class ExplorerView {

	constructor() {}

}

