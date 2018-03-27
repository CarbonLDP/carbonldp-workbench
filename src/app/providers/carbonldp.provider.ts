import { CarbonLDP } from "carbonldp";
import { authenticateWithCookie, authenticationCookieIsPresent } from "app/authentication/utils";


let carbonldp:CarbonLDP;

export function aotCarbonFactory():CarbonLDP {
	return carbonldp;
}

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


export const CARBONLDP_PROVIDERS:any[] = [
	{
		provide: CarbonLDP,
		useFactory: aotCarbonFactory,
	}
];

export interface CarbonLDPProviderFn {
	():CarbonLDP;

	promise?:Promise<void>;
	initialize?:( carbonldp:CarbonLDP ) => Promise<void>;
}