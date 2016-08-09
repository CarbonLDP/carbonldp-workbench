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
		this.router.subscribe( ( ) => {
			this.defineTitle( );
		} );
	}

	defineTitle( ) {
		let title: string = "";
		let rootComponent = this.router.root.currentInstruction.component.routeData.data[ "displayName" ];
		let slug;
		let displayName;
		let auxRouter = this.router.root.currentInstruction.child;
			while ( auxRouter !== null ) {
				displayName = auxRouter.component.routeData.data[ "displayName" ];
				slug = auxRouter.component.params[ "slug" ];
				if( (slug !== null) && (typeof slug !== 'undefined') ) {
					if( displayName === "App" ) {
						title += displayName + "(" + slug + ") > ";
					}
					else {
						if( auxRouter.child === null )
							if( typeof displayName === 'undefined' )
								title = "";
							else
								title += displayName + "(" + slug + ") | ";
					}
				}
				else {
					if( displayName === "App" ) {
						title = title + displayName + " > ";
					}
					else {
						if( auxRouter.child === null )
							if( typeof displayName === 'undefined' )
								title = "";
							else
								title += displayName + " | ";
					}

				}
				auxRouter = auxRouter.child;}
		title += rootComponent;

		this.title.setTitle( title );

	}


}

export default AppComponent;
