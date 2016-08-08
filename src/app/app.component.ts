import { Component, ViewEncapsulation } from "@angular/core";
import {ROUTER_DIRECTIVES, RouteConfig, Router} from "@angular/router-deprecated";
import {Title} from "@angular/platform-browser";

import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";

import template from "./app.component.html!";
import style from "./app.component.css!text";

@Component( {
	selector: "app",
	template: template,
	styles: [ style ],
	encapsulation: ViewEncapsulation.None,
	directives: [ ROUTER_DIRECTIVES ]
} )
@RouteConfig( [
	{
		path: "login",
		as: "WorkbenchLogin",
		component: LoginView,
		data: {
			alias: "WorkbenchLogin",
			displayName: "Workbench Log In",
		}
	},
	{
		path: "...",
		as: "Workbench",
		component: WorkbenchView,
		useAsDefault: true,
		data: {
			alias: "Workbench",
			displayName: "Workbench",
		},
	},
] )
export class AppComponent {
	router: Router;
	title: Title;

	constructor( title: Title, router: Router ) {
		this.router = router;
		this.title = title;
		this.router.subscribe( ( url ) => {
			this.defineTitle( url );
		} );
	}

	defineTitle( url ) {
		let title: string = "";
		let rootComponent = this.router.root.currentInstruction.component.routeData.data[ "displayName" ];
		let displayName;
		let auxRouter = this.router.root.currentInstruction.child;
		if( rootComponent === "Home" ) {
			while ( auxRouter !== null ) {
				displayName = auxRouter.component.routeData.data[ "displayName" ];
				if( displayName === "App" ) {
					if( auxRouter.child === null )
						title = title + displayName + " | ";
					else
						title = title + displayName + " > ";
				}
				else {
					if( auxRouter.child === null )
						if( typeof displayName === 'undefined' )
							title = "";
						else
							title = title + displayName + " | ";

				}
				auxRouter = auxRouter.child;
			}
		}
		else
		{
			while ( auxRouter !== null ) {
				if( auxRouter.child === null ) {
					displayName = auxRouter.component.routeData.data[ "displayName" ];
					if( typeof displayName === 'undefined' )
						title = "";
					else
						title = title + displayName + " | ";
				}
				auxRouter = auxRouter.child;
			}

		}
		rootComponent = "Carbon LDP";
		title = title + rootComponent;
		if( title === "Home | Carbon LDP" )
			title = "Dashboard | Carbon LDP";
		this.title.setTitle( title );

	}


}

export default AppComponent;
