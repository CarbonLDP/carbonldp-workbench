import { Component } from "@angular/core";

import template from "./dashboard.view.html!";

@Component( {
	selector: "div.ng-view",
	templateUrl: "./dashboard.view.html"
} )
export class DashboardView {
}

export default DashboardView;
