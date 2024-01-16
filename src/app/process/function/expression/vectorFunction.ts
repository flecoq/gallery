import { Func } from '../../../model/assembler/func';
import { FuncExpression } from '../../../process/function/expression/funcExpression';
import { FuncValue } from '../../../process/function/funcValue';

import { Vector3 } from '@babylonjs/core';

export class VectorFunction extends FuncExpression {
	
	constructor(func: Func) {
		super(func);
	 }

	public getResult(): FuncValue {
		var x: number = this.getParamValueFloat("x");
		var y: number = this.getParamValueFloat("y");
		var z: number = this.getParamValueFloat("z");
		var random: number = Math.random();
		return FuncValue.createFromVector(new Vector3(x, y, z));
	}
	
}