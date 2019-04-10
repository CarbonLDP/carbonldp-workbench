import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

import { XSD } from "carbonldp/Vocabularies";
import { URI } from "carbonldp/RDF";

import { JsonLDKeyword, Modes } from "../document-explorer-library";


/**
 *  Displays the value, the type and language of a literal
 */
@Component( {
	selector: "tr.app-literal",
	templateUrl: "./literal.component.html",
	styleUrls: [ "./literal.component.scss" ]
} )

export class LiteralComponent implements AfterViewChecked {
	element:ElementRef;
	private cdRef:ChangeDetectorRef;

	modes:typeof Modes = Modes;
	dataTypes:any = this.getDataTypes();
	isStringType:boolean = (! this.type || this.type === XSD.string);
	languages:Array<{ code:string, name:string }> = [
		{
			code: "aa",
			name: "Afar"
		},
		{
			code: "ab",
			name: "Abkhaz"
		},
		{
			code: "ae",
			name: "Avestan"
		},
		{
			code: "af",
			name: "Afrikaans"
		},
		{
			code: "ak",
			name: "Akan"
		},
		{
			code: "am",
			name: "Amharic"
		},
		{
			code: "an",
			name: "Aragonese"
		},
		{
			code: "ar",
			name: "Arabic"
		},
		{
			code: "as",
			name: "Assamese"
		},
		{
			code: "av",
			name: "Avaric"
		},
		{
			code: "ay",
			name: "Aymara"
		},
		{
			code: "az",
			name: "Azerbaijani"
		},
		{
			code: "ba",
			name: "Bashkir"
		},
		{
			code: "be",
			name: "Belarusian"
		},
		{
			code: "bg",
			name: "Bulgarian"
		},
		{
			code: "bh",
			name: "Bihari"
		},
		{
			code: "bi",
			name: "Bislama"
		},
		{
			code: "bm",
			name: "Bambara"
		},
		{
			code: "bn",
			name: "Bengali, Bangla"
		},
		{
			code: "bo",
			name: "Tibetan Standard, Tibetan, Central"
		},
		{
			code: "br",
			name: "Breton"
		},
		{
			code: "bs",
			name: "Bosnian"
		},
		{
			code: "ca",
			name: "Catalan"
		},
		{
			code: "ce",
			name: "Chechen"
		},
		{
			code: "ch",
			name: "Chamorro"
		},
		{
			code: "co",
			name: "Corsican"
		},
		{
			code: "cr",
			name: "Cree"
		},
		{
			code: "cs",
			name: "Czech"
		},
		{
			code: "cu",
			name: "Old Church Slavonic, Church Slavonic, Old Bulgarian"
		},
		{
			code: "cv",
			name: "Chuvash"
		},
		{
			code: "cy",
			name: "Welsh"
		},
		{
			code: "da",
			name: "Danish"
		},
		{
			code: "de",
			name: "German"
		},
		{
			code: "dv",
			name: "Divehi, Dhivehi, Maldivian"
		},
		{
			code: "dz",
			name: "Dzongkha"
		},
		{
			code: "ee",
			name: "Ewe"
		},
		{
			code: "el",
			name: "Greek (modern)"
		},
		{
			code: "en",
			name: "English"
		},
		{
			code: "eo",
			name: "Esperanto"
		},
		{
			code: "es",
			name: "Spanish"
		},
		{
			code: "et",
			name: "Estonian"
		},
		{
			code: "eu",
			name: "Basque"
		},
		{
			code: "fa",
			name: "Persian (Farsi)"
		},
		{
			code: "ff",
			name: "Fula, Fulah, Pulaar, Pular"
		},
		{
			code: "fi",
			name: "Finnish"
		},
		{
			code: "fj",
			name: "Fijian"
		},
		{
			code: "fo",
			name: "Faroese"
		},
		{
			code: "fr",
			name: "French"
		},
		{
			code: "fy",
			name: "Western Frisian"
		},
		{
			code: "ga",
			name: "Irish"
		},
		{
			code: "gd",
			name: "Scottish Gaelic, Gaelic"
		},
		{
			code: "gl",
			name: "Galician"
		},
		{
			code: "gn",
			name: "Guaraní"
		},
		{
			code: "gu",
			name: "Gujarati"
		},
		{
			code: "gv",
			name: "Manx"
		},
		{
			code: "ha",
			name: "Hausa"
		},
		{
			code: "he",
			name: "Hebrew (modern)"
		},
		{
			code: "hi",
			name: "Hindi"
		},
		{
			code: "ho",
			name: "Hiri Motu"
		},
		{
			code: "hr",
			name: "Croatian"
		},
		{
			code: "ht",
			name: "Haitian, Haitian Creole"
		},
		{
			code: "hu",
			name: "Hungarian"
		},
		{
			code: "hy",
			name: "Armenian"
		},
		{
			code: "hz",
			name: "Herero"
		},
		{
			code: "ia",
			name: "Interlingua"
		},
		{
			code: "id",
			name: "Indonesian"
		},
		{
			code: "ie",
			name: "Interlingue"
		},
		{
			code: "ig",
			name: "Igbo"
		},
		{
			code: "ii",
			name: "Nuosu"
		},
		{
			code: "ik",
			name: "Inupiaq"
		},
		{
			code: "io",
			name: "Ido"
		},
		{
			code: "is",
			name: "Icelandic"
		},
		{
			code: "it",
			name: "Italian"
		},
		{
			code: "iu",
			name: "Inuktitut"
		},
		{
			code: "ja",
			name: "Japanese"
		},
		{
			code: "jv",
			name: "Javanese"
		},
		{
			code: "ka",
			name: "Georgian"
		},
		{
			code: "kg",
			name: "Kongo"
		},
		{
			code: "ki",
			name: "Kikuyu, Gikuyu"
		},
		{
			code: "kj",
			name: "Kwanyama, Kuanyama"
		},
		{
			code: "kk",
			name: "Kazakh"
		},
		{
			code: "kl",
			name: "Kalaallisut, Greenlandic"
		},
		{
			code: "km",
			name: "Khmer"
		},
		{
			code: "kn",
			name: "Kannada"
		},
		{
			code: "ko",
			name: "Korean"
		},
		{
			code: "kr",
			name: "Kanuri"
		},
		{
			code: "ks",
			name: "Kashmiri"
		},
		{
			code: "ku",
			name: "Kurdish"
		},
		{
			code: "kv",
			name: "Komi"
		},
		{
			code: "kw",
			name: "Cornish"
		},
		{
			code: "ky",
			name: "Kyrgyz"
		},
		{
			code: "la",
			name: "Latin"
		},
		{
			code: "lb",
			name: "Luxembourgish, Letzeburgesch"
		},
		{
			code: "lg",
			name: "Ganda"
		},
		{
			code: "li",
			name: "Limburgish, Limburgan, Limburger"
		},
		{
			code: "ln",
			name: "Lingala"
		},
		{
			code: "lo",
			name: "Lao"
		},
		{
			code: "lt",
			name: "Lithuanian"
		},
		{
			code: "lu",
			name: "Luba-Katanga"
		},
		{
			code: "lv",
			name: "Latvian"
		},
		{
			code: "mg",
			name: "Malagasy"
		},
		{
			code: "mh",
			name: "Marshallese"
		},
		{
			code: "mi",
			name: "Māori"
		},
		{
			code: "mk",
			name: "Macedonian"
		},
		{
			code: "ml",
			name: "Malayalam"
		},
		{
			code: "mn",
			name: "Mongolian"
		},
		{
			code: "mr",
			name: "Marathi (Marāṭhī)"
		},
		{
			code: "ms",
			name: "Malay"
		},
		{
			code: "mt",
			name: "Maltese"
		},
		{
			code: "my",
			name: "Burmese"
		},
		{
			code: "na",
			name: "Nauruan"
		},
		{
			code: "nb",
			name: "Norwegian Bokmål"
		},
		{
			code: "nd",
			name: "Northern Ndebele"
		},
		{
			code: "ne",
			name: "Nepali"
		},
		{
			code: "ng",
			name: "Ndonga"
		},
		{
			code: "nl",
			name: "Dutch"
		},
		{
			code: "nn",
			name: "Norwegian Nynorsk"
		},
		{
			code: "no",
			name: "Norwegian"
		},
		{
			code: "nr",
			name: "Southern Ndebele"
		},
		{
			code: "nv",
			name: "Navajo, Navaho"
		},
		{
			code: "ny",
			name: "Chichewa, Chewa, Nyanja"
		},
		{
			code: "oc",
			name: "Occitan"
		},
		{
			code: "oj",
			name: "Ojibwe, Ojibwa"
		},
		{
			code: "om",
			name: "Oromo"
		},
		{
			code: "or",
			name: "Oriya"
		},
		{
			code: "os",
			name: "Ossetian, Ossetic"
		},
		{
			code: "pa",
			name: "Panjabi, Punjabi"
		},
		{
			code: "pi",
			name: "Pāli"
		},
		{
			code: "pl",
			name: "Polish"
		},
		{
			code: "ps",
			name: "Pashto, Pushto"
		},
		{
			code: "pt",
			name: "Portuguese"
		},
		{
			code: "qu",
			name: "Quechua"
		},
		{
			code: "rc",
			name: "Reunionese,Reunion Creole"
		},
		{
			code: "rm",
			name: "Romansh"
		},
		{
			code: "rn",
			name: "Kirundi"
		},
		{
			code: "ro",
			name: "Romanian"
		},
		{
			code: "ru",
			name: "Russian"
		},
		{
			code: "rw",
			name: "Kinyarwanda"
		},
		{
			code: "sa",
			name: "Sanskrit (Saṁskṛta)"
		},
		{
			code: "sc",
			name: "Sardinian"
		},
		{
			code: "sd",
			name: "Sindhi"
		},
		{
			code: "se",
			name: "Northern Sami"
		},
		{
			code: "sg",
			name: "Sango"
		},
		{
			code: "si",
			name: "Sinhalese, Sinhala"
		},
		{
			code: "sk",
			name: "Slovak"
		},
		{
			code: "sl",
			name: "Slovene"
		},
		{
			code: "sm",
			name: "Samoan"
		},
		{
			code: "sn",
			name: "Shona"
		},
		{
			code: "so",
			name: "Somali"
		},
		{
			code: "sq",
			name: "Albanian"
		},
		{
			code: "sr",
			name: "Serbian"
		},
		{
			code: "ss",
			name: "Swati"
		},
		{
			code: "st",
			name: "Southern Sotho"
		},
		{
			code: "su",
			name: "Sundanese"
		},
		{
			code: "sv",
			name: "Swedish"
		},
		{
			code: "sw",
			name: "Swahili"
		},
		{
			code: "ta",
			name: "Tamil"
		},
		{
			code: "te",
			name: "Telugu"
		},
		{
			code: "tg",
			name: "Tajik"
		},
		{
			code: "th",
			name: "Thai"
		},
		{
			code: "ti",
			name: "Tigrinya"
		},
		{
			code: "tk",
			name: "Turkmen"
		},
		{
			code: "tl",
			name: "Tagalog"
		},
		{
			code: "tn",
			name: "Tswana"
		},
		{
			code: "to",
			name: "Tonga (Tonga Islands)"
		},
		{
			code: "tr",
			name: "Turkish"
		},
		{
			code: "ts",
			name: "Tsonga"
		},
		{
			code: "tt",
			name: "Tatar"
		},
		{
			code: "tw",
			name: "Twi"
		},
		{
			code: "ty",
			name: "Tahitian"
		},
		{
			code: "ug",
			name: "Uyghur"
		},
		{
			code: "uk",
			name: "Ukrainian"
		},
		{
			code: "ur",
			name: "Urdu"
		},
		{
			code: "uz",
			name: "Uzbek"
		},
		{
			code: "ve",
			name: "Venda"
		},
		{
			code: "vi",
			name: "Vietnamese"
		},
		{
			code: "vo",
			name: "Volapük"
		},
		{
			code: "wa",
			name: "Walloon"
		},
		{
			code: "wo",
			name: "Wolof"
		},
		{
			code: "xh",
			name: "Xhosa"
		},
		{
			code: "yi",
			name: "Yiddish"
		},
		{
			code: "yo",
			name: "Yoruba"
		},
		{
			code: "za",
			name: "Zhuang, Chuang"
		},
		{
			code: "zh",
			name: "Chinese"
		},
		{
			code: "zu",
			name: "Zulu"
		}
	];

