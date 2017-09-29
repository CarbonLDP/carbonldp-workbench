import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Resolve, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Class as Carbon } from "carbonldp/Carbon";
import * as Role from "carbonldp/Auth/Role";
import * as NS from "carbonldp/NS";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";

import { RolesService } from "./roles.service";

@Injectable()
export class RoleResolver implements Resolve<PersistedRole.Class | boolean> {

	private router:Router;
	private carbon:Carbon;
	private activatedRoute:ActivatedRoute;
	private rolesService:RolesService;


	constructor( router:Router, carbon:Carbon, route:ActivatedRoute, rolesService:RolesService, private location:Location ) {
		this.router = router;
		this.carbon = carbon;
		this.activatedRoute = route;
		this.rolesService = rolesService;
	}


	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	resolve( route:ActivatedRouteSnapshot, state:RouterStateSnapshot ):Promise<PersistedRole.Class | boolean> {
		let slug:string = route.params[ "role-slug" ];
		// TODO: Remove extendObjectSchema when SDK implements description and childRole
		this.carbon.extendObjectSchema( Role.RDF_CLASS, {
			"description": {
				"@id": NS.CS.Predicate.description,
				"@type": "string"
			},
			"childRole": {
				"@id": NS.CS.Predicate.childRole,
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