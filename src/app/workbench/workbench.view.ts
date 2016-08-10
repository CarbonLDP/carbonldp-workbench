import { Component, provide, Inject, EventEmitter } from "@angular/core";
import { Location } from "@angular/common";
import { Router, RouterOutlet, RouteConfig } from "@angular/router-deprecated";

import { Authenticated } from "angular2-carbonldp/decorators";
import { AuthService } from "angular2-carbonldp/services";

import { RouterService } from "carbon-panel/router.service";
import { HeaderService } from "carbon-panel/header.service";
import { HeaderComponent } from "carbon-panel/header.component";
import { SidebarService } from "carbon-panel/sidebar.service";
import { SidebarComponent } from "carbon-panel/sidebar.component";
import { MenuBarComponent } from "carbon-panel/menu-bar.component";
import { ErrorsAreaComponent } from "carbon-panel/errors-area/errors-area.component";
import { ErrorsAreaService } from "carbon-panel/errors-area/errors-area.service";

import { DashboardView } from "app/dashboard/dashboard.view";
import { MyAppsView } from "app/my-apps/my-apps.view";

import template from "./workbench.view.html!";
import style from "./workbench.view.css!text";

@Authenticated( { redirectTo: [ "/WorkbenchLogin" ] } )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [
		RouterOutlet,
		HeaderComponent,
		SidebarComponent,
		MenuBarComponent,
		ErrorsAreaComponent,
	],
	providers: [
		provide( RouterService, {
			useFactory: ( router: Router, location: Location ): RouterService => {
				return new RouterService( router, location );
			},
			deps: [ Router, Location ]
		} ),
		provide( HeaderService, { useClass: HeaderService } ),
		provide( SidebarService, { useClass: SidebarService } ),
		provide( ErrorsAreaService, { useClass: ErrorsAreaService } ),
	]
} )
@RouteConfig( [
	{
		path: "/",
		as: "Dashboard",
		component: DashboardView,
		useAsDefault: true,
		data: {
			alias: "Dashboard",
			displayName: "Dashboard",
		},
	},
	{
		path: "/my-apps/...",
		as: "MyApps",
		component: MyAppsView,
		data: {
			alias: "MyApps",
			displayName: "My Apps",
		},
	},
] )
export class WorkbenchView {

	private headerService: HeaderService;
	private sidebarService: SidebarService;
	private authService: AuthService.Class;
	private router: Router;
	private prevUrl: string;

	constructor( headerService: HeaderService, sidebarService: SidebarService, @Inject( AuthService.Token ) authService: AuthService.Class, router: Router ) {
		this.headerService = headerService;
		this.sidebarService = sidebarService;
		this.authService = authService;
		this.router = router;
		this.router.parent.subscribe( ( url )=> {
			if( this.prevUrl !== url ) {
				document.querySelector( ".scrollable-content" ).scrollTop = 0;
				this.prevUrl = url;
			}
		} );
	}


	ngOnInit(): void {
		this.populateHeader();
		this.populateSidebar();
	}

	toggleSidebar(): void {
		this.sidebarService.toggle();
	}

	private populateHeader(): void {
		this.headerService.logo = {
			image: "assets/images/carbon-ldp-logo-lg.png",
			route: [ "./Dashboard" ]
		};

		let onLogout: EventEmitter<any> = new EventEmitter<any>();
		onLogout.subscribe( ( event: any ) => {
			this.authService.logout();
			this.router.navigate( [ "/WorkbenchLogin" ] );
		} );

		this.headerService.addItems( [
			{
				name: "Dashboard",
				route: [ "./Dashboard" ],
				index: 0,
			},
			{
				name: "User",
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

	private populateSidebar(): void {
		this.sidebarService.addItems( [
			{
				type: "link",
				name: "Dashboard",
				route: [ "./Dashboard" ],
				index: 0,
			},
			{
				type: "link",
				name: "Apps",
				route: [ "./MyApps" ]
			}
		] );
	}
}

export default WorkbenchView;
