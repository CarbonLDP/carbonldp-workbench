import * as ObjectSchema from "carbonldp/ObjectSchema";
import * as PersistedProtectedDocument from "carbonldp/PersistedProtectedDocument";
import * as Pointer from "carbonldp/Pointer";
export declare const RDF_CLASS:string;
export declare const SCHEMA:ObjectSchema.Class;
export interface Class extends PersistedProtectedDocument.Class {
	name?:string;
	description?:string;
	allowsOrigins?:(Pointer.Class | string)[];
}
export default Class;