import { Component } from "@angular/core";

import template from "./dashboard.view.html!";

@Component( {
	selector: "div.ng-view",
	template: template,
	directives: []
} )
export class DashboardView {
}

export default DashboardView;
