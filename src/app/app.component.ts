import { Component, ViewEncapsulation } from "@angular/core";
import { RouteConfig, ROUTER_DIRECTIVES, Router } from "@angular/router-deprecated";
import { Title } from "@angular/platform-browser";

import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";

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
	{ path: "**", as: "NotFoundError", component: NotFoundErrorView },
] )
export class AppComponent {
	router:Router;
	title:Title;

	constructor( title:Title, router:Router ) {
		this.router = router;
		this.title = title;
		this.router.subscribe( () => {
			this.defineTitle();
		} );
	}

	// TODO: Move this code to carbon-panel so it can be reused
	defineTitle() {
		let title:string = "";
		let rootComponent = this.router.root.currentInstruction.component.routeData.data[ "displayName" ];

		let auxRouter = this.router.root.currentInstruction.child;
		while( auxRouter !== null ) {
			let displayName = auxRouter.component.routeData.data[ "displayName" ];
			let mainComponent = auxRouter.component.routeData.data[ "main" ];
			let parameters = auxRouter.component.params;

			let parameter = null;
			for( let parameterName in parameters ) {
				if( ! parameters.hasOwnProperty( parameterName ) ) continue;
				if( parameter !== null ) {
					parameter = null;
					break;
				}
				parameter = parameters[ parameterName ];
			}

			if( parameter !== null ) {
				if( auxRouter.child === null ) {
					if( typeof displayName === 'undefined' ) title = "";
					else title += displayName + "(" + parameter + ") | ";
				} else {
					if( mainComponent )
						title += displayName + "(" + parameter + ") > ";
				}

			} else {
				if( auxRouter.child === null ) {
					if( typeof displayName === 'undefined' ) title = "";
					else title += displayName + " | ";
				} else {
					if( mainComponent ) title = title + displayName + " > ";
				}

			}
			auxRouter = auxRouter.child;
		}
		title += rootComponent;

		this.title.setTitle( title );

	}


}

export default AppComponent;
