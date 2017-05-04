import * as HTTP from "carbonldp/HTTP";
import * as JSONLDParser from "carbonldp/JSONLD/Parser";

import { Message, Types } from "../message.component";
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
		let mainError = {};
		let errors:any[] = [];
		return parser.parse( error.response.data ).then( ( mainErrors ) => {
			mainError = mainErrors.find( ( error ) => { return error[ "@type" ].indexOf( "https://carbonldp.com/ns/v1/platform#ErrorResponse" ) !== - 1} );
			errors = mainErrors.filter( ( error ) => { return error[ "@type" ].indexOf( "https://carbonldp.com/ns/v1/platform#Error" ) !== - 1} );
			return errors;
		} );
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
				tempMessage = "An error occurred while trying to fetch the resource content. This could be caused by a missing allowed domain for your App. Please, make sure this is not the case and try again later.";
				break;
			default:
				tempMessage = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}
		return tempMessage;
	}
}
