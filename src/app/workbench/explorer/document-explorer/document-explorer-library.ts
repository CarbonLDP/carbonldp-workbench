import { CarbonLDP } from "carbonldp";
import { URI } from "carbonldp/RDF";
import { RDFNode } from "carbonldp/RDF";

import { Property, PropertyStatus } from "./property/property.component";

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

/*
*   Add options for resources (Document, Blank Nodes and Named Fragments)
*   to allow them to keep a record of the changes made to their properties
* */
export class ResourceFeatures {
	carbonldp:CarbonLDP;

	records:ResourceRecords;
	rootNode:RDFNode;
	properties:PropertyStatus[];
	existingPropertiesNames:string[] = [];
	insertOrder:number = 1;
	resourceHasChanged:boolean;
	accessPointsHasMemberRelationProperties:string[] = [];


	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}


	/*
	*   Changes the property in the records
	*   and updates the existing properties
	* */
	changeProperty( property:PropertyStatus, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new ResourceRecords();
		if( typeof property.modified !== "undefined" ) {
			this.records.changes.set( property.modified.id, property );
		} else if( typeof property.added === "undefined" ) {
			this.records.changes.delete( property.copy.id );
		}
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			property.added.id = property.added.name;
			this.records.additions.set( property.added.id, property );
		}
		this.updateExistingProperties();
	}


	/*
	*   Deletes a property from the records
	*   and updates the existing properties
	* */
	deleteProperty( property:PropertyStatus, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new ResourceRecords();
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			this.properties.splice( index, 1 );
		} else if( typeof property.deleted !== "undefined" ) {
			this.records.deletions.set( property.deleted.id, property );
		}
		this.updateExistingProperties();
	}


	/*
	*   Adds a new property to the recrods
	*   and updates the existing properties
	* */
	addProperty( property:PropertyStatus, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new ResourceRecords();
		if( typeof property.added !== "undefined" ) {
			if( property.added.id === property.added.name ) {
				this.records.additions.set( property.added.id, property );
			} else {
				this.records.additions.delete( property.added.id );
				property.added.id = property.added.name;
				this.records.additions.set( property.added.name, property );
			}
		}
		this.updateExistingProperties();
	}


	/*
	*   Creates a new empty property.
	* */
	createProperty( property:Property, propertyStatus:PropertyStatus ):void {
		let numberOfProperty:number = ! ! this.records ? (this.records.additions.size + 1) : 1;
		let newProperty:PropertyStatus = {
			added: <Property>{
				id: "",
				name: `${this.carbonldp.baseURI}vocabularies/main/#newProperty${numberOfProperty}`,
				value: []
			},
			isBeingCreated: true
		};
		this.properties.splice( this.insertOrder, 0, newProperty );
	}


	/*
	*   Updates the properties and the existing properties names with the
	*   content of the records.
	* */
	updateExistingProperties():void {
		this.properties = [];
		this.existingPropertiesNames = Object.keys( this.rootNode );
		// Add hasMemberRelationProperties
		this.existingPropertiesNames.splice( this.existingPropertiesNames.length - 3, 0, ...this.accessPointsHasMemberRelationProperties );
		// Remove duplicated properties
		this.existingPropertiesNames = this.existingPropertiesNames.filter( ( name:string, index:number, array:string[] ) => array.indexOf( name ) === index );
		// Fill exisiting properties
		this.existingPropertiesNames.forEach( ( propName:string ) => {
			this.properties.push( {
				copy: {
					id: propName,
					name: propName,
					value: typeof this.rootNode[ propName ] !== "undefined" ? this.rootNode[ propName ] : []
				}
			} );
		} );
		if( ! this.records ) return;


		// Add added properties to the existing properties names and records
		this.records.additions.forEach( ( value:PropertyStatus, key:string ) => {
			this.existingPropertiesNames.push( key );
			this.properties.splice( this.insertOrder, 0, value );
		} );


		// Modify the properties that were modified
		let idx:number;
		this.records.changes.forEach( ( value:PropertyStatus, key:string ) => {
			// If the name of the property was changed, update the names of existing properties
			if( value.modified.id !== value.modified.name ) {
				idx = this.existingPropertiesNames.indexOf( value.modified.id );
				if( idx !== - 1 ) this.existingPropertiesNames.splice( idx, 1, value.modified.name );
			}

			// Replace the modified property
			idx = this.properties.findIndex( ( property:PropertyStatus ) => {
				return ! ! property.copy && property.copy.id === key;
			} );
			if( idx !== - 1 ) this.properties.splice( idx, 1, value );
		} );


		// Remove deleted properties from the existing properties names and records
		this.records.deletions.forEach( ( value:PropertyStatus, key:string ) => {
			// Find index from existing properties names and delete it
			idx = this.existingPropertiesNames.indexOf( key );
			if( idx !== - 1 ) this.existingPropertiesNames.splice( idx, 1 );

			// Find index from existing properties and delete it
			idx = this.properties.findIndex( ( property:PropertyStatus ) => {
				return ! ! property.copy && property.copy.id === key;
			} );
			if( idx !== - 1 ) this.properties.splice( idx, 1 );
		} );
		this.resourceHasChanged = this.records.changes.size > 0 || this.records.additions.size > 0 || this.records.deletions.size > 0;
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
