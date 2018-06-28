import { Component, Input } from "@angular/core";

import { RouterService } from "app/shared/router.service";
import { SidebarItem } from "./sidebar.service";

@Component( {
	selector: "cw-sidebar-items",
	templateUrl: "./sidebar-items.component.html",
	styleUrls: [  "./sidebar-items.component.scss"  ],
} )
export class SidebarItemsComponent {
	@Input( "items" ) items:SidebarItem[];

	private routerService:RouterService;

	constructor( routerService:RouterService ) {
		this.routerService = routerService;
	}
}

