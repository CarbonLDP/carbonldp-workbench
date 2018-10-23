import { Component, Input } from "@angular/core";

import { RouterService } from "app/common/router.service";
import { SidebarItem } from "./sidebar.service";


/*
*   Displays all the different types of sidebar items
* */
@Component( {
	selector: "cw-sidebar-items",
	templateUrl: "./sidebar-items.component.html",
	styleUrls: [ "./sidebar-items.component.scss" ],
} )
export class SidebarItemsComponent {
	@Input( "items" ) items:SidebarItem[];

	private routerService:RouterService;

	constructor( routerService:RouterService ) {
		this.routerService = routerService;
	}
}

