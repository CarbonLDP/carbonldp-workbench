import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import * as CarbonApp from "carbonldp/App";
import * as App from "./app";

import { AppContextService } from "./../app-context.service";
import { AppContentService } from "./app-content.service";

@Injectable()
export class AppContentResolver implements Resolve<App.Class> {

	private router:Router;
	private activatedRoute:ActivatedRoute;
	private appContextService:AppContextService;
	private appContentService:AppContentService;


	constructor( router:Router, route:ActivatedRoute, appContextService:AppContextService, appContentService:AppContentService ) {
		this.router = router;
		this.activatedRoute = route;
		this.appContextService = appContextService;
		this.appContentService = appContentService;
	}


	resolve( route:ActivatedRouteSnapshot ):Promise<App.Class> | App.Class {
		let slug:string = route.params[ "slug" ];
		return this.appContextService.get( slug ).then( ( appContext:CarbonApp.Context ) => {
			let app:App.Class = App.Factory.createFrom( appContext );
			this.appContentService.activeApp = app;
			return app;
		} ).catch( ( error:any ):boolean => {
			console.error( error );
			this.router.navigate( [ "my-apps", "app-not-found" ] );
			return false;
		} );
	}
}