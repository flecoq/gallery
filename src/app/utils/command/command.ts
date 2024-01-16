import { Vector3 } from "@babylonjs/core/Maths/math";
import { CommandContext } from './commandContext';
import { CommandArg } from './commandArg';
import { CommandLogMonitor } from './commandLogMonitor';
import { FormatUtils } from "../../process/utils/formatUtils";
import { Point } from "../../process/utils/point";

export class Command {
	
	public id: string;
	public context: CommandContext;
	public execution: any;
	public argList: CommandArg[] = [];
	public helpList: string[] = [];
	
	constructor(id: string) {
		this.id = id;
		this.appendHelp("help " + id + " command:");
	}
	
	public appendArg(arg: CommandArg): void {
		this.argList.push(arg);
	}
	
	public appendHelp(help: string): void {
		this.helpList.push(help);
	}
	
	public appendHelpExample(args: string, result: string): void {
		this.helpList.push("  " + this.id + " " + args + " -> " + result);
	}
	
	public help(logMonitor: CommandLogMonitor): void {
		for(let help of this.helpList) {
			logMonitor.help(help);
		}
	}
	
	public getOptionArg(keyword:string): CommandArg {
		for(let arg of this.argList) {
			if( "option" === arg.type && keyword === arg.keyword) {
				return arg;
			}
		}
		return null;
	}
	
	public isOptionArg(keyword:string): boolean {
		return this.getOptionArg(keyword) != null;
	}
	
	public getKeyArg(keyword:string): CommandArg {
		for(let arg of this.argList) {
			if( "key" === arg.type && keyword === arg.keyword) {
				return arg;
			}
		}
		return null;
	}
	
	public getKeyArgValue(keyword:string): string {
		var arg: CommandArg = this.getKeyArg(keyword);
		return arg == null ? null : arg.value;
	}

	public getKeyArgInt(keyword:string): number {
		var value: string = this.getKeyArgValue(keyword);
		return value ? FormatUtils.toInt(value) : null;
	}
	
	public getKeyArgFloat(keyword:string): number {
		var value: string = this.getKeyArgValue(keyword);
		return value ? FormatUtils.toFloat(value) : null;
	}
	
	public getKeyArgVector(keyword:string): Vector3 {
		var value: string = this.getKeyArgValue(keyword);
		return value ? FormatUtils.toVector(value) : null;
	}
	
	public getKeyArgPoint(keyword:string): Point {
		var value: string = this.getKeyArgValue(keyword);
		return value ? FormatUtils.toPoint(value) : null;
	}
	
	public checkArgList(argList: CommandArg[], logMonitor: CommandLogMonitor): boolean {
		var result:boolean = true;
		for(let arg of argList) {
			var argRef:CommandArg = "option" === arg.type ? this.getOptionArg(arg.keyword) : this.getKeyArg(arg.keyword);
			if( argRef == null ) {
				logMonitor.append("ERR: '" + arg.keyword + "' undefined argument.", "error");
				result = false;
			} else if( !argRef.checkFormat(arg.value)) {
				logMonitor.append("ERR: '" + arg.keyword + ":" + arg.value + "' value bad format.", "error");
				result = false;
			}
		}
		return result;
	}
	
	public static parse(input: string, logMonitor: CommandLogMonitor): Command {
		logMonitor.append("-> " + input, "cmd");
		var args: string[] = input.split(" ");
		if( args.length > 0 ) {
			var result: Command = new Command(args[0]);
			for(let u = 1; u < args.length; u++) {
				var commandArg: CommandArg = Command.parseArg(args[u]);
				if( commandArg != null ) {
					result.appendArg(commandArg);
				} else {
					logMonitor.append("ERR: '" + args[u] + "' argument bad format.", "error");
				}
			}
			return result;
		}
		return null;
	}
	
	private static parseArg(arg:string): CommandArg {
		if( "-" === arg.substring(0, 1)) {
			var option: string = arg.substring(1, arg.length);
			return new CommandArg(null, "option", option, null, null);
		} else if( arg.indexOf(":") > 0) {
			var values: string[] = arg.split(":");
			return new CommandArg(null, "key", values[0], null, values[1]);
		}
		return null;
	} 
}