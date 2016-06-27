import {Component} from "@angular/core";

import template from "./workbench.view.html!";

@Component( {
	selector: "div.ng-view",
	template: template,
	directives: []
} )
export class DashboardView {

}

export default DashboardView;
