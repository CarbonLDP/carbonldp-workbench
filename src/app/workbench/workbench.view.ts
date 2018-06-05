import { Component, Inject, EventEmitter } from "@angular/core";
import { Router, Event, NavigationEnd } from "@angular/router";

import { CarbonLDP } from "carbonldp";
import { User } from "carbonldp/Auth";

import { AuthService } from "app/authentication/services";
import { HeaderService } from "app/header/header.service";
import { SidebarService } from "app/sidebar/sidebar.service";


@Component( {
	selector: "div.ng-view",
	templateUrl: "./workbench.view.html",
	styleUrls: [ "./workbench.view.scss" ],
} )
export class WorkbenchView {

	private headerService:HeaderService;
	private sidebarService:SidebarService;
	private authService:AuthService.Class;
	private router:Router;
	private carbonldp:CarbonLDP;
	private prevUrl:string;
	private base:string;

	constructor( headerService:HeaderService, sidebarService:SidebarService, @Inject( AuthService.Token ) authService:AuthService.Class, router:Router, carbonldp:CarbonLDP ) {

		this.headerService = headerService;
		this.sidebarService = sidebarService;
		this.base = this.sidebarService.base;
		this.authService = authService;
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
		this.getAuthenticatedUser()
			.catch( error => console.error( error ) )
			.then( () => {
				this.populateHeader();
			} );
		this.populateSidebar();
	}

	toggleSidebar():void {
		this.sidebarService.toggle();
	}

	private getAuthenticatedUser():Promise<User> {
		return this.carbonldp.auth.authenticatedUser.resolve();
	}

	private populateHeader():void {
		this.headerService.clear();
		this.headerService.logo = {
			image: "assets/images/carbonldp-inverted-logo-small.png",
			route: [ "" ]
		};

		let onLogout:EventEmitter<boolean> = new EventEmitter<boolean>();
		onLogout.subscribe( ( event:any ) => {
			this.authService.logout();
			this.router.navigate( [ "/login" ] );
		} );

		let name:string = ! ! this.carbonldp.auth.authenticatedUser.name ? this.carbonldp.auth.authenticatedUser.name : "User";
		this.headerService.addItems( [
			{
				name: "Dashboard",
				route: [ "" ],
				index: 0,
			},
			{
				name: name,
				children: [
					{
						icon: "sign out icon",
						name: "Log Out",
						onClick: onLogout,
						index: 100,
					}
				],
				index: 100,
			}
		] );
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
			{
				type: "link",
				name: "Security",
				icon: "lock icon",
				route: [ this.base, "security", "users" ],
			},
			// {
			// 	type: "link",
			// 	name: "Configuration",
			// 	icon: "settings icon",
			// 	route: [ "configure" ],
			// }
		] );
	}
}