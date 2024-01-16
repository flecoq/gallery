
export class CharExpression {
	
	public static OPERATOR_SUM: number = 1;
	public static OPERATOR_DIFF: number = 2;
	public static OPERATOR_PRODUCT: number = 3;
	public static OPERATOR_DIV: number = 4;
	
	public static CHAR_OPERATOR_SUM: CharExpression = new CharExpression("+", CharExpression.OPERATOR_SUM);
	public static CHAR_OPERATOR_DIFF: CharExpression = new CharExpression("-", CharExpression.OPERATOR_DIFF);
	public static CHAR_OPERATOR_PRODUCT: CharExpression = new CharExpression("*", CharExpression.OPERATOR_PRODUCT);
	public static CHAR_OPERATOR_DIV: CharExpression = new CharExpression("/", CharExpression.OPERATOR_DIV);
	
	public static CHAR_PARENTHESIS_BEGIN: CharExpression = new CharExpression("(", null);
	public static CHAR_PARENTHESIS_END: CharExpression = new CharExpression(")", null);
	public static CHAR_POINT: CharExpression = new CharExpression(".", null);
	public static CHAR_COMMA: CharExpression = new CharExpression(",", null);
	public static CHAR_SEMICOLON: CharExpression = new CharExpression(";", null);

	public static list: CharExpression[] = [ CharExpression.CHAR_OPERATOR_SUM, CharExpression.CHAR_OPERATOR_DIFF, CharExpression.CHAR_OPERATOR_PRODUCT, CharExpression.CHAR_OPERATOR_DIV,
			CharExpression.CHAR_PARENTHESIS_BEGIN, CharExpression.CHAR_PARENTHESIS_END, CharExpression.CHAR_POINT, CharExpression.CHAR_COMMA, CharExpression.CHAR_SEMICOLON ];

	public static listOperator: CharExpression[] = [ CharExpression.CHAR_OPERATOR_SUM, CharExpression.CHAR_OPERATOR_DIFF, CharExpression.CHAR_OPERATOR_PRODUCT, CharExpression.CHAR_OPERATOR_DIV ];

	public value: string;
	public operator: number;
	
	constructor(value: string, operator: number) {
		this.value = value;
		this.operator = operator;
	}

	public static find(value: string): CharExpression {
		for (let charExpression of CharExpression.list) {
			if (charExpression.value === value) {
				return charExpression;
			}
		}
		return null;
	}

	public static findOperator(value: string): CharExpression {
		for (let charExpression of CharExpression.listOperator) {
			if (charExpression.value === value) {
				return charExpression;
			}
		}
		return null;
	}

	public equals(b: CharExpression):boolean  {
		return b ? b.value === this.value : false;
	}

}