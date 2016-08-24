import { Component, ViewEncapsulation } from "@angular/core";
import { Router, Event, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";

import template from "./app.component.html!";
import style from "./app.component.css!text";

@Component( {
	selector: "app",
	template: template,
	styles: [ style ],
	encapsulation: ViewEncapsulation.None,
	//directives: [ ROUTER_DIRECTIVES ]
} )
export class AppComponent {
	router:Router;
	title:Title;
	route:ActivatedRoute

	constructor( title:Title, router:Router, route:ActivatedRoute) {
		this.router = router;
		this.title = title;
		this.route = route;

		this.router.events.subscribe( ( event:Event ) => {
			if( event instanceof NavigationEnd ) {
				this.defineTitle();
			}
		} );
	}

	// TODO: Move this code to carbon-panel so it can be reused
	defineTitle() {
		let title:string = "";
		let rootComponent = this.route.children[0].data.value["displayName"];
		let auxRouter = this.route.children[0];

		while( typeof auxRouter !== 'undefined' ) {
			let displayName = auxRouter.data.value[ "displayName" ];
			let mainComponent = auxRouter.data[ "main" ];
			//TODO: missing slug in title: add parameters section to obtain slug for applications.
			//let parameters = auxRouter.params;

			let parameter = null;
			//for( let parameterName in parameters ) {
			//	if( ! parameters.hasOwnProperty( parameterName ) ) continue;
			//	if( parameter !== null ) {
			//		parameter = null;
			//		break;
			//	}
			//	parameter = parameters[ parameterName ];
			//}

			if( parameter !== null ) {
				if( typeof auxRouter.children[0] === 'undefined' ) {
					if( typeof displayName === 'undefined' ) title = "";
					else title += displayName + "(" + parameter + ") | ";
				} else {
					if( mainComponent )
						title += displayName + "(" + parameter + ") > ";
				}

			} else {
				if( typeof auxRouter.children[0] === 'undefined' ) {
					if( typeof displayName === 'undefined' ) title = "";
					else title += displayName + " | ";
				} else {
					if( mainComponent ) title = title + displayName + " > ";
				}

			}
			auxRouter = auxRouter.children[0];
		}
		title += rootComponent;

		this.title.setTitle( title );

	}


}

export default AppComponent;
