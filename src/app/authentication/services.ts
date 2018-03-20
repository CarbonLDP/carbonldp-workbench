import * as AuthService from "./services/auth.service";
import { CarbonLDPAuthService } from "./services/carbonldp-auth.service";

export const CARBONLDP_SERVICES_PROVIDERS:any[] = [
	{
		provide: AuthService.Token,
		useClass: CarbonLDPAuthService,
	},
];

export {
	AuthService,
	CarbonLDPAuthService
};
