import { FormControl } from "@angular/forms";
import { EmailValidator, SlugValidator, MatchValidator, DomainValidator, URIValidator, FragmentValidator, URIFragmentValidator, RequiredIfValidator } from "./custom-validators";


export function CustomValidatorsSpecs() {

	describe( "CustomValidators", () => {


		describe( "EmailValidator", () => {


			it( "Should return invalidEmailAddress", () => {

				let directive = new EmailValidator();

				expect( directive.validate( new FormControl( "exa mple" ) ) ).toEqual( { "invalidEmailAddress": true } );
				expect( directive.validate( new FormControl( "exa mple@" ) ) ).toEqual( { "invalidEmailAddress": true } );
				expect( directive.validate( new FormControl( "exa mple @company" ) ) ).toEqual( { "invalidEmailAddress": true } );
				expect( directive.validate( new FormControl( "exa mple@company.com" ) ) ).toEqual( { "invalidEmailAddress": true } );
				expect( directive.validate( new FormControl( "example@company" ) ) ).toEqual( { "invalidEmailAddress": true } );
			} );

			it( "Should not return invalidEmailAddress", () => {

				let directive = new EmailValidator();

				expect( directive.validate( new FormControl( "example@company.com" ) ) ).toBeNull();
			} );

		} );

		describe( "SlugValidator", () => {


			it( "Should return invalidSlug", () => {

				let directive = new SlugValidator();

				expect( directive.validate( new FormControl( ";a@" ) ) ).toEqual( { "invalidSlug": true } );
				expect( directive.validate( new FormControl( "; a@" ) ) ).toEqual( { "invalidSlug": true } );
				expect( directive.validate( new FormControl( "/asdjh" ) ) ).toEqual( { "invalidSlug": true } );
				expect( directive.validate( new FormControl( "/asdjh/" ) ) ).toEqual( { "invalidSlug": true } );
				expect( directive.validate( new FormControl( "abc 123/" ) ) ).toEqual( { "invalidSlug": true } );
				expect( directive.validate( new FormControl( "abc 123#" ) ) ).toEqual( { "invalidSlug": true } );
			} );

			it( "Should not return invalidSlug", () => {

				let directive = new SlugValidator();

				expect( directive.validate( new FormControl( "resource--123" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "resource-slug-123" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "resource-slug-123" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "resource-slug-123/" ) ) ).toBeNull();
			} );

		} );

		describe( "MatchValidator", () => {


			it( "Should return matchError", () => {

				let directive = new MatchValidator();
				directive.matchTo = "my value";

				expect( directive.validate( new FormControl( "my valu" ) ) ).toEqual( { "matchError": true } );
				expect( directive.validate( new FormControl( "my valuE" ) ) ).toEqual( { "matchError": true } );
				expect( directive.validate( new FormControl( "MY VALUE" ) ) ).toEqual( { "matchError": true } );

			} );

			it( "Should not return matchError", () => {

				let directive = new MatchValidator();
				directive.matchTo = "my value";

				expect( directive.validate( new FormControl( "my value" ) ) ).toBeNull();
			} );

		} );

		describe( "DomainValidator", () => {


			it( "Should return invalidURLAddress", () => {

				let directive = new DomainValidator();

				expect( directive.validate( new FormControl( " " ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "http://goo gle.com/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "www.carbonldp.com/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "localhost" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "localhost:8080/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "http://gooágle.com/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "http:///localhost:8080/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "http://127. 0.0.1/" ) ) ).toEqual( { "invalidURLAddress": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/" ) ) ).toEqual( { "invalidURLAddress": true } );
			} );

			it( "Should not return invalidURLAddress", () => {

				let directive = new DomainValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost:8080/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "https://localhost:8080/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1/" ) ) ).toBeNull();
			} );

		} );

		describe( "URIValidator", () => {


			it( "Should return emptyURIAddress", () => {
				let directive = new URIValidator();

				expect( directive.validate( new FormControl( "" ) ) ).toEqual( { "emptyURIAddress": true } );
			} );


			it( "Should return invalidURIAddress", () => {

				let directive = new URIValidator();

				expect( directive.validate( new FormControl( " " ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://goo gle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "www.carbonldp.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://gooágle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http:///localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://127. 0.0.1/" ) ) ).toEqual( { "invalidURIAddress": true } );
			} );

			it( "Should not return invalidURIAddress", () => {

				let directive = new URIValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "ftp://localhost:8080/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost:8080/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1/" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/" ) ) ).toBeNull();
			} );

		} );

		describe( "FragmentValidator", () => {


			it( "Should return invalidURIAddress", () => {

				let directive = new FragmentValidator();

				expect( directive.validate( new FormControl( " " ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://goo gle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "www.carbonldp.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://gooágle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http:///localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://127. 0.0.1/" ) ) ).toEqual( { "invalidURIAddress": true } );
			} );

			it( "Should return missingFragment", () => {

				let directive = new FragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost:8080/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page" ) ) ).toEqual( { "missingFragment": true } );
			} );


			it( "Should return multipleFragment", () => {

				let directive = new FragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost:8080/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page#fragm#ent#1" ) ) ).toEqual( { "multipleFragment": true } );
			} );

			it( "Should be ok", () => {

				let directive = new FragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost:8080/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page#fragment1" ) ) ).toBeNull();
			} );

		} );

		describe( "URIFragmentValidator", () => {


			it( "Should return invalidURIAddress", () => {

				let directive = new URIFragmentValidator();

				expect( directive.validate( new FormControl( " " ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://goo gle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "www.carbonldp.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://gooágle.com/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http:///localhost:8080/" ) ) ).toEqual( { "invalidURIAddress": true } );
				expect( directive.validate( new FormControl( "http://127. 0.0.1/" ) ) ).toEqual( { "invalidURIAddress": true } );
			} );

			it( "Should return missingFragment", () => {

				let directive = new URIFragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost:8080/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1/page" ) ) ).toEqual( { "missingFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page" ) ) ).toEqual( { "missingFragment": true } );
			} );


			it( "Should return multipleFragment", () => {

				let directive = new URIFragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://localhost:8080/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1/page#fragment#1" ) ) ).toEqual( { "multipleFragment": true } );
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page#fragm#ent#1" ) ) ).toEqual( { "multipleFragment": true } );
			} );

			it( "Should be ok", () => {

				let directive = new URIFragmentValidator();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "http://localhost/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "http://localhost:8080/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "http://127.0.0.1/page" ) ) ).toBeUndefined();
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page" ) ) ).toBeUndefined();

				expect( directive.validate( new FormControl( "http://carbonldp.com/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://www.carbonldp.com/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "ftp://localhost:8080/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://localhost:8080/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1/page#fragment1" ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "http://127.0.0.1:8080/page#fragment1" ) ) ).toBeNull();
			} );

		} );

		describe( "RequiredIfValidator", () => {

			it( "Should return requiredIf", () => {

				let directive = new RequiredIfValidator();
				directive.condition = true;

				expect( directive.validate( new FormControl( 0 ) ) ).toEqual( { "requiredIf": true } );
				expect( directive.validate( new FormControl( null ) ) ).toEqual( { "requiredIf": true } );
				expect( directive.validate( new FormControl( false ) ) ).toEqual( { "requiredIf": true } );
				expect( directive.validate( new FormControl( 123987 ) ) ).toEqual( { "requiredIf": true } );
				expect( directive.validate( new FormControl( "user text" ) ) ).toEqual( { "requiredIf": true } );
			} );

			it( "Should not return requiredIf", () => {

				let directive = new RequiredIfValidator();

				directive.condition = false;

				expect( directive.validate( new FormControl( true ) ) ).toBeNull();
				expect( directive.validate( new FormControl( 1 ) ) ).toBeNull();
				expect( directive.validate( new FormControl( 0 ) ) ).toBeNull();
				expect( directive.validate( new FormControl( null ) ) ).toBeNull();
				expect( directive.validate( new FormControl( false ) ) ).toBeNull();
				expect( directive.validate( new FormControl( 123987 ) ) ).toBeNull();
				expect( directive.validate( new FormControl( "user text" ) ) ).toBeNull();
			} );

		} );

	} );
}