import { Component } from "@angular/core";
import { Event, NavigationEnd, Router } from "@angular/router";

import { CarbonLDP } from "carbonldp";

import { SidebarService } from "./layout/sidebar/sidebar.service";


/*
*   Contains the main layout of the Workbench.
*   All the Workbench routes are displayed here.
* */
@Component( {
	selector: "app-workbench",
	templateUrl: "./workbench.view.html",
	styleUrls: [ "./workbench.view.scss" ],
} )
export class WorkbenchView {

	public instance:any;

	private sidebarService:SidebarService;
	private router:Router;
	private carbonldp:CarbonLDP;
	private prevUrl:string;
	private base:string;

	constructor( sidebarService:SidebarService, router:Router, carbonldp:CarbonLDP ) {
		this.sidebarService = sidebarService;
		this.base = this.sidebarService.base;
		this.router = router;
		this.carbonldp = carbonldp;
		this.router.events.subscribe( ( event:Event ) => {
			let url:string = "", scrollableContent:Element;
			if( event instanceof NavigationEnd ) {
				url = event.url;
				if( this.prevUrl !== url ) {
					scrollableContent = document.querySelector( ".scrollable-content" );
					if( scrollableContent ) scrollableContent.scrollTop = 0;
					this.prevUrl = url;
				}
			}
		} );
	}

	ngOnInit():void {
		this.populateSidebar();
	}

	toggleSidebar():void {
		this.sidebarService.toggle();
	}

	private populateSidebar():void {
		this.sidebarService.clear();
		this.sidebarService.addItems( [
			{
				type: "link",
				name: "Dashboard",
				icon: "bar chart icon",
				route: [ this.base ],
				index: 0,
			},
			{
				type: "link",
				name: "Document Explorer",
				icon: "list layout icon",
				route: [ this.base, "explore" ],
			},
			{
				type: "link",
				name: "SPARQL Client",
				icon: "terminal icon",
				route: [ this.base, "sparql-client" ],
			},
		] );
	}
}
