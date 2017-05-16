import * as Document from "carbonldp/Document";
import * as NS from "./../NS";
import * as ObjectSchema from "carbonldp/ObjectSchema";

export interface Class extends Document.Class {
	email:string;
	password:string;
	enabled:boolean;
}


export const SCHEMA:ObjectSchema.Class = {
	"email": {
		"@id": NS.VCARD.Predicate.email,
		"@type": NS.XSD.DataType.string,
	},
	"password": {
		"@id": NS.CS.Predicate.password,
		"@type": NS.XSD.DataType.string,
	},
	"enabled": {
		"@id": NS.CS.Predicate.enabled,
		"@type": NS.XSD.DataType.boolean,
	},
};