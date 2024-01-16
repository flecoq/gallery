
export class Logger {
	
	public static debugLevel: boolean = true;
	
	public static log(prefix: string, className: string, msg: any): void {
		console.log("[" + prefix + "] " + className + " - " + JSON.stringify(msg));
	}
	
	public static fatal(className: string, msg: any): void {
		Logger.log("FATAL", className, msg);
	}
	
	public static error(className: string, msg: any): void {
		Logger.log("ERROR", className, msg);
	}
	
	public static warning(className: string, msg: any): void {
		Logger.log("WARN", className, msg);
	}
	
	public static info(className: string, msg: any): void {
		Logger.log("INFO", className, msg);
	}
	
	public static debug(className: string, msg: any): void {
		if( Logger.debugLevel ) {
			Logger.log("DEBUG", className, msg);
		}
	}
}