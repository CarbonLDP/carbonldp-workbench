import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as URI from "carbonldp/RDF/URI";
import * as Utils from "carbonldp/Utils";

@Injectable()
export class AppContextService {

	carbon:Carbon;
	appContexts:Map<string, App.Context>;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.appContexts = new Map<string, App.Context>();
	}

	get( slug:string ):Promise<App.Context> {
		slug = this.removeTrailingSlash( slug );
		return new Promise<App.Context>( ( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
			if( this.appContexts.has( slug ) ) {
				resolve( this.appContexts.get( slug ) );
				return;
			}

			this.carbon.apps.getContext( slug + "/" ).then(
				( appContext:App.Context ) => {
					this.appContexts.set( slug, appContext );
					resolve( appContext );
				}
			).catch(
				( error ) => {
					console.log( error );
					reject( error );
				}
			);
		} );
	}

	getAll():Promise<App.Context[]> {
		return this.carbon.apps.getAllContexts().then( ( appContexts:App.Context[] ) => {
			this.appContexts.clear();
			appContexts
				.forEach( ( appContext:App.Context ) => {
					this.appContexts.set( this.getSlug( appContext ), appContext );
				} );

			return Utils.A.from( this.appContexts.values() );
		} );
	}

	getSlug( appContext:App.Context ):string {
		let uri:string = appContext.app.id;

		return this.removeTrailingSlash( URI.Util.getSlug( uri ) );
	}

	updateContext( uri:string ):Promise<App.Context> {
		let slug:string = this.removeTrailingSlash( uri );
		return this.carbon.apps.getContext( slug + "/" ).then( ( appContext:App.Context ) => {
			this.appContexts.set( slug, appContext );
			return appContext;
		} );
	}

	private removeTrailingSlash( slug:string ):string {
		if( slug.endsWith( "/" ) ) {
			return slug.substr( 0, slug.length - 1 );
		} else {
			return slug;
		}
	}
}

