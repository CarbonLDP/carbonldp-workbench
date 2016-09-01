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
} )
export class AppComponent {
	router:Router;
	title:Title;
	route:ActivatedRoute

	constructor( title:Title, router:Router, route:ActivatedRoute ) {
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
		let rootComponent = this.route.children[ 0 ].data.value[ "displayName" ];
		let auxRouter = this.route.children[ 0 ];
		let mainFlag = false;
		while( typeof auxRouter !== 'undefined' ) {
			let displayName = auxRouter.data.value[ "displayName" ];
			let mainComponent = auxRouter.data.value[ "main" ];
			let parameter = auxRouter.data.value[ "param" ];

			let appName = null;
			appName = auxRouter.params.value[ parameter ];

			if( typeof appName !== 'undefined' && appName !== null ) {
				if ( typeof displayName !== 'undefined' && mainFlag ){
					title += " > ";
					mainFlag = false;
				}
				if( typeof auxRouter.children[ 0 ] === 'undefined' ) {
					if( typeof displayName !== 'undefined' );
					title += displayName + "(" + appName + ")";
				} else {
					if( mainComponent ){
						title += displayName + "(" + appName + ")";
						mainFlag = true;
					}
				}

			} else {
				if ( typeof displayName !== 'undefined' && mainFlag ){
					title += " > ";
					mainFlag = false;
				}
				if( typeof auxRouter.children[ 0 ] === 'undefined' ) {
					if( typeof displayName !== 'undefined' )
						title += displayName;
				} else {
					if( mainComponent ){
						title = title + displayName;
						mainFlag = true;
					}
				}

			}
			auxRouter = auxRouter.children[ 0 ];

		}

		if( title )
		title += " | "+rootComponent;
		else
		title = rootComponent;

		this.title.setTitle( title );

	}



}

export default AppComponent;