	typesDropdown:JQuery;
	languageDropdown:JQuery;

	/**
	 *  Temporarily contains all the changes made to
	 *  the literal (value, type, language)
	 *  before modifying the original literal.
	 */
	private tempLiteral:any = {};

	private set tempValue( value:string | boolean | number ) {
		this.tempLiteral[ JsonLDKeyword.VALUE ] = value;
	}

	private get tempValue():string | boolean | number {
		return this.tempLiteral[ JsonLDKeyword.VALUE ];
	}

	private set tempType( type:string ) {
		this.tempLiteral[ JsonLDKeyword.TYPE ] = type;
	}

	private get tempType():string {
		return this.tempLiteral[ JsonLDKeyword.TYPE ];
	}

	private set tempLanguage( language:string ) {
		this.tempLiteral[ JsonLDKeyword.LANGUAGE ] = language;
	}

	private get tempLanguage():string {
		return this.tempLiteral[ JsonLDKeyword.LANGUAGE ];
	}


	/**
	 *  Mode
	 */
	private _mode = Modes.READ;
	@Input() set mode( value:Modes ) {
		setTimeout( () => {
			this._mode = value;
			this.onEditMode.emit( this.mode === Modes.EDIT );
			if( this.mode !== Modes.EDIT ) return;
			this.initializeTypesDropdown();
			this.initializeLanguageDropdown();
		}, 0 );
	}

