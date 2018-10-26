/**
 *  This file searches for CARBONLDP_PROTOCOL, CARBONLDP_HOST, BASE_URL and ENV variables from
 *  window. If it does not contain them, then uses the values from process.env.carbonldp
 */
import { environment } from "./environments/environment";

const GLOBAL_CONFIG:Window = window[ "__GLOBAL_CONFIG" ];

export const CARBONLDP_PROTOCOL:string = globalConfigIsSet( "CARBONLDP_PROTOCOL" ) ? GLOBAL_CONFIG[ "CARBONLDP_PROTOCOL" ] : environment.carbonldp.protocol;
export const CARBONLDP_HOST:string = globalConfigIsSet( "CARBONLDP_HOST" ) ? GLOBAL_CONFIG[ "CARBONLDP_HOST" ] : environment.carbonldp.host;
// FIXME: Change the way debug mode is activated
export const ENV:string = globalConfigIsSet( "ENV" ) ? GLOBAL_CONFIG[ "ENV" ] : environment.production ? "production" : "debug";
export const BASE_URL:string = globalConfigIsSet( "BASE_URL" ) ? GLOBAL_CONFIG[ "BASE_URL" ] : environment.baseURL;

/**
 *  Function to determine if window contains the __GLOBAL_CONFIG with a desired variable
 */
export function globalConfigIsSet( configName:string ):boolean {
	return ! ! (
		window &&
		GLOBAL_CONFIG &&
		GLOBAL_CONFIG[ configName ] &&
		GLOBAL_CONFIG[ configName ] !== ("--" + configName + "--")
	);
}
