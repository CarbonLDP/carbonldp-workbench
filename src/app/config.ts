export const CARBON_PROTOCOL:string = globalConfigIsSet( "CARBON_PROTOCOL" ) ? window[ "__CONFIG" ][ "CARBON_PROTOCOL" ] : process.env.CARBON["protocol"];
export const CARBON_HOST:string = globalConfigIsSet( "CARBON_HOST" ) ? window[ "__CONFIG" ][ "CARBON_HOST" ] : process.env.CARBON["domain"];
export const DEBUG:boolean = (globalConfigIsSet( "DEBUG" ) ? window[ "__CONFIG" ][ "ENV" ] : process.env.ENV) !== "production";
export function BASE_URL():string {
	return globalConfigIsSet( "BASE_URL" ) ? window[ "__CONFIG" ][ "BASE_URL" ] : process.env.baseUrl
}

// Avoid use of 'typeof' so it can be used with AOT compiling
export function globalConfigIsSet( configName:string ):boolean {
	return ( ! ! window ) &&
		("__CONFIG" in window) &&
		( ! ! window[ "__CONFIG" ][ configName ]) &&
		( window[ "__CONFIG" ][ configName ] !== ("--" + configName + "--") );
}