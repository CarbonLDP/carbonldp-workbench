import { Component, provide, Inject, EventEmitter } from "@angular/core";
import { Location } from "@angular/common";
import { Router, RouterOutlet, RouteConfig } from "@angular/router-deprecated";

import Carbon from "carbonldp/Carbon";

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
import { MyAppsSidebarService } from "carbon-panel/my-apps/my-apps-sidebar.service";

import { MyAppsView } from "carbon-panel/my-apps/my-apps.view";

import { DashboardView } from "app/dashboard/dashboard.view";

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

		// If we provide MyAppsSidebarService inside of my-apps.view, Angular would create a new instance each time my-apps is revisited
		// leading to duplicate entries in the sidebar
		provide( MyAppsSidebarService, { useClass: MyAppsSidebarService } ),
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
	private carbon: Carbon;

	constructor( headerService: HeaderService, sidebarService: SidebarService, @Inject( AuthService.Token ) authService: AuthService.Class, router: Router, carbon: Carbon ) {
		this.headerService = headerService;
		this.sidebarService = sidebarService;
		this.authService = authService;
		this.router = router;
		this.carbon = carbon;
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

		let name: string = this.carbon.auth.authenticatedAgent[ "name" ] ? this.carbon.auth.authenticatedAgent.name : "User";

		this.headerService.addItems( [
			{
				name: "Dashboard",
				route: [ "./Dashboard" ],
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
