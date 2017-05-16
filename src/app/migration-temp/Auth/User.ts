import * as Document from "carbonldp/Document";
import IllegalArgumentError from "carbonldp/Errors/IllegalArgumentError";
import * as CS from "./../NS/CS";
import * as ObjectSchema from "carbonldp/ObjectSchema";
import * as Utils from "carbonldp/Utils";
import * as Credentials from "./Credentials";
import * as Pointer from "carbonldp/Pointer";

export const RDF_CLASS:string = CS.Class.User;

export const SCHEMA:ObjectSchema.Class = {
	"name": {
		"@id": CS.Predicate.namae,
		"@type": "",
	},
};

export interface Class extends Document.Class {
	name:string;
	credentials:Credentials.Class | Pointer.Class
}

export class Factory {
	static hasClassProperties( object:Object ):boolean {
		return Utils.hasPropertyDefined( object, "name" )
			&& Utils.hasPropertyDefined( object, "email" )
			&& Utils.hasPropertyDefined( object, "password" )
			;
	}

	static is( object:Object ):boolean {
		return Factory.hasClassProperties( object )
			&& Document.Factory.hasClassProperties( object )
			&& (<Document.Class> object).hasType( RDF_CLASS )
			;
	}

	static create( name:string, email:string, password:string ):Class {
		return Factory.createFrom<Object>( {}, name, email, password );
	}

	static createFrom<T extends Object>( object:T, name:string, email:string, password:string ):T & Class {
		if( ! Document.Factory.hasClassProperties( object ) )
			object = Document.Factory.createFrom( object );

		if( ! name ) throw new IllegalArgumentError( "The name cannot be empty." );

		let app:T & Class = <T & Class> object;
		app.name = name;
		app.types.push( CS.Class.User );

		return app;
	}

}

export default Class;