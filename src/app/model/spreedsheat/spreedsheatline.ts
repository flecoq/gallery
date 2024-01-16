
export class Spreedsheatline {
	
	public values:string[] = [];
	
    constructor() {}

	public addValue(value:string) {
		this.values.push(value);
	}

	public getType():string {
		return this.values[0];
	}	
}
