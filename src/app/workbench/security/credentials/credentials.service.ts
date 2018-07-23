import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { CredentialsSet } from "carbonldp/Auth";
import { CS } from "carbonldp/Vocabularies";


@Injectable()
export class CredentialsService {

	private carbonldp:CarbonLDP;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}


	getUserCredentialsSet( userURI:string ):Promise<CredentialsSet> {

		let credentialsEndpoint:string = `${this.carbonldp.baseURI}.system/security/credentials/`;

		return this.carbonldp.documents.getChildren<CredentialsSet>( credentialsEndpoint, _ => _
			.withType( `${CS.namespace}CredentialSet` )
			.properties( {
				"user": {
					"@id": CS.user
				},
				"credentials": {
					"query": _ => _
						.withType( CS.UsernameAndPasswordCredentials )
						.properties( {
							"username": {
								"@type": "string"
							}
						} )
				}
			} )
			.filter( `${_.property( "user" )} = <${userURI}>` )
		).then( ( credentialsSets:(CredentialsSet)[] ) => {

			return credentialsSets[ 0 ];
		} );
	}
}