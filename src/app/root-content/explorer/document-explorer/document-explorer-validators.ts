import * as NS from "carbonldp/NS";
import * as Utils from "carbonldp/Utils";
import * as SDKLiteral from "carbonldp/RDF/Literal";
import * as URI from "carbonldp/RDF/URI";

import { Directive, Input, OnChanges, SimpleChanges } from "@angular/core";
import { AbstractControl, Validator, NG_VALIDATORS } from "@angular/forms";

@Directive( {
	selector: "[cw-property-name]",
	providers: [ { provide: NG_VALIDATORS, useExisting: PropertyNameValidator, multi: true } ]
} )
export class PropertyNameValidator implements Validator, OnChanges {
	@Input() existingProperties;
	@Input() property;
	@Input() id;
	@Input() originalName;
	@Input() control;
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );

	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [key:string]:any; } {

		if( ! ! control ) {
			if( typeof control.value === "undefined" || control.value === null || ! control.value ) return null;
			if( this.existingProperties.indexOf( encodeURI( control.value ) ) !== - 1 && (this.property.added ? this.id !== encodeURI( control.value ) : this.originalName !== encodeURI( control.value )) ) return { "duplicatedPropertyName": true };
			if( ! this.url.test( control.value ) ) return { "invalidName": true };
			if( control.value.split( "#" ).length > 2 ) return { "duplicatedHashtag": true };
		}
		return null;
	}
}

@Directive( {
	selector: "[cw-property-id]",
	providers: [ { provide: NG_VALIDATORS, useExisting: IdValidator, multi: true } ]
} )
export class IdValidator implements Validator, OnChanges {
	@Input() existingFragments;
	@Input() property;
	@Input() documentURI;
	@Input() id;
	@Input() originalId;
	@Input() control;
	// url = new RegExp( "(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})", "g" );
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );


	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [key:string]:any; } {

		if( ! ! control ) {
			if( typeof control.value === "undefined" || control.value === null || ! control.value ) return null;
			if( typeof control.value === "string" && ! control.value.startsWith( this.documentURI ) ) return { "invalidParent": true };
			if( this.existingFragments.indexOf( control.value ) !== - 1 && (this.property.added ? this.id !== control.value : this.originalId !== control.value) ) return { "duplicatedNamedFragmentName": true };
			if( control.value.split( "#" ).length > 2 ) return { "duplicatedHashtag": true };
		}
		return null;
	}
}


@Directive( {
	selector: "[cw-literal-value]",
	providers: [ { provide: NG_VALIDATORS, useExisting: LiteralValueValidator, multi: true } ]
} )

export class LiteralValueValidator implements Validator, OnChanges {
	@Input() type;
	@Input() control;

	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [key:string]:any; } {
		let valid:boolean;
		switch( this.type ) {
			// Boolean
			case NS.XSD.DataType.boolean:
				switch( control.value ) {
					case "true":
					case "yes":
					case "y":
					case "1":
					case "false":
					case "no":
					case "n":
					case "0":
						valid = true;
				}
				break;

			// Numbers
			case NS.XSD.DataType.int :
			case NS.XSD.DataType.integer :
				valid = ! isNaN( control.value ) && ! isNaN( SDKLiteral.Factory.parse( control.value, this.type ) ) && Utils.isInteger( SDKLiteral.Factory.parse( control.value, this.type ) );
				break;

			case NS.XSD.DataType.byte :
			case NS.XSD.DataType.decimal :
			case NS.XSD.DataType.long :
			case NS.XSD.DataType.negativeInteger :
			case NS.XSD.DataType.nonNegativeInteger :
			case NS.XSD.DataType.nonPositiveInteger :
			case NS.XSD.DataType.positiveInteger :
			case NS.XSD.DataType.short :
			case NS.XSD.DataType.unsignedLong :
			case NS.XSD.DataType.unsignedInt :
			case NS.XSD.DataType.unsignedShort :
			case NS.XSD.DataType.unsignedByte :
			case NS.XSD.DataType.double :
			case NS.XSD.DataType.float :
				valid = ! isNaN( control.value ) && ! isNaN( SDKLiteral.Factory.parse( control.value, this.type ) ) && Utils.isNumber( SDKLiteral.Factory.parse( control.value, this.type ) );
				break;

			// Dates
			case NS.XSD.DataType.date:
			case NS.XSD.DataType.dateTime:
			case NS.XSD.DataType.time:
				valid = Utils.isDate( SDKLiteral.Factory.parse( control.value, this.type ) );
				break;

			case NS.XSD.DataType.string:
				valid = Utils.isString( SDKLiteral.Factory.parse( control.value, this.type ) );
				break;

			default:
				valid = Utils.isString( control.value );
				break;
		}
		if( ! valid ) {
			return { "invalidTypeError": true };
		}
		return null;

	}
}

@Directive( {
	selector: "[cw-pointer-id]",
	providers: [ { provide: NG_VALIDATORS, useExisting: PointerValidator, multi: true } ]
} )
export class PointerValidator implements Validator {
	@Input() documentURI;
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );

	validate( control:AbstractControl ):{ [key:string]:any; } {
		if( ! ! control && typeof control.value === "undefined" ) {
			return { "emptyControl": true };
		}
		if( ! ! control.value ) {
			if( URI.Util.isBNodeID( control.value ) || this.url.test( control.value ) ) return null;
			return { "invalidId": true };
		}
		return null;

	}
}