import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Resolve, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { CarbonLDP } from "carbonldp";
import * as Role from "carbonldp/Auth/Role";
import { CS } from "carbonldp/Vocabularies";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";

import { RolesService } from "./roles.service";

@Injectable()
export class RoleResolver implements Resolve<PersistedRole.Class | boolean> {

	private router:Router;
	private carbonldp:CarbonLDP;
	private activatedRoute:ActivatedRoute;
	private rolesService:RolesService;


	constructor( router:Router, carbonldp:CarbonLDP, route:ActivatedRoute, rolesService:RolesService, private location:Location ) {
		this.router = router;
		this.carbonldp = carbonldp;
		this.activatedRoute = route;
		this.rolesService = rolesService;
	}


	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	resolve( route:ActivatedRouteSnapshot, state:RouterStateSnapshot ):Promise<PersistedRole.Class | boolean> {
		let slug:string = route.params[ "role-slug" ];
		// TODO: Remove extendObjectSchema when SDK implements description and childRole
		this.carbonldp.extendObjectSchema( Role.RDF_CLASS, {
			"description": {
				"@id": CS.description,
				"@type": "string"
			},
			"childRole": {
				"@id": CS.childRole,
				"@container": "@set"
			}
		} );

		return this.rolesService.get( slug ).then( ( role:PersistedRole.Class ) => {
			return role;
		} ).catch( ( error:any ):boolean => {
			let url:string = this.location.path(),
				lastSlashIdx:number = url.lastIndexOf( "/" ),
				finalURL:string = url.substr( 0, lastSlashIdx ) + "/role-not-found";
			this.router.navigate( [ finalURL ] );
			return false;
		} );
	}
}