	get mode() {
		return this._mode;
	}

	/**
	 * Literal's Value
	 */
	private _value:string | boolean | number = "";
	get value() {
		return this._value;
	}

	set value( value:string | boolean | number ) {
		this._value = value;
	}

	/**
	 * Literal's Type
	 */
	private _type:string = XSD.string;
	get type() {
		return this._type;
	}

	set type( type:string ) {
		if( type === "empty" ) {
			type = undefined;
		} else if( ! type || type.length === 0 ) {
			type = XSD.string;
		}
		this._type = type;
		this.isStringType = type === XSD.string;
	}

	/**
	 * Literal Language
	 */
	private _language:string = "";
	get language() {
		return this._language;
	}

	set language( language:string ) {
		this._language = language;
		// If no language is set, set language dropdown to empty
		if( ! ! this.languageDropdown && ! this.language ) this.languageDropdown.dropdown( "set selected", "empty" );
	}

	// Inputs and Outputs
	private _literal = <LiteralStatus>{};
	get literal() {
		return this._literal;
	}

	@Input() set literal( value:LiteralStatus ) {
		this._literal = value;
		if( this.literal.added !== void 0 ) {
			this.mode = Modes.EDIT;
		}

		let literalContent:Literal;

		/**
		 *  Check if its going to use the modified,
		 *  the original or the added values of the
		 *  literal.
		 */
		if( this.literal.modified !== void 0 ) {
			literalContent = this.literal.modified;
		} else if( this.literal.copy !== void 0 ) {
			literalContent = this.literal.copy;
		} else if( this.literal.added !== void 0 ) {
			literalContent = this.literal.added;
		}

		this.value = literalContent[ JsonLDKeyword.VALUE ];
		this.type = literalContent[ JsonLDKeyword.TYPE ];
		this.language = literalContent[ JsonLDKeyword.LANGUAGE ];

	}

