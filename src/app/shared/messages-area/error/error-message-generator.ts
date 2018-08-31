import { Errors } from "carbonldp/HTTP";
import { JSONLDParser } from "carbonldp/JSONLD";
import { C } from "carbonldp/Vocabularies";

import { Message, Types, ValidationDetails, ValidationError, ValidationResult } from "../message.component";
import { _getErrorResponseParserFn } from "carbonldp/DocumentsRepository/Utils";
import { CarbonLDP } from "carbonldp";

export class ErrorMessageGenerator {

	public static getErrorMessage( error:Errors.HTTPError | Error, carbonInstance:CarbonLDP ):Promise<Message> {

		return Promise.resolve( {
			title: "",
			content: "",
			statusCode: "",
			statusMessage: "",
			endpoint: "",
			type: Types.ERROR,
		} )
			.then( ( errorMessage:Message ) => {
				return _getErrorResponseParserFn( carbonInstance.registry )( error ).catch( ( parsedError ) => {
					if( error instanceof Errors.HTTPError ) {
						errorMessage.content = errorMessage.content === "" ? this.getFriendlyHTTPMessage( error ) : errorMessage.content;
						errorMessage.statusCode = parsedError.hasOwnProperty( "message" ) ? "" + parsedError.response.status : "";
						errorMessage.statusMessage = (<XMLHttpRequest>parsedError.response.request).statusText;
						errorMessage.title = errorMessage.statusMessage;
						errorMessage.endpoint = (<any>parsedError.response.request).responseURL;

						if( this.hasErrorResponse( error ) ) {
							parsedError.errors.forEach( ( errorElement ) => {
								let parsedErrorMessage = this.pacerErrorMessage( errorElement );
								errorMessage.content = parsedErrorMessage.errorMessage !== "" ? `${errorMessage.content} ${parsedErrorMessage.errorMessage}` : errorMessage.content;
								errorMessage.content = parsedErrorMessage.parsedMessage !== "" ? `${errorMessage.content} ${parsedErrorMessage.parsedMessage}` : errorMessage.content;
							} )
						}

						return errorMessage;

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

			} );
	}

	private static hasErrorResponse( error:Errors.HTTPError ) {
		let contentType = error.response.getHeader( "Content-Type" );
		if( contentType === null ) return false;

		return contentType.hasValue( "application/ld+json" );
	}

	private static pacerErrorMessage( error ):{ errorMessage:string, parsedMessage:string } {
		const combineValues = ( accumulator, currentValue ) => accumulator.entryValue
			? currentValue.entryValue + " " + accumulator.entryValue
			: currentValue.entryValue + " " + accumulator;

		let pacedErrorMessage = { errorMessage: "", parsedMessage: "" };

		switch( error.errorCode ) {

			case "0x87C8":
				pacedErrorMessage.errorMessage = error.errorMessage;
				pacedErrorMessage.parsedMessage = error.errorParameters.entries
					.filter( function getParserErrorMessage( entry ) {
						return entry.entryKey === "parserErrorMessage";
					} ).reduce( combineValues, "" );
				break;


		}

		return pacedErrorMessage;

	}

	// FIXME(2018-08-29): This method includes logic that is only relevant to the Document Explorer. Move it to a more appropriate place.
	/*private static getErrors( response:Response ):Promise<any[]> {
		let parser:JSONLDParser = new JSONLDParser();
		let errors:any[] = [];
		return parser.parse( response.data ).then( ( errorResponse ) => {

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
	}*/

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
