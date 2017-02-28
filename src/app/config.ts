export const CARBON_PROTOCOL:string = globalConfigIsSet() ? window[ "__CONFIG" ][ "CARBON_PROTOCOL" ] : process.env.CARBON.protocol;
export const CARBON_DOMAIN:string = globalConfigIsSet() ? window[ "__CONFIG" ][ "CARBON_HOST" ] : process.env.CARBON.domain;
// TODO: Rename URL_BASE to BASE_URL
export const URL_BASE:string = globalConfigIsSet() ? window[ "__CONFIG" ][ "BASE_URL" ] : process.env.CARBON.protocol;
export const DEBUG:boolean = (globalConfigIsSet() ? window[ "__CONFIG" ][ "ENV" ] : process.env.ENV) === "production";


function globalConfigIsSet():boolean {
	return typeof window !== "undefined" && "__CONFIG" in window;
}