	@Input() canEdit:boolean = true;
	@Input() canDisplayLanguage:boolean = false;
	@Input() isPartOfList:boolean = false;
	@Input() isFirstItem:boolean = false;
	@Input() isLastItem:boolean = false;

	@Output() onEditMode:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSave:EventEmitter<any> = new EventEmitter<any>();
	@Output() onDeleteLiteral:EventEmitter<LiteralStatus> = new EventEmitter<LiteralStatus>();
	@Output() onMoveUp:EventEmitter<LiteralStatus> = new EventEmitter<LiteralStatus>();
	@Output() onMoveDown:EventEmitter<LiteralStatus> = new EventEmitter<LiteralStatus>();

	@ViewChild( "valueInput" ) valueInputControl;

	constructor( element:ElementRef, cdRef:ChangeDetectorRef ) {
		this.element = element;
		this.cdRef = cdRef;
	}

	ngAfterViewChecked() {
		this.cdRef.detectChanges();
	}

	onEdit( event:Event ):void {
		this.mode = Modes.EDIT;
	}

	deleteLiteral():void {
		if( typeof this.literal.added === "undefined" ) {
			this.literal.deleted = this.literal.copy;
		}
		this.onDeleteLiteral.emit( this.literal );
	}

	cancelEdit():void {
		this.mode = Modes.READ;

		this.restoreDisplayingTokenContent( JsonLDKeyword.VALUE );
		this.restoreDisplayingTokenContent( JsonLDKeyword.TYPE );
		this.restoreDisplayingTokenContent( JsonLDKeyword.LANGUAGE );

		// If canceling a new literal without previous value, delete it
		if( this.literal.added !== void 0 && this.value === void 0 ) {
			this.onDeleteLiteral.emit( this.literal );
		}
	}

