/*
*  This file searches for CARBON_PROTOCOL, CARBON_HOST, BASE_URL and ENV variables from
*  window. If it does not contain them, then uses the values from process.env.carbonldp
* */
const GLOBAL_CONFIG:Window = window[ "__GLOBAL_CONFIG" ];

export const CARBON_PROTOCOL:string = globalConfigIsSet( "CARBON_PROTOCOL" ) ? GLOBAL_CONFIG[ "CARBON_PROTOCOL" ] : process.env.carbonldp[ "protocol" ];
export const CARBON_HOST:string = globalConfigIsSet( "CARBON_HOST" ) ? GLOBAL_CONFIG[ "CARBON_HOST" ] : process.env.carbonldp[ "domain" ];
export const DEBUG:boolean = (globalConfigIsSet( "DEBUG" ) ? GLOBAL_CONFIG[ "ENV" ] : process.env.ENV) !== "production";

export function BASE_URL():string {
	return globalConfigIsSet( "BASE_URL" ) ? GLOBAL_CONFIG[ "BASE_URL" ] : process.env.baseUrl
}

/*
*  Function to determine if Window contains the __CONFIG with a desired variable
* */
export function globalConfigIsSet( configName:string ):boolean {
	return (! ! window) &&
		(! ! GLOBAL_CONFIG) &&
		(! ! GLOBAL_CONFIG[ configName ]) &&
		(GLOBAL_CONFIG[ configName ] !== ("--" + configName + "--"));
}