import { Component } from "@angular/core";

import template from "./dashboard.view.html!";

@Component( {
	selector: "div.ng-view",
	template: template,
} )
export class DashboardView {
}

export default DashboardView;
