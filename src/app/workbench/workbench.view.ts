import { Component, Inject, EventEmitter } from "@angular/core";
import { Router, Event, NavigationStart } from "@angular/router";

import Carbon from "carbonldp/Carbon";

import { AuthService } from "angular2-carbonldp/services";
import { HeaderService } from "carbon-panel/header.service";
import { SidebarService } from "carbon-panel/sidebar.service";

import template from "./workbench.view.html!";
import style from "./workbench.view.css!text";

@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
} )
export class WorkbenchView {

	private headerService:HeaderService;
	private sidebarService:SidebarService;
	private authService:AuthService.Class;
	private router:Router;
	private carbon:Carbon;
	private prevUrl:string;

	constructor( headerService:HeaderService, sidebarService:SidebarService, @Inject( AuthService.Token ) authService:AuthService.Class, router:Router, carbon:Carbon ) {

		this.headerService = headerService;
		this.sidebarService = sidebarService;
		this.authService = authService;
		this.router = router;
		this.carbon = carbon;
		this.router.events.subscribe( ( event:Event )=> {
			let url:string = "";
			if ( event instanceof NavigationStart ){
				url = event.url;
				if( this.prevUrl !== url ) {
					document.querySelector( ".scrollable-content" ).scrollTop = 0;
					this.prevUrl = url;
				}
			}
		} );
	}


	ngOnInit():void {
		this.populateHeader();
		this.populateSidebar();
	}

	toggleSidebar():void {
		this.sidebarService.toggle();
	}

	private populateHeader():void {
		this.headerService.clear();
		this.headerService.logo = {
			image: "assets/images/carbon-ldp-logo-lg.png",
			route: [ "" ]
		};

		let onLogout:EventEmitter<any> = new EventEmitter<any>();
		onLogout.subscribe( ( event:any ) => {
			this.authService.logout();
			this.router.navigate( [ "/login" ] );
		} );

		let name:string = this.carbon.auth.authenticatedAgent[ "name" ] ? this.carbon.auth.authenticatedAgent.name : "User";
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
				route: [ "" ],
				index: 0,
			},
			{
				type: "link",
				name: "Apps",
				route: [ "", "my-apps" ]
			}
		] );
	}
}

export default WorkbenchView;
