import { Pipe, PipeTransform } from "@angular/core";

/**
 * Formats identifiers as BNode identifiers.
 *
 * E.g. `5341346` => `_:5341346`
 */
@Pipe( { name: "bnode" } )
export class BNodePipe implements PipeTransform {
	transform( value:string ):string {
		return ! value.startsWith( "_:" ) ? `_:${value}` : value;
	}
}
