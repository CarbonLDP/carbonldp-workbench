import { Component } from "@angular/core";
import { Widget } from "./widgets/widgets.component"


/*
*  The landing page of the Workbench's Dashboard
* */
@Component( {
	selector: "cw-dashboard-view",
	templateUrl: "./dashboard.view.html",
	styleUrls: [ "./dashboard.view.scss" ],
} )
export class DashboardView {
	widgetsList:Widget[] = [
		{ id: 1, name: "totalDocuments", title: "Documents", hide: false },
		{ id: 2, name: "totalTriples", title: "Triples", hide: false }
	];

}

