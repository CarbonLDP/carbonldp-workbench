import { Errors } from "carbonldp/HTTP";
import { JSONLDParser } from "carbonldp/JSONLD";
import { C } from "carbonldp/Vocabularies";

import { Message, Types, ValidationDetails, ValidationError, ValidationResult } from "../message.component";
import { Response } from "../../../../../../carbonldp-js-sdk/dist/HTTP/Response";
import { RDFDocument } from "../../../../../../carbonldp-js-sdk/dist/RDF/Document";
import { RDFNode } from "../../../../../../carbonldp-js-sdk/src/RDF/Node";


export class ErrorMessageGenerator {

	public static getErrorMessage( error:Errors.HTTPError | Error ):Promise<Message> {
		return Promise.resolve( {
			title: "",
			content: "",
			statusCode: "",
			statusMessage: "",
			endpoint: "",
			type: Types.ERROR,
		} )
			.then( ( errorMessage:Message ) => {
				if( error instanceof Errors.HTTPError ) {
					errorMessage.content = errorMessage.content === "" ? this.getFriendlyHTTPMessage( error ) : errorMessage.content;
					errorMessage.statusCode = error.hasOwnProperty( "message" ) ? "" + error.response.status : "";
					errorMessage.statusMessage = (<XMLHttpRequest>error.response.request).statusText;
					errorMessage.title = errorMessage.statusMessage;
					errorMessage.endpoint = (<any>error.response.request).responseURL;

					if( this.hasErrorResponse( error ) ) return this.parseErrorResponse( error.response ).then( ( parsedError:{ errorMessage:string, parsedErrorMessage:string } ) => {
						// FIXME(2018-08-29):

						return errorMessage;
					} );
				} else if( error.hasOwnProperty( "stack" ) ) {
					// If it's an uncaught exception
					errorMessage.title = error.message;
					errorMessage.content = error.hasOwnProperty( "message" ) ? error.message : "";
					errorMessage.stack = error.stack;
				} else {
					errorMessage.title = error.hasOwnProperty( "name" ) ? error.name : "";
					errorMessage.content = error.hasOwnProperty( "message" ) ? error.message : "";
				}
				return errorMessage;
			} );

		// If it's a HTTP error
		if( error instanceof Errors.HTTPError ) {
			errorMessage.content = errorMessage.content === "" ? this.getFriendlyHTTPMessage( error ) : errorMessage.content;
			errorMessage.statusCode = error.hasOwnProperty( "message" ) ? "" + error.response.status : "";
			errorMessage.statusMessage = (<XMLHttpRequest>error.response.request).statusText;
			errorMessage.title = errorMessage.statusMessage;
			errorMessage.endpoint = (<any>error.response.request).responseURL;
			if( ! ! error.response.data ) {
				this.getErrorMessagefromJSONLD( error ).then( ( errors ) => {
					errorMessage.content = `Error Message: ${errors.errorMessage} <br>
					Parser Error Message: ${errors.parserErrorMessage}
					`;
				} );
				this.getErrors( error ).then( ( errors ) => { errorMessage[ "errors" ] = errors; } );
			}
		} else if( error.hasOwnProperty( "stack" ) ) {
			// If it's an uncaught exception
			errorMessage.title = error.message;
			errorMessage.stack = error.stack;
		}
		return errorMessage;
	}

	private static hasErrorResponse( error:Errors.HTTPError ) {
		let contentType = error.response.getHeader( "Content-Type" );
		if( contentType === null ) return false;

		return contentType.hasValue( "application/ld+json" );
	}

	private static parseErrorResponse( response:Response ):Promise<{ errorMessage:string, parsedErrorMessage:string }> {
		const combineValues = ( accumulator, currentValue ) => accumulator[ '@value' ]
			? currentValue[ '@value' ] + " " + accumulator[ '@value' ]
			: currentValue[ '@value' ] + " " + accumulator;

		return new JSONLDParser().parse( response.data ).then( errorResponse => {
			let parsedError = {
				errorMessage: "",
				parsedErrorMessage: ""
			};

			let nodes = RDFDocument.getFreeNodes( errorResponse );
			let errors = nodes
				.filter( function hasTypeError( node ) {
					return RDFNode.hasType( node, `${C.namespace}Error` );
				} )
				.filter( function hasErrorCode87C8( node ) {
					if( ! (`${C.namespace}errorCode` in node) ) return false;
					if( ! Array.isArray( node[ `${C.namespace}errorCode` ] ) || node[ `${C.namespace}errorCode` ].length !== 1 ) return false;

					return node[ `${C.namespace}errorCode` ][ 0 ][ "@value" ] === "0x87C8";
				} )
			;
			if( errors.length !== 1 )


			// FIXME(2018-08-29):

			let errors = errorResponse.filter( ( subject ) => {
				return (! ! subject[ "@type" ] && subject[ "@type" ].indexOf( `${C.namespace}Error` ) !== - 1) || (! ! subject[ `${C.namespace}key` ] && this.objectPropInArray( subject[ `${C.namespace}key` ], "@value", "parserErrorMessage" ));
			} );

			errors.forEach( ( error ) => {
				! ! error[ `${C.namespace}errorMessage` ] ? parsedError[ "errorMessage" ] = error[ `${C.namespace}errorMessage` ].length > 1 ? error[ `${C.namespace}errorMessage` ].reduce( combineValues ) : error[ `${C.namespace}errorMessage` ][ 0 ][ '@value' ] : "";
				! ! error[ `${C.namespace}value` ] ? parsedError[ "parserErrorMessage" ] = error[ `${C.namespace}value` ].length > 1 ? error[ `${C.namespace}value` ].reduce( combineValues ) : error[ `${C.namespace}value` ][ 0 ][ '@value' ] : "";
			} );
			return parsedError;
		} );
	}

