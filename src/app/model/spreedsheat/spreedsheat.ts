import { Spreedsheatline } from './spreedsheatline';
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from "../../process/utils/point";

export class Spreedsheat {
	public lines: Spreedsheatline[] = [];

	constructor(data:string) {
		for (let values of data.split("\n")) {
			let line:Spreedsheatline = this.appendLine();
			for(let value of values.split(";") ) {
				line.addValue(value);
			}
		}
	}

	public appendLine(): Spreedsheatline {
		var result = new Spreedsheatline();
		this.lines.push(result);
		return result;
	}
	
	public getValue(key:string, range: number):string {
		let index:number = this.getIndex(key, range);
		return index ? this.lines[range].values[index] : null;
	}
	
	public getValueInt(key:string, range: number):number {
		let result:string = this.getValue(key, range);
		return result ? FormatUtils.toInt(result) : null;
	}
	
	public getValuePoint(key:string, range: number):Point {
		let result:string = this.getValue(key, range);
		return result ? FormatUtils.toPoint(result) : null;
	}
	
	private getIndex(key:string, range: number):number {
		let headerRange:number = range - 1;
		while( headerRange > 0 && !(this.lines[headerRange].getType() === "H")) {
			headerRange--;
		}
		var index:number = 0;
		for(let value of this.lines[headerRange].values) {
			if( value === key ) {
				return index;
			}
			index++;
		}
		return null;
	}
	
	public getLineType(range:number): string {
		return this.lines[range].getType();
	}

}
