import { FormatUtils } from "../../process/utils/formatUtils";

export class CommandParam {
	
	public name: string;
	public format: string;
	public category: string;

	constructor(name: string, format: string, category: string) {
		this.name = name;
		this.format = format;
		this.category = category;
	}
	
	public checkFormat(value: string): boolean {
		if( this.format === "int") {
			return FormatUtils.isInt(value);
		} else if( this.format === "float") {
			return FormatUtils.isIntOrFloat(value);
		} else if( this.format === "vector") {
			return value.indexOf("vector()") == 0 || FormatUtils.isVector(value);
		} else if( this.format === "vector4") {
			return FormatUtils.isVector4(value);
		} else if( this.format === "color") {
			return FormatUtils.isVector(value);
		} else if( this.format === "boolean") {
			return FormatUtils.isBool(value);
		} else if( this.format === "point") {
			return FormatUtils.isPoint(value);
		}
		return true;
	}
}