import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Resolve, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import * as PersistedAgent from "carbonldp/Auth/PersistedAgent";

import { AgentsService } from "./agents.service";
import { AppContentService } from "app/root-content/app-content.service";

@Injectable()
export class AgentResolver implements Resolve<PersistedAgent.Class> {

	private router:Router;
	private activatedRoute:ActivatedRoute;
	private agentsService:AgentsService;
	private appContentService:AppContentService;


	constructor( router:Router, route:ActivatedRoute, agentsService:AgentsService, appContentService:AppContentService, private location:Location ) {
		this.router = router;
		this.activatedRoute = route;
		this.agentsService = agentsService;
		this.appContentService = appContentService;
	}


	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	resolve( route:ActivatedRouteSnapshot ):Promise<PersistedAgent.Class> | PersistedAgent.Class {
		let slug:string = route.params[ "agent-slug" ];
		return this.agentsService.get( slug, this.appContentService.activeApp.context ).then( ( agent:PersistedAgent.Class ) => {
			return agent;
		} ).catch( ( error:any ):boolean => {
			let url:string = this.location.path(),
				lastSlashIdx:number = url.lastIndexOf( "/" ),
				finalURL:string = url.substr( 0, lastSlashIdx ) + "/agent-not-found";
			this.router.navigate( [ finalURL ] );
			return false;
		} );
	}
}