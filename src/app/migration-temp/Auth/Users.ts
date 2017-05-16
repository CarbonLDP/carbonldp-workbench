import * as User from "./User";
import Context from "carbonldp/Context";
import * as Errors from "carbonldp/Errors";
import * as HTTP from "carbonldp/HTTP";
import * as PersistedUser from "./PersistedUser";
import * as PersistedProtectedDocument from "carbonldp/PersistedProtectedDocument";
import * as URI from "carbonldp/RDF/URI";

export interface Class {
	register( email:string, password:string, enabled:boolean ):Promise<[ PersistedProtectedDocument.Class, HTTP.Response.Class ]>,
	get( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, HTTP.Response.Class ]>,
	enable( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]>,
	disable( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]>,
	delete( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class>,
}

export default Class;