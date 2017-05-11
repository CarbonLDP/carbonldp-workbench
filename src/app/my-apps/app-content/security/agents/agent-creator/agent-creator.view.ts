import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { PersistedAgent } from "carbonldp/Auth";

import { AppContentService } from "app/root-content/app-content.service";
import { Modes } from "../agent-details/agent-details.component";

@Component( {
	selector: "cw-agent-creator-view",
	templateUrl: "./agent-creator.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class AgentCreatorView {

	private router:Router;
	private activatedRoute:ActivatedRoute;

	private app:any;
	private agent:PersistedAgent.Class;
	
	public Modes:typeof Modes = Modes;
	public canDisplay:boolean = true;

	constructor( router:Router, route:ActivatedRoute, appContentService:AppContentService, private location:Location ) {
		this.router = router;
		this.activatedRoute = route;

		this.app = appContentService.activeApp;
		appContentService.onAppHasChanged.subscribe( ( app:any ) => {
			this.app = app;
			this.canDisplay = false;
			setTimeout( () => { this.canDisplay = true;}, 0 );
		} );
	}

	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	goToAgents():void {
		let url:string = this.location.path(),
			lastSlashIdx:number = url.lastIndexOf( "/" ),
			finalURL:string = url.substr( 0, lastSlashIdx );
		this.router.navigate( [ finalURL ] );
	}

}

