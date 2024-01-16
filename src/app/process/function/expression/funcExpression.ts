import { Func } from '../../../model/assembler/func';
import { FuncValue } from '../../../process/function/funcValue';

export class FuncExpression extends Func {
	
	constructor(func: Func) {
		super(func.type);
		func.copy(this);
	 }

	public getResult(): FuncValue {
		return null;
	}
	
}