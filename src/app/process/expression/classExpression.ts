import { FuncDefinition } from '../function/funcDefinition';
import { FuncValue } from '../function/funcValue';
import { Func } from '../../model/assembler/func';
import { PropertyExpression } from './propertyExpression';
import { Vector3 } from "@babylonjs/core";
//import { Pivot } from '../utils/pivot';

export class ClassExpression {
	
	public static CLASS_BOOLEAN:string = "boolean";
	public static CLASS_INTEGER:string = "integer";
	public static CLASS_FLOAT:string = "float";
	public static CLASS_POINT:string = "point";
	public static CLASS_VECTOR:string = "vector";
	public static CLASS_PIVOT:string = "pivot";
	public static CLASS_STRING:string = "string";

	public static BOOLEAN: ClassExpression;
	public static INTEGER: ClassExpression;
	public static FLOAT: ClassExpression;
	public static VECTOR: ClassExpression;
	public static POINT: ClassExpression;
	public static PIVOT: ClassExpression;
	public static STRING: ClassExpression;
	
	public name: string;
	
	public funcList: FuncDefinition[] = [];
	public propList: PropertyExpression[] = [];
	
	constructor(name: string) {
		this.name = name;	
	}
	
	public addFunction(func: FuncDefinition): void {
		this.funcList.push(func);
	}
	
	public addProperty(property: PropertyExpression): void {
		this.propList.push(property);
	}
	
	public equals(b: ClassExpression): boolean {
		return b ? b.name === this.name : false;
	}
	
	public compatible(b: ClassExpression): boolean {
		return b ? b.name === this.name || (b.name === "integer" && this.name === "float") : false;
	}

	public static init(): void {
		if( ClassExpression.BOOLEAN == null ) {
			ClassExpression.BOOLEAN = new ClassExpression(ClassExpression.CLASS_BOOLEAN);
			ClassExpression.INTEGER = new ClassExpression(ClassExpression.CLASS_INTEGER);
			ClassExpression.FLOAT = new ClassExpression(ClassExpression.CLASS_FLOAT);
			ClassExpression.POINT = new ClassExpression(ClassExpression.CLASS_POINT);
			
			ClassExpression.VECTOR = new ClassExpression(ClassExpression.CLASS_VECTOR);
			ClassExpression.VECTOR.addProperty(new PropertyExpression("x", ClassExpression.FLOAT));
			ClassExpression.VECTOR.addProperty(new PropertyExpression("y", ClassExpression.FLOAT));
			ClassExpression.VECTOR.addProperty(new PropertyExpression("z", ClassExpression.FLOAT));
			ClassExpression.VECTOR.addFunction(new FuncDefinition("length", "float"));
			
			ClassExpression.PIVOT = new ClassExpression(ClassExpression.CLASS_PIVOT);
			ClassExpression.PIVOT.addProperty(new PropertyExpression("pos-rot", ClassExpression.VECTOR));
			ClassExpression.PIVOT.addProperty(new PropertyExpression("pos", ClassExpression.VECTOR));
			ClassExpression.PIVOT.addProperty(new PropertyExpression("rot", ClassExpression.VECTOR));
			ClassExpression.PIVOT.addProperty(new PropertyExpression("u", ClassExpression.VECTOR));
			ClassExpression.PIVOT.addProperty(new PropertyExpression("w", ClassExpression.VECTOR));
			var func: FuncDefinition = new FuncDefinition("translate", "pivot");
			func.addDefParam("x", true, "float");
			func.addDefParam("y", true, "float");
			func.addDefParam("z", true, "float");
			ClassExpression.PIVOT.addFunction(func);
		
			ClassExpression.STRING = new ClassExpression(ClassExpression.CLASS_STRING);
		
			//OperatorExpression.init();
		}
	}
	
	
	public static get(name: string): ClassExpression {
		var list: ClassExpression[] = [ ClassExpression.BOOLEAN, ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.POINT, ClassExpression.VECTOR, ClassExpression.PIVOT, ClassExpression.STRING ];
		for (let result of list) {
			if (result && result.name === name) {
				return result;
			}
		}
		return null;
	}

	public static  getFuncValue(value: FuncValue, func: Func): FuncValue {
		if (ClassExpression.get(value.type) == ClassExpression.VECTOR) {
			var vector: Vector3 = value.vector;
			if ("length" === func.type) {
				return FuncValue.createFromFloat(vector.length());
			}
		} /*else if (ClassExpression.get(value.type) == ClassExpression.PIVOT) {
			var pivot: Pivot = value.pivot;
			if ("translate" === func.type) {
				var local: Pivot = Pivot.createFromOrigin(new Vector3(func.getParamValueFloat("x"), func.getParamValueFloat("y"),
						func.getParamValueFloat("z")));
				return  FuncValue.createFromPivot(pivot.localToGlobalPivot(local));
			}
		}*/
		return null;
	}
	
	public static  getPropertyResult(value: FuncValue,  property: PropertyExpression): FuncValue {
		if (ClassExpression.get(value.type) == ClassExpression.VECTOR) {
			var vector: Vector3 = value.vector;
			if ("x" === property.name) {
				return FuncValue.createFromFloat(vector.x);
			} else if ("y" === property.name) {
				return FuncValue.createFromFloat(vector.y);
			} else if ("z" === property.name) {
				return FuncValue.createFromFloat(vector.z);
			}
		} /*else if (ClassExpression.get(value.type) == ClassExpression.PIVOT) {
			var pivot: Pivot = value.pivot;
			if ("pos" === property.name) {
				return FuncValue.createFromVector(pivot.o);
			} else if ("rot" === property.name) {
				return FuncValue.createFromVector(pivot.getEulerAnglesDeg());
			} else if ("pos-rot" === property.name) {
				return FuncValue.createFromString(pivot.o.toString() + ";" + pivot.getEulerAnglesDeg().toString());
			} else if ("u" === property.name) {
				return FuncValue.createFromVector(pivot.u);
			} else if ("v" === property.name) {
				return FuncValue.createFromVector(pivot.v);
			} else if ("w" === property.name) {
				return FuncValue.createFromVector(pivot.w);
			}
		}*/
		return null;
	}

}