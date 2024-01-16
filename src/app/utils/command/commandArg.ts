
export class CommandArg {
	
	public id: string;
	public type: string;
	public keyword: string;
	public format: string;
	public value: string;

	constructor(id: string, type: string, keyword: string, format: string, value: string) {
		this.id = id;
		this.type = type;
		this.keyword = keyword;
		this.format = format;
		this.value = value;
	}
	
	public checkFormat(value: string): boolean {
		return true;
	}
}