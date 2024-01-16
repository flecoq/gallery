import { Func } from '../../../model/assembler/func';
import { FuncExpression } from '../../../process/function/expression/funcExpression';
import { FuncValue } from '../../../process/function/funcValue';

export class RandomFunction extends FuncExpression {
	
	constructor(func: Func) {
		super(func);
	 }

	public getResult(): FuncValue {
		var min: number = this.getParamValueFloat("min");
		var max: number = this.getParamValueFloat("max");
		var random: number = Math.random();
		return FuncValue.createFromFloat(min * (1 - random) + max * random);
	}
	
}