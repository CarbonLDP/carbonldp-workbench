// There are files that reference this two dependencies and therefore they get included in the bundled file
// This causes a conflict with angular2-polyfills.js, as that file also declares them
// To avoid this, angular2-polyfills.js is no longer included in the index.html and zone and reflect are declared here instead
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app-new.module";

platformBrowserDynamic().bootstrapModule( AppModule ).catch( ( error ) => {
	console.error( "Couldn't bootstrap the application" );
	console.error( error );
	return Promise.reject( error );
} );