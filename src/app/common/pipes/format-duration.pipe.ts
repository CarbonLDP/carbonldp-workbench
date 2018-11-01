import { Pipe, PipeTransform } from "@angular/core";

export class FormatDurationPipeOptions {
	/**
	 * Number of decimals to return for milliseconds
	 */
	decimals?:number = 3;
	/**
	 * Whether to maintain a fixed length or a more compact representation
	 */
	fixedLength?:boolean = false;
}

/**
 * Formats duration values (milliseconds) into a more human-friendly representation.
 *
 * Output example: 1hr 25min 2s 12ms
 *
 * @usageNotes
 * ```
 * {{ duration | formatDuration:'{ "decimals": 2, "fixedLength": false }' }}
 * ```
 */
@Pipe( {
	name: "formatDuration"
} )
export class FormatDurationPipe implements PipeTransform {
	transform( value:number, optionsString?:string ):string {
		if( Number.isNaN( value ) ) return value as any;
		if( value < 0 ) return `${value}`;

		const options:FormatDurationPipeOptions = optionsString ? Object.assign( new FormatDurationPipeOptions(), JSON.parse( optionsString ) ) : new FormatDurationPipeOptions();

		let messageParts = [];
		if( value >= 3600000 ) {
			const hours = Math.floor( value / 3600000 );
			messageParts.push( `${hours}hr` );
			value = value % 3600000;
		}

		if( value >= 60000 ) {
			const minutes = Math.floor( value / 60000 );

			if( minutes == 0 && options.fixedLength && messageParts.length !== 0 ) {
				messageParts.push( `00min` );
			} else {
				messageParts.push( `${minutes}min` );
			}
			value = value % 60000;
		}

		if( value >= 1000 ) {
			const seconds = Math.floor( value / 1000 );
			if( seconds == 0 && options.fixedLength && messageParts.length !== 0 ) {
				messageParts.push( `00s` );
			} else {
				messageParts.push( `${seconds}s` );
			}
			value = value % 1000;
		}

		if( value !== 0 ) {
			let milliseconds = new Number( value ).toFixed( options.decimals );
			if( options.fixedLength && messageParts.length !== 0 ) {
				// Add left padding
				milliseconds = `000${milliseconds}`.slice( options.decimals > 0 ? - 4 - options.decimals : - 3 );
				messageParts.push( `${milliseconds}ms` );
			} else {
				if( ! options.fixedLength && value !== 0 ) {
					// Remove trailing zeros
					while( milliseconds.endsWith( "0" ) ) milliseconds = milliseconds.substring( 0, milliseconds.length - 1 );
					// Remove dot if there are no decimal places
					milliseconds = milliseconds.endsWith( "." ) ? milliseconds.substring( 0, milliseconds.length - 1 ) : milliseconds;
				}
				messageParts.push( `${milliseconds}ms` );
			}
		}

		return messageParts.join( " " );
	}
}

