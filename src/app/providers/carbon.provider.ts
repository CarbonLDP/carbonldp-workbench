import { Class as Carbon } from "carbonldp/Carbon";
import { authenticateWithCookie, authenticationCookieIsPresent } from "app/authentication/utils";


let carbon:Carbon;

export function aotCarbonFactory():Carbon {
	return carbon;
}

export const carbonProvider:CarbonProviderFn = (():CarbonProviderFn => {
	let _carbonProvider:Carbon = null;

	let carbonProviderFn:CarbonProviderFn = ():Carbon => {
		return _carbonProvider;
	};
	carbonProviderFn.promise = Promise.resolve();
	carbonProviderFn.initialize = ( configuredCarbon:Carbon ):Promise<void> => {
		carbon = configuredCarbon;
		_carbonProvider = carbon;
		carbonProviderFn.promise = carbonProviderFn.promise.then( () => {
			if( authenticationCookieIsPresent() ) {
				return authenticateWithCookie( carbon );
			}
		} );
		return carbonProviderFn.promise;
	};

	return carbonProviderFn;
})();


export const CARBON_PROVIDERS:any[] = [
	{
		provide: Carbon,
		useFactory: aotCarbonFactory,
	}
];

export interface CarbonProviderFn {
	():Carbon;

	promise?:Promise<void>;
	initialize?:( carbon:Carbon ) => Promise<void>;
}