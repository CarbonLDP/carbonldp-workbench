import {Component, provide, Inject, EventEmitter} from "@angular/core";
import {Router, RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {Authenticated} from "angular2-carbonldp/decorators";
import {AuthService} from "angular2-carbonldp/services";

import {HeaderService} from "carbon-panel/header.service";
import {HeaderComponent} from "carbon-panel/header.component";
import {SidebarService} from "carbon-panel/sidebar.service";
import {SidebarComponent} from "carbon-panel/sidebar.component";

import {DashboardView} from "app/dashboard.view";

import template from "./workbench.view.html!";
import style from "./workbench.view.css!text";

@Authenticated( {redirectTo: [ "/WorkbenchLogin" ]} )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ ROUTER_DIRECTIVES, HeaderComponent, SidebarComponent ],
	providers: [
		provide( HeaderService, {useClass: HeaderService} ),
		provide( SidebarService, {useClass: SidebarService} )
	]
} )
@RouteConfig( [
	{path: "dashboard", as: "Dashboard", component: DashboardView, useAsDefault: true},
] )
export class WorkbenchView {
	constructor( private headerService:HeaderService,
	             private sidebarService:SidebarService,
	             @Inject( AuthService.Token ) private authService:AuthService.Class,
	             private router:Router ) {}

	ngOnInit():void {
		let logoutEmitter:EventEmitter<any> = new EventEmitter<any>();

		this.headerService.logo = {
			route: [ "./Dashboard" ],
			image: "assets/images/carbon-ldp-logo-lg.png"
		};
		this.headerService.addItems( [
			{
				name: "Dashboard",
				route: [ "./Dashboard" ]
			},
			{
				name: "User",
				children: [
					{
						name: "Log Out",
						icon: "sign out icon",
						onClick: logoutEmitter
					}
				]
			}
		] );

		this.sidebarService.addItems( [
			{
				type: "link",
				name: "Dashboard",
				route: [ "./Dashboard" ]
			},
			{
				type: "group",
				children: [
					{
						type: "divider",
						name: "Opened Apps",
					},
					{
						type: "divider",
						name: "Some Apps",
					}
				]
			},
			{
				type: "submenu",
				name: "My App",
				children: [
					{
						type: "link",
						name: "Link 1",
						route: [ "./Dashboard" ]
					}
				]
			},
			{
				type: "link",
				name: "Dashboard",
				route: [ "./Dashboard" ],
			},
		] );

		logoutEmitter.subscribe( () => {
			this.authService.logout();
			this.router.navigate( [ "/WorkbenchLogin" ] );
		} );
	}
}

export default WorkbenchView;
