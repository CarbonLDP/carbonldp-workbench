import { Injectable, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { RouterService } from "app/router.service";

import { SidebarService, SidebarGroup, SidebarDivider, SidebarSubmenu } from "app/sidebar/sidebar.service";

import * as App from "./app-content/app";

@Injectable()
export class MyAppsSidebarService {

	// TODO: Find a more native approach to make this work with different routing levels 'website.com/app-dev/my-apps/slug/...' and 'workbench.com/my-apps/slug/...'
	private base:string = "";
	private router:Router;
	private routerService:RouterService;
	private sidebarService:SidebarService;
	private openAppsGroup:SidebarGroup;
	private openApps:Map<App.Class, SidebarSubmenu> = new Map<App.Class, SidebarSubmenu>();
	private openAppsDivider:SidebarDivider = {
		type: "divider",
		name: "Open Apps",
		icon: "cubes icon",
		index: 0,
	};

	constructor( router:Router, routerService:RouterService, sidebarService:SidebarService ) {
		this.router = router;
		this.routerService = routerService;
		this.sidebarService = sidebarService;
		this.base = this.sidebarService.base;
		this.init();
	}

	init():void {
		if( typeof this.openAppsGroup !== "undefined" && this.sidebarService.items.findIndex( ( item ) => item === this.openAppsGroup ) !== - 1 ) return;
		this.openApps.clear();
		this.openAppsGroup = {
			type: "group",
			children: [],
			index: 100,
		};
		this.sidebarService.addItem( this.openAppsGroup );
	}

	addApp( app:App.Class ):void {
		if( this.openApps.has( app ) ) return;
		if( this.openApps.size === 0 ) this.addOpenAppsDivider();

		let removeAppEmitter:EventEmitter<SidebarGroup> = new EventEmitter<SidebarGroup>();
		removeAppEmitter.subscribe( () => {
			this.removeApp( app );
		} );

		let appSubmenu:SidebarSubmenu = {
			type: "submenu",
			name: app.name,
			closeable: true,
			onClose: removeAppEmitter,
			children: [
				{
					type: "link",
					name: "Dashboard",
					icon: "bar chart icon",
					route: [ this.base, "my-apps", app.slug ],
				},
				{
					type: "link",
					name: "Document Explorer",
					icon: "list layout icon",
					route: [ this.base, "my-apps", app.slug, "explore" ],
				},
				{
					type: "link",
					name: "SPARQL Client",
					icon: "terminal icon",
					route: [ this.base, "my-apps", app.slug, "sparql-client" ],
				},
				{
					type: "link",
					name: "Security",
					icon: "lock icon",
					route: [ this.base, "my-apps", app.slug, "security", "agents" ],
				},
				{
					type: "link",
					name: "Configuration",
					icon: "settings icon",
					route: [ this.base, "my-apps", app.slug, "configure" ],
				},
			]
		};
		this.openAppsGroup.children.push( appSubmenu );
		this.openApps.set( app, appSubmenu );
	}

	openApp( app:App.Class ):void {
		if( ! this.openApps.has( app ) ) return;

		let appSubmenu:SidebarSubmenu = this.openApps.get( app );
		appSubmenu.open = true;
	}

	closeApp( app:App.Class ):void {
		if( ! this.openApps.has( app ) ) return;

		let appSubmenu:SidebarSubmenu = this.openApps.get( app );
		appSubmenu.open = false;
	}

	removeApp( app:App.Class ):void {
		if( ! this.openApps.has( app ) ) return;

		let appSubmenu:SidebarSubmenu = this.openApps.get( app );
		this.openAppsGroup.children.splice( this.openAppsGroup.children.indexOf( appSubmenu ), 1 );
		this.openApps.delete( app );

		if( this.openApps.size === 0 ) this.removeOpenAppsDivider();
		if( this.routerService.isActive( [ "my-apps", app.slug ], false ) ) this.router.navigate( [ "my-apps" ] );
	}

	private addOpenAppsDivider():void {
		this.openAppsGroup.children.push( this.openAppsDivider );
	}

	private removeOpenAppsDivider():void {
		this.openAppsGroup.children.splice( this.openAppsGroup.children.indexOf( this.openAppsDivider ), 1 );
	}
}

