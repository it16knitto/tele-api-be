export enum TipeCabangEnum {
	Production = 'production',
	Sandbox = 'sandbox'
}
declare interface CabangEntity {
	id?: number;
	create_date?: string;
	name?: string;
	ip_address?: string;
	credentialid?: string;
	tipe_cabang?: TipeCabangEnum;
}
