import { CarbonLDP } from "carbonldp";
import { authenticateWithCookie, authenticationCookieIsPresent } from "app/authentication/utils";


let carbonldp:CarbonLDP;


/*
*  Initializes the CarbonLDP variable and attempts authentication if a cookie is present
* */
export const carbonldpProvider:CarbonLDPProviderFn = (():CarbonLDPProviderFn => {
	let _carbonProvider:CarbonLDP = null;

	let carbonProviderFn:CarbonLDPProviderFn = ():CarbonLDP => {
		return _carbonProvider;
	};
	carbonProviderFn.promise = Promise.resolve();
	carbonProviderFn.initialize = ( configuredCarbon:CarbonLDP ):Promise<void> => {
		carbonldp = configuredCarbon;
		_carbonProvider = carbonldp;
		carbonProviderFn.promise = carbonProviderFn.promise.then( () => {
			if( authenticationCookieIsPresent() ) {
				return authenticateWithCookie( carbonldp );
			}
		} );
		return carbonProviderFn.promise;
	};

	return carbonProviderFn;
})();

/*
*  Function used by the CARBONLDP_PROVIDERS to return the initialized variable
* */
export function aotCarbonFactory():CarbonLDP {
	return carbonldp;
}

/*
*  An Angular Provider that returns the initialized carbonldp variable
* */
export const CARBONLDP_PROVIDERS:any[] = [
	{
		provide: CarbonLDP,
		useFactory: aotCarbonFactory,
	}
];

/*
*  Interface defining the carbonldpProvider function
* */
export interface CarbonLDPProviderFn {
	():CarbonLDP;

	promise?:Promise<void>;
	initialize?:( carbonldp:CarbonLDP ) => Promise<void>;
}