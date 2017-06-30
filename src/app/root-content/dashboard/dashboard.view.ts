import { Component } from "@angular/core";
import { Widget } from "./widgets/widget.component"
import "semantic-ui/semantic";


@Component( {
	selector: "cw-dashboard-view",
	templateUrl: "./dashboard.view.html",
	styleUrls: [ "./dashboard.view.scss" ],
} )
export class DashboardView {
	widgetsList:Widget[] = [
		{ id: 1, name: "totalDocuments", title: "Documents", hide: false },
		{ id: 2, name: "totalTriples", title: "Triples", hide: false } ];

}

