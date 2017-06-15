import * as URI from "carbonldp/RDF/URI";

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
		let slug:string = URI.Util.getSlug( documentURI ),
			slugIdx:number = documentURI.indexOf( slug );
		return documentURI.substr( 0, slugIdx );
	}
}