	/**
	 *  Sets back the displaying content of the Value / Type / Language of a Literal
	 */
	private restoreDisplayingTokenContent( token:string ):void {

		let displayingContent:string;
		let initialStatus:string = this.literal.copy !== void 0 ? "copy" : "added";

		if( this.tempLiteral[ token ] === void 0 ) {
			displayingContent = this.literal[ initialStatus ][ token ];
			delete this.tempLiteral[ token ];
		} else {
			displayingContent = this.tempLiteral[ token ];
		}

		switch( token ) {
			case JsonLDKeyword.VALUE:
				this.value = displayingContent;
				break;
			case JsonLDKeyword.TYPE:
				this.type = displayingContent;
				break;
			case JsonLDKeyword.LANGUAGE:
				this.language = displayingContent;
				break;
		}
	}

	save():void {
		let initialStatus:string = this.literal.copy !== void 0 ? "copy" : "added";
		let initialValue:string | boolean | number = this.literal[ initialStatus ][ JsonLDKeyword.VALUE ],
			initialType:any = this.literal[ initialStatus ][ JsonLDKeyword.TYPE ],
			initialLanguage:any = this.literal[ initialStatus ][ JsonLDKeyword.LANGUAGE ];

		if( (this.value !== void 0) &&
			(this.value !== initialValue || this.value !== this.tempValue) ) {
			this.tempValue = this.value;
		}
		if( (this.type !== void 0) &&
			(this.type !== initialType || this.type !== this.tempType) ) {
			this.tempType = this.type;
		}
		if( this.language !== initialLanguage || this.language !== this.tempLanguage ) {
			this.tempLanguage = this.language;
		}

		/* Check for tempLiteral to contain valid json+ld for literals
		* 1. @value always present.
		* 2. If @type empty or XSD.string, then delete @type from tempLiteral.
		* 3. If @language empty or when @type different than XSD.string, then delete @language from tempLiteral.
		*/

		// 1. @value always present, if not clean whole object.
		if( this.tempValue === void 0 ) {
			delete this.tempLiteral[ JsonLDKeyword.VALUE ];
			delete this.tempLiteral[ JsonLDKeyword.TYPE ];
			delete this.tempLiteral[ JsonLDKeyword.LANGUAGE ];
		}

		// 2. If @type empty or XSD.string, then delete @type from tempLiteral.
		if( this.tempType === void 0 || this.tempType === XSD.string ) {
			delete this.tempLiteral[ JsonLDKeyword.TYPE ];
		}

		// 3. If @language empty or when @type different than XSD.string, then delete @language from tempLiteral.
		if( (this.tempLanguage === void 0) ||
			(this.tempType !== void 0 && this.tempType !== XSD.string) ) {
			delete this.tempLiteral[ JsonLDKeyword.LANGUAGE ];
		}

		switch( initialStatus ) {
			case "copy":
				if( initialValue === this.tempValue &&
					initialType === this.tempType &&
					initialLanguage === this.tempLanguage ) {
					delete this.tempLiteral[ JsonLDKeyword.VALUE ];
					delete this.tempLiteral[ JsonLDKeyword.TYPE ];
					delete this.tempLiteral[ JsonLDKeyword.LANGUAGE ];
					delete this.literal.modified;
				} else {
					this.literal.modified = this.tempLiteral;
				}
				break;
			case "added":
				this.literal.added = this.tempLiteral;
				break;
		}


		this.onSave.emit( this.literal );
		this.mode = Modes.READ;
	}

