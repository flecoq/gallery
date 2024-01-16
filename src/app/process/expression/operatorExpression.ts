import { FuncValue } from '../function/funcValue';
import { PropertyExpression } from './propertyExpression';
import { ClassExpression } from './classExpression';
import { CharExpression } from './charExpression';
import { Point } from "../utils/point"
 
export class OperatorExpression {
		
	public leftClass: ClassExpression;
	public rightClass: ClassExpression;
	public result: ClassExpression;
	public operator: number;
	public permut: boolean;
	
	public static list: OperatorExpression[] = [];
	
	constructor(leftClass: ClassExpression, rightClass: ClassExpression, result: ClassExpression, operator: CharExpression, permut: boolean) {
		this.leftClass = leftClass;	
		this.rightClass = rightClass;	
		this.result = result;
		this.operator = operator.operator;
		this.permut = permut;	
	}


	public execute(a: FuncValue, b: FuncValue): FuncValue {
		if (ClassExpression.get(a.type) == ClassExpression.FLOAT && ClassExpression.get(b.type) == ClassExpression.FLOAT) {
			// float & float
			if (this.operator == CharExpression.OPERATOR_DIFF) {
				return FuncValue.createFromFloat(a.float - b.float);
			} else if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromFloat(a.float / b.float);
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromFloat(a.float * b.float);
			} else if (this.operator == CharExpression.OPERATOR_SUM) {
				return FuncValue.createFromFloat(a.float + b.float);
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.INTEGER && ClassExpression.get(b.type) == ClassExpression.INTEGER) {
			// integer & integer
			if (this.operator == CharExpression.OPERATOR_DIFF) {
				return FuncValue.createFromInt(a.integer - b.integer);
			} else if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromFloat(a.integer / b.integer);
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromInt(a.integer * b.integer);
			} else if (this.operator == CharExpression.OPERATOR_SUM) {
				return FuncValue.createFromInt(a.integer + b.integer);
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.INTEGER && ClassExpression.get(b.type) == ClassExpression.FLOAT) {
			// integer & float
			if (this.operator == CharExpression.OPERATOR_DIFF) {
				return FuncValue.createFromFloat(a.integer - b.float);
			} else if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromFloat(a.integer / b.float);
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromFloat(a.integer * b.float);
			} else if (this.operator == CharExpression.OPERATOR_SUM) {
				return FuncValue.createFromFloat(a.integer + b.float);
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.FLOAT && ClassExpression.get(b.type) == ClassExpression.INTEGER) {
			// float & integer
			if (this.operator == CharExpression.OPERATOR_DIFF) {
				return FuncValue.createFromFloat(a.float - b.integer);
			} else if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromFloat(a.float / b.integer);
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromFloat(a.float * b.integer);
			} else if (this.operator == CharExpression.OPERATOR_SUM) {
				return FuncValue.createFromFloat(a.float + b.integer);
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.VECTOR
				&& ClassExpression.get(b.type) == ClassExpression.INTEGER) {
			// vector & integer
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromVector(a.vector.scale(1 / b.integer));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromVector(a.vector.scale(b.integer));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.VECTOR
				&& ClassExpression.get(b.type) == ClassExpression.FLOAT) {
			// vector & float
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromVector(a.vector.scale(1 / b.float));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromVector(a.vector.scale(b.float));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.INTEGER
				&& ClassExpression.get(b.type) == ClassExpression.VECTOR) {
			// integer & vector
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromVector(b.vector.scale(1 / a.integer));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromVector(b.vector.scale(a.integer));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.FLOAT
				&& ClassExpression.get(b.type) == ClassExpression.VECTOR) {
			// float & vector
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromVector(b.vector.scale(1 / a.float));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromVector(b.vector.scale(a.float));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.VECTOR
				&& ClassExpression.get(b.type) == ClassExpression.VECTOR) {
			// vector & vector
			if (this.operator == CharExpression.OPERATOR_SUM) {
				return FuncValue.createFromVector(a.vector.add(b.vector));
			} else if (this.operator == CharExpression.OPERATOR_DIFF) {
				return FuncValue.createFromVector(a.vector.subtract(b.vector));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromVector(a.vector.cross(b.vector));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.POINT && ClassExpression.get(b.type) == ClassExpression.FLOAT) {
			// point & float
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromPoint(
						new Point(a.point.x / b.float, a.point.y / b.float));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromPoint(
						new Point(a.point.x * b.float, a.point.y * b.float));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.FLOAT && ClassExpression.get(b.type) == ClassExpression.POINT) {
			// point & float
			if (this.operator == CharExpression.OPERATOR_DIV) {
				return FuncValue.createFromPoint(
						new Point(b.point.x / a.float, b.point.y / a.float));
			} else if (this.operator == CharExpression.OPERATOR_PRODUCT) {
				return FuncValue.createFromPoint(
						new Point(b.point.x * a.float, b.point.y * a.float));
			}
		} else if (ClassExpression.get(a.type) == ClassExpression.STRING
				&& ClassExpression.get(b.type) == ClassExpression.STRING) {
			// string & string
			if (this.operator == CharExpression.OPERATOR_SUM) {
				return new FuncValue(a.value + b.value);
			}
		}
		return null;
	}

	public static init(): void {
		if (this.list.length == 0) {
			// integer & integer
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.INTEGER, ClassExpression.INTEGER,
					CharExpression.CHAR_OPERATOR_DIFF, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.INTEGER, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.INTEGER, ClassExpression.INTEGER,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.INTEGER, ClassExpression.INTEGER,
					CharExpression.CHAR_OPERATOR_SUM, true));
			// integer & float
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIFF, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_SUM, true));
			// float & float
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIFF, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.INTEGER, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_SUM, true));
			// float & float
			this.list.push(new OperatorExpression(ClassExpression.FLOAT, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIFF, true));
			this.list.push(new OperatorExpression(ClassExpression.FLOAT, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.FLOAT, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.FLOAT, ClassExpression.FLOAT, ClassExpression.FLOAT,
					CharExpression.CHAR_OPERATOR_SUM, true));
			// vector & integer
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.INTEGER, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.INTEGER, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			// vector & float
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.FLOAT, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_DIV, true));
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.FLOAT, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			// vector & vector
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.VECTOR, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.VECTOR, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_SUM, true));
			this.list.push(new OperatorExpression(ClassExpression.VECTOR, ClassExpression.VECTOR, ClassExpression.VECTOR,
					CharExpression.CHAR_OPERATOR_DIFF, true));
			// point & float
			this.list.push(new OperatorExpression(ClassExpression.POINT, ClassExpression.FLOAT, ClassExpression.POINT,
					CharExpression.CHAR_OPERATOR_DIV, false));
			this.list.push(new OperatorExpression(ClassExpression.POINT, ClassExpression.FLOAT, ClassExpression.POINT,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			// point & point
			this.list.push(new OperatorExpression(ClassExpression.POINT, ClassExpression.POINT, ClassExpression.POINT,
					CharExpression.CHAR_OPERATOR_PRODUCT, true));
			this.list.push(new OperatorExpression(ClassExpression.POINT, ClassExpression.POINT, ClassExpression.POINT,
					CharExpression.CHAR_OPERATOR_SUM, true));
			this.list.push(new OperatorExpression(ClassExpression.POINT, ClassExpression.POINT, ClassExpression.POINT,
					CharExpression.CHAR_OPERATOR_DIV, true));
			// string & string
			this.list.push(new OperatorExpression(ClassExpression.STRING, ClassExpression.STRING, ClassExpression.STRING,
					CharExpression.CHAR_OPERATOR_SUM, true));
		}
	}
	
	
	public static getOperator(leftClass: ClassExpression, rightClass: ClassExpression, operator: number): OperatorExpression {
		for (let opExp of this.list) {
			if (operator == opExp.operator
					&& ((opExp.leftClass.equals(leftClass) && opExp.rightClass.equals(rightClass))
							|| (opExp.leftClass.equals(rightClass) && opExp.rightClass.equals(leftClass)
									&& opExp.permut))) {
				return opExp;
			}
		}
		return null;
	}

}