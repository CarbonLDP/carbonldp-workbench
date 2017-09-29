import * as HTTP from "carbonldp/HTTP";
import * as JSONLDParser from "carbonldp/JSONLD/Parser";
import { C } from "carbonldp/NS";

import { Message, ValidationResult, ValidationDetails, ValidationError, Types } from "../message.component";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";


export class ErrorMessageGenerator {

	public static getErrorMessage( error:HTTPError ):Message {
		let errorMessage:Message = {
			title: "",
			content: "",
			statusCode: "",
			statusMessage: "",
			endpoint: "",
			type: Types.ERROR,
		};

		errorMessage.title = error.hasOwnProperty( "name" ) ? error.name : "";
		errorMessage.content = error.hasOwnProperty( "message" ) ? error.message : "";

		// If it's a HTTP error
		if( error.hasOwnProperty( "statusCode" ) ) {
			errorMessage.content = errorMessage.content === "" ? this.getFriendlyHTTPMessage( error ) : errorMessage.content;
			errorMessage.statusCode = error.hasOwnProperty( "message" ) ? "" + error.statusCode : "";
			errorMessage.statusMessage = ( <XMLHttpRequest>error.response.request ).statusText;
			errorMessage.title = errorMessage.statusMessage;
			errorMessage.endpoint = ( <any>error.response.request ).responseURL;
			if( ! ! error.response.data )
				this.getErrors( error ).then( ( errors ) => { errorMessage[ "errors" ] = errors; } );
		} else if( error.hasOwnProperty( "stack" ) ) {
			// If it's an uncaught exception
			errorMessage.title = error.message;
			errorMessage.stack = error.stack;
		}
		return errorMessage;
	}

	private static getErrors( error:HTTPError ):Promise<any[]> {
		let parser:JSONLDParser.Class = new JSONLDParser.Class();
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

	private static getFriendlyHTTPMessage( error:HTTPError ):string {
		let tempMessage:string = "";
		switch( true ) {
			case error instanceof HTTP.Errors.ForbiddenError:
				tempMessage = "Forbidden Action.";
				break;
			case error instanceof HTTP.Errors.NotFoundError:
				tempMessage = "Couldn't found the requested resource.";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				tempMessage = "Unauthorized operation.";
				break;
			case error instanceof HTTP.Errors.InternalServerErrorError:
				tempMessage = "An internal error occurred while trying to fetch the resource. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.ServiceUnavailableError:
				tempMessage = "Service currently unavailable.";
				break;
			case error instanceof HTTP.Errors.UnknownError:
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
