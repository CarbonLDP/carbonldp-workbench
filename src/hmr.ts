import { ApplicationRef, NgModuleRef } from "@angular/core";
import { createNewHosts } from "@angularclass/hmr";

interface HotModuleReplacer {
	accept();

	dispose( callback:() => void );
}

/**
 * Setup hot module replacement (HMR) after bootstrapping the Angular application
 *
 * @see {@link https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/configure-hmr.md}
 *
 * @param mainModule
 * @param bootstrapFn
 */
export function bootstrapWithHMR<MODULE>( mainModule:NodeModule, bootstrapFn:() => Promise<NgModuleRef<MODULE>> ):Promise<NgModuleRef<MODULE>> {
	const hotModuleReplacer:HotModuleReplacer = mainModule[ "hot" ];

	hotModuleReplacer.accept();

	// Event listener to clear console after a HMR
	// See: https://github.com/webpack/webpack-dev-server/issues/565
	window.addEventListener( "message", event => {
		if( "production" !== process.env.NODE_ENV ) console.clear();
	} );

	return bootstrapFn().then( ngModuleRef => {
		hotModuleReplacer.dispose( () => {
			const appRef:ApplicationRef = ngModuleRef.injector.get( ApplicationRef );
			const elements = appRef.components.map( component => component.location.nativeElement );
			const makeVisible = createNewHosts( elements );
			ngModuleRef.destroy();
			makeVisible();
		} );

		return ngModuleRef;
	} );
}
