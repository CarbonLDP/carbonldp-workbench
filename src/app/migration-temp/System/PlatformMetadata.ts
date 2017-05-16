import * as VolatileResource from "carbonldp/LDP/VolatileResource";
import * as ObjectSchema from "carbonldp/ObjectSchema";
export declare const RDF_CLASS:string;
export declare const SCHEMA:ObjectSchema.Class;
export interface Class extends VolatileResource.Class {
	version:string;
	buildDate:Date;
}
export default Class;