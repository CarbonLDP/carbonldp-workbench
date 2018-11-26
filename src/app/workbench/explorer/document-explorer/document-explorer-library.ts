import { URI } from "carbonldp/RDF/URI";

import { PropertyStatus } from "./property/property.component";

export class DocumentExplorerLibrary {
	public static getSanitizedSlug( slug:string ):string {
		if( ! slug ) return slug;
		return slug.toLowerCase().replace( / - | -|- /g, "-" ).replace( /[^-\w ]+/g, "" ).replace( / +/g, "-" );
	}

	public static getAppendedSlashSlug( slug:string ):string {
		if( ! slug ) return slug;
		if( ! slug.endsWith( "/" ) && slug.trim() !== "" ) slug += "/";
		return slug;
	}

	public static getParentURI( documentURI:string ):string {
		let slug:string = URI.getSlug( documentURI ),
			slugIdx:number = documentURI.indexOf( slug );
		return documentURI.substr( 0, slugIdx );
	}

	public static isValidURL( value:string ):boolean {
		// TODO: Change the try/catch to a more appropriate URI verification using RegEx
		try {
			decodeURI( value );
			return true;
		} catch( e ) {
			return false;
		}
	}
}

export class ResourceRecords {
	changes:Map<string, PropertyStatus> = new Map<string, PropertyStatus>();
	deletions:Map<string, PropertyStatus> = new Map<string, PropertyStatus>();
	additions:Map<string, PropertyStatus> = new Map<string, PropertyStatus>();

	clear():void {
		this.changes.clear();
		this.deletions.clear();
		this.additions.clear();
	}
}


export enum JsonLDKeyword {
	GRAPH = "@graph",
	ID = "@id",
	VALUE = "@value",
	TYPE = "@type",
	LANGUAGE = "@language",
	LIST = "@list",
	SET = "@set",
}

export enum Modes {
	EDIT = "EDIT",
	READ = "READ",
}
