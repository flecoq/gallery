
export class CommandLogMessage {
	
	public message: string;
	public color: string;
	
	constructor(message: string, type: string) {
		this.message = message;
		if( "info" === type ) {
			this.color = "#ddd";
		} else if( "alt" === type ) {
			this.color = "#fff";
		} else if( "cmd" === type ) {
			this.color = "#8f8";
		} else if( "error" === type ) {
			this.color = "#f88";
		} else if( "warn" === type ) {
			this.color = "#ff8700";
		} else if( "help" === type ) {
			this.color = "#ffff64";
		}
	}
}