	// FIXME(2018-08-29): This method includes logic that is only relevant to the Document Explorer. Move it to a more appropriate place.
	private static getErrors( response:Response ):Promise<any[]> {
		let parser:JSONLDParser = new JSONLDParser();
		let errors:any[] = [];
		return parser.parse( error.response.data ).then( ( errorResponse ) => {

			errors = errorResponse.filter( ( subject ) => { return subject[ "@type" ] && subject[ "@type" ].indexOf( `${C.namespace}Error` ) !== - 1} );
			errors.forEach( ( error ) => {
				if( error[ "@type" ].indexOf( `${C.namespace}ValidationError` ) !== - 1 ) {

					error.validationError = <ValidationError>{
						errorCode: error[ `${C.namespace}errorCode` ][ 0 ][ "@value" ],
						errorMessage: error[ `${C.namespace}errorMessage` ][ 0 ][ "@value" ],
						errorDetails: this.getValidationDetails( error[ `${C.namespace}errorDetails` ][ 0 ][ "@id" ], errorResponse ),
					};
				}
			} );
			return errors;
		} );
	}

	private static objectPropInArray( list, prop, val ):boolean {
		if( list.length > 0 ) {
			for( let i in list ) {
				if( list[ i ][ prop ] === val ) {
					return true;
				}
			}
		}
		return false;
	}

	// Get the details of the validation
	private static getValidationDetails( nodeID:string, errorResponse ):ValidationDetails {
		let rawValidationDetails = errorResponse.find( ( subject ) => { return subject[ "@id" ].indexOf( nodeID ) !== - 1} );
		let validationResultsNodesID:string[] = [];
		rawValidationDetails[ "http://www.w3.org/ns/shacl#result" ].forEach( ( resultPointer ) => {
			validationResultsNodesID.push( resultPointer[ "@id" ] );
		} );

		let validationDetails:ValidationDetails = {
			conforms: rawValidationDetails[ "http://www.w3.org/ns/shacl#conforms" ][ 0 ][ "@value" ],
			result: []
		};

		// Get validation results
		validationResultsNodesID.forEach( ( nodeID:string ) => {
			validationDetails.result.push( this.getValidationResult( nodeID, errorResponse ) )
		} );

		return validationDetails;
	}

	// Get the results of the validation
	private static getValidationResult( nodeID:string, errorResponse ):ValidationResult {
		let rawValidationResult:any[] = errorResponse.filter( ( subject ) => { return subject[ "@id" ].indexOf( nodeID ) !== - 1} );
		return {
			resultMessage: rawValidationResult[ 0 ][ "http://www.w3.org/ns/shacl#resultMessage" ][ 0 ][ "@value" ],
			resultSeverity: rawValidationResult[ 0 ][ "http://www.w3.org/ns/shacl#resultSeverity" ][ 0 ][ "@id" ],
		};
	}

	private static getFriendlyHTTPMessage( error:Errors.HTTPError ):string {
		debugger
		let tempMessage:string = "";
		switch( true ) {
			case error instanceof Errors.ForbiddenError:
				tempMessage = "Forbidden Action.";
				break;
			case error instanceof Errors.NotFoundError:
				tempMessage = "Couldn't found the requested resource.";
				break;
			case error instanceof Errors.UnauthorizedError:
				tempMessage = "Unauthorized operation.";
				break;
			case error instanceof Errors.InternalServerErrorError:
				tempMessage = "An internal error occurred while trying to fetch the resource. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof Errors.ServiceUnavailableError:
				tempMessage = "Service currently unavailable.";
				break;
			case error instanceof Errors.UnknownError:
				// TODO: Check if the UnknownError is due to a bad CORS configuration.
				tempMessage = "An error occurred while trying to fetch the resource content. This could be caused by a missing allowed domain. Please, make sure this is not the case and try again later.";
				break;
			default:
				tempMessage = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}
		return tempMessage;
	}
}
