import {Component} from "@angular/core";

import template from "./dashboard.view.html!";

@Component( {
	selector: "div.ng-view",
	template: template,
	directives: []
} )
export class DashboardView {
	ngOnInit():void {
		console.log( "DashboardView > ngOnInit()" );
	}
}

export default DashboardView;
