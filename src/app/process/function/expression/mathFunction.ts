import { Func } from '../../../model/assembler/func';
import { FuncExpression } from '../../../process/function/expression/funcExpression';
import { FuncValue } from '../../../process/function/funcValue';
import { FormatUtils } from '../../../process/utils/formatUtils';

export class MathFunction extends FuncExpression {
	
	constructor(func: Func) {
		super(func);
	 }

	public getResult(): FuncValue {
		var value:number = this.getParamValueFloat("value");
		if ("sin" === this.type) {
			return FuncValue.createFromFloat(Math.sin(FormatUtils.degToRad(value)));
		} else if ("asin" === this.type) {
			return FuncValue.createFromFloat(FormatUtils.radToDeg(Math.asin(value)));
		} else if ("cos" === this.type) {
			return FuncValue.createFromFloat(Math.cos(FormatUtils.degToRad(value)));
		} else if ("acos" === this.type) {
			return FuncValue.createFromFloat(FormatUtils.radToDeg(Math.acos(value)));
		} else if ("tan" === this.type) {
			return FuncValue.createFromFloat(Math.tan(FormatUtils.degToRad(value)));
		} else if ("atan" === this.type) {
			return FuncValue.createFromFloat(FormatUtils.radToDeg(Math.tan(value)));
		} else if ("trunc" === this.type) {
			return FuncValue.createFromFloat(Math.round(value));
		} else if ("abs" === this.type) {
			return FuncValue.createFromFloat(Math.abs(value));
		}
		return null;
	}
	
	public static isMathFunction(type: string): boolean {
		return "sin" === type || "asin" === type || "cos" === type || "acos" === type
				|| "tan" === type || "atan" === type || "trunc" === type || "abs" === type;
	}

}