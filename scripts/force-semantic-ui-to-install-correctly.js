const fs = require( "fs" );

fs.readFile( "semantic.json", "utf8", ( error, semanticJSON ) => {
	if( error ) {
		console.error( "'semantic.json' file couldn't be read" );
		console.error( error );
		process.exit( 1 );
		return;
	}

	let newJSON = semanticJSON.replace( /"version"[\s\t]*:[\s\t]*"[a-zA-Z0-9.-^~]*"/g, '"version": "2.2.1"' );
	fs.writeFile( "semantic.json", newJSON, "utf8", ( error ) => {
		if( error ) {
			console.error( "'semantic.json' file couldn't be updated" );
			console.error( error );
			process.exit( 1 );
		}
	} );
} );