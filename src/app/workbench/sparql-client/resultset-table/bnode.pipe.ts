import { Pipe, PipeTransform } from "@angular/core";

@Pipe( { name: "bnode" } )
export class BNodePipe implements PipeTransform {
	transform( value:string ):string {
		return ! value.startsWith( "_;" ) ? `_:${value}` : value;
	}
}