	private initializeLanguageDropdown():void {
		this.languageDropdown = $( this.element.nativeElement.querySelector( ".dropdown.languages" ) );
		this.languageDropdown.dropdown( {
			allowAdditions: false,
			onChange: this.changeLanguage.bind( this )
		} );
		this.languageDropdown.dropdown( "set selected", this.language );
	}

	private initializeTypesDropdown():void {
		this.typesDropdown = $( this.element.nativeElement.querySelector( ".dropdown.types" ) );
		this.typesDropdown.dropdown( {
			allowAdditions: true,
			onChange: this.changeType.bind( this )
		} );
		this.typesDropdown.dropdown( "set selected", this.type );
	}

	private changeLanguage( language:string, text?:string, choice?:JQuery ):void {
		if( language === "empty" ) language = undefined;
		this.language = language;
	}

	private changeType( type:string, text?:string, choice?:JQuery ):void {
		this.isStringType = type === XSD.string;
		if( type === XSD.string ) {
			type = undefined;
		}
		if( ! this.isStringType ) {
			this.language = undefined;
		}
		this.type = type;
	}

	private getDataTypes():any {
		let dataTypes:any[] = [];
		let xsdDataTypes:any[] = this.getXSDDataTypes();
		dataTypes = dataTypes.concat( xsdDataTypes );
		return dataTypes;
	}

	private getXSDDataTypes():any[] {
		let xsdDataTypes:any[] = [];
		for( const key of Object.keys( XSD ) ){
			const value = XSD[ key ];
			if( URI.isAbsolute( value ) && key !== "namespace" ) {
				xsdDataTypes.push( {
					title: key,
					description: value,
					value: value
				} );
			}
		}
		return xsdDataTypes;
	}

	moveUp():void {
		this.onMoveUp.emit( this.literal );
	}

	moveDown():void {
		this.onMoveDown.emit( this.literal );
	}

}

export interface LiteralStatus {
	copy:Literal;
	modified?:Literal;
	added?:Literal;
	deleted?:Literal;
}

export interface Literal {
	[ JsonLDKeyword.VALUE ]:string | number | boolean;
	[ JsonLDKeyword.TYPE ]?:string;
	[ JsonLDKeyword.LANGUAGE ]?:string;
}
