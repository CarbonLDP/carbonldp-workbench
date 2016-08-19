import { Component, ViewEncapsulation } from "@angular/core";
import { ROUTER_DIRECTIVES, Router, Event, NavigationEnd } from "@angular/router";
import { Title } from "@angular/platform-browser";

import template from "./app.component.html!";
import style from "./app.component.css!text";

@Component( {
	selector: "app",
	template: template,
	styles: [ style ],
	encapsulation: ViewEncapsulation.None,
	directives: [ ROUTER_DIRECTIVES ]
} )
export class AppComponent {
	router:Router;
	title:Title;

	constructor( title:Title, router:Router ) {
		this.router = router;
		this.title = title;

		this.router.events.subscribe( ( event:Event ) => {
			if( event instanceof NavigationEnd ) {
				// this.defineTitle();
			}
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
