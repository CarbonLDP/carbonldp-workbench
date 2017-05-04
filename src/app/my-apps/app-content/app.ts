import * as CarbonApp from "carbonldp/App";
import * as PersistedApp from "carbonldp/PersistedApp";
import * as URI from "carbonldp/RDF/URI";

export interface Class extends PersistedApp.Class {
	slug:string;
	context:CarbonApp.Context;
}

export class Factory {
	static createFrom( appContext:CarbonApp.Context ):Class {
		let app:Class = <any>appContext.app;
		if( ! ( "slug" in app ) ) {
			Object.defineProperty( app, "slug", {
				configurable: true,
				enumerable: false,
				get: function() {
					return Util.getSlug( this );
				}
			} );
		}
		if( ! ( "context" in app ) ) {
			Object.defineProperty( app, "context", {
				configurable: true,
				enumerable: false,
				writable: false,
				value: appContext
			} );
		}

		return app;
	}
}

export class Util {
	static getSlug( app:PersistedApp.Class ):string {
		let uri:string = app.id;
		return Util.removeTrailingSlash( URI.Util.getSlug( uri ) );
	}

	private static removeTrailingSlash( slug:string ):string {
		if( slug.endsWith( "/" ) ) {
			return slug.substr( 0, slug.length - 1 );
		} else {
			return slug;
		}
	}
}

