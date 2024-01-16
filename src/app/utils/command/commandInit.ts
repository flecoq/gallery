import { CommandArg } from './commandArg';
import { CommandParam } from './commandParam';
import { Command } from './command';

export class CommandInit {

	private commandParamList: CommandParam[] = [];

	public getCommandRef(): Command {
		var result: Command = new Command(null);

		result.appendArg(new CommandArg("room", "key", "r", "string", null));
		result.appendArg(new CommandArg("process", "key", "pr", "string", null));
		result.appendArg(new CommandArg("scene", "key", "s", "string", null));
		result.appendArg(new CommandArg("child", "key", "ch", "string", null));
		result.appendArg(new CommandArg("param", "key", "p", "string", null));
		result.appendArg(new CommandArg("value", "key", "v", "string", null));
		result.appendArg(new CommandArg("creation", "key", "cr", "string", null));
		result.appendArg(new CommandArg("id", "key", "id", "string", null));
		result.appendArg(new CommandArg("file", "key", "file", "string", null));
		result.appendArg(new CommandArg("url", "key", "url", "string", null));
		result.appendArg(new CommandArg("layer", "key", "l", "string", null));
		result.appendArg(new CommandArg("name", "key", "n", "string", null));
		result.appendArg(new CommandArg("create", "key", "create", "string", null));
		result.appendArg(new CommandArg("type", "key", "type", "string", null));
		result.appendArg(new CommandArg("cam", "key", "c", "string", null));
		result.appendArg(new CommandArg("ori", "key", "ori", "string", null));
		result.appendArg(new CommandArg("create", "key", "create", "string", null));
		result.appendArg(new CommandArg("template", "key", "t", "string", null));
		result.appendArg(new CommandArg("type", "key", "type", "string", null));
		result.appendArg(new CommandArg("args", "key", "args", "string", null));
		result.appendArg(new CommandArg("mat", "key", "mat", "string", null));
		result.appendArg(new CommandArg("title", "key", "title", "string", null));
		result.appendArg(new CommandArg("desc", "key", "desc", "string", null));
		result.appendArg(new CommandArg("rename", "key", "rn", "string", null));
		result.appendArg(new CommandArg("wall", "key", "w", "string", null));
		result.appendArg(new CommandArg("support", "key", "sp", "string", null));
		result.appendArg(new CommandArg("size", "key", "size", "point", null));
		result.appendArg(new CommandArg("local", "key", "local", "point", null));
		result.appendArg(new CommandArg("translate", "key", "tr", "vector", null));
		result.appendArg(new CommandArg("rotation", "key", "rot", "vector", null));
		result.appendArg(new CommandArg("scale", "key", "scale", "vector", null));
		result.appendArg(new CommandArg("source", "key", "src", "string", null));
		result.appendArg(new CommandArg("push", "key", "push", "string", null));
		result.appendArg(new CommandArg("pull", "key", "pull", "string", null));
		result.appendArg(new CommandArg("prefix", "key", "pf", "string", null));
		result.appendArg(new CommandArg("suffix", "key", "sf", "string", null));
		result.appendArg(new CommandArg("asset", "key", "asset", "string", null));
		result.appendArg(new CommandArg("width", "key", "width", "string", null));
		result.appendArg(new CommandArg("focus", "key", "focus", "string", null));
		result.appendArg(new CommandArg("type", "key", "type", "string", null));

		result.appendArg(new CommandArg("x", "key", "x", "float", null));
		result.appendArg(new CommandArg("y", "key", "y", "float", null));
		result.appendArg(new CommandArg("z", "key", "z", "float", null));
		result.appendArg(new CommandArg("center", "key", "ct", "point", null));
		result.appendArg(new CommandArg("centerRotate", "key", "rct", "vector", null));
		result.appendArg(new CommandArg("distance", "key", "dist", "float", null));

		result.appendArg(new CommandArg("spreedsheatOpt", "key", "sp", "string", null));

		result.appendArg(new CommandArg("helpOpt", "option", "h", "string", null));
		result.appendArg(new CommandArg("commandOpt", "option", "cmd", "string", null));
		result.appendArg(new CommandArg("histoOpt", "option", "histo", "string", null));
		result.appendArg(new CommandArg("templateOpt", "option", "t", "string", null));
		result.appendArg(new CommandArg("contextOpt", "option", "ctx", "string", null));
		result.appendArg(new CommandArg("roomOpt", "option", "r", "string", null));
		result.appendArg(new CommandArg("processOpt", "option", "pr", "string", null));
		result.appendArg(new CommandArg("sceneOpt", "option", "s", "string", null));
		result.appendArg(new CommandArg("childOpt", "option", "ch", "string", null));
		result.appendArg(new CommandArg("paramOpt", "option", "p", "string", null));
		result.appendArg(new CommandArg("creationOpt", "option", "cr", "string", null));
		result.appendArg(new CommandArg("camOpt", "option", "c", "string", null));
		result.appendArg(new CommandArg("gridOpt", "option", "g", "string", null));
		result.appendArg(new CommandArg("refreshOpt", "option", "r", "string", null));
		result.appendArg(new CommandArg("camOpt", "option", "c", "string", null));
		result.appendArg(new CommandArg("layerOpt", "option", "l", "string", null));
		result.appendArg(new CommandArg("centerOpt", "option", "ct", "string", null));
		result.appendArg(new CommandArg("frameOpt", "option", "f", "string", null));
		result.appendArg(new CommandArg("mergeOpt", "option", "m", "string", null));
		result.appendArg(new CommandArg("clearOpt", "option", "clear", "string", null));
		result.appendArg(new CommandArg("centerOpt", "option", "center", "string", null));

		result.appendArg(new CommandArg("allOpt", "option", "all", "string", null));
		result.appendArg(new CommandArg("listOpt", "option", "list", "string", null));
		result.appendArg(new CommandArg("hideOpt", "option", "hide", "string", null));
		result.appendArg(new CommandArg("visibleOpt", "option", "visible", "string", null));
		result.appendArg(new CommandArg("wireOpt", "option", "wire", "string", null));
		result.appendArg(new CommandArg("selOpt", "option", "sel", "string", null));
		result.appendArg(new CommandArg("databaseOpt", "option", "db", "string", null));
		result.appendArg(new CommandArg("updateOpt", "option", "upt", "string", null));
		result.appendArg(new CommandArg("resetOpt", "option", "reset", "string", null));

		return result;
	}

	public getCommandParamList(): CommandParam[] {
		this.addCommandParam("transform", /*"vector"*/ "string", "pos;rot;scale;target");
		this.addCommandParam("transform", /*"float"*/ "string", "pos.x;pos.y;pos.z");
		this.addCommandParam("transform", /*"float"*/ "string", "rot.x;rot.y;rot.z");
		this.addCommandParam("transform", /*"float"*/ "string", "scale.x;scale.y;scale.z");
		this.addCommandParam("transform", "float", "target.x;target.y;target.z");
		this.addCommandParam("shadow", "boolean", "shadow;shadow.recieved");
		this.addCommandParam("shadow", "string", "shadow.light");
		this.addCommandParam("camera", "float", "fov;speed;inertia;angularSensibility");
		this.addCommandParam("material", "color", "material.diffuseColor;material.specularColor;material.ambientColor;material.emissiveColor");
		this.addCommandParam("material", "color", "material.albedoColor;material.reflectionColor;material.reflectivityColor;material.subSurface.tintColor");
		this.addCommandParam("material", "float", "material.roughness;material.alpha");
		this.addCommandParam("material", "float", "material.metallic;material.sheen;material.indexOfRefraction;material.subSurface.indexOfRefraction;material.environmentIntensity;material.directIntensity;material.cameraExposure;material.cameraContrast;material.microSurface");
		this.addCommandParam("material", "boolean", "material.bumpMap.inverse.normal");
		this.addCommandParam("material", "boolean", "material.clearCoat.isEnable;material.subSurface.isRefractionEnabled;material.subSurface.isTranslucencyEnabled");
		this.addCommandParam("material", "string", "material.map.creation");
		this.addCommandParamTexture("string", "creation;url");
		this.addCommandParamTexture("float", "level");
		this.addCommandParamTexture("point", "tile;offset");
		this.addCommandParam("object", "vector", "dimension");
		this.addCommandParam("object", "float", "width;length;height,thickness");
		this.addCommandParam("object", "point", "placeholder.grid");
		this.addCommandParam("merge", "string", "creation,filename;url");
		this.addCommandParam("light", "vector", "direction");
		this.addCommandParam("light", "float", "intensity");
		this.addCommandParam("light", "color", "diffuse;specular;groundColor");
		this.addCommandParam("composite", /*"vector"*/ "string", "local.pos;local.rot;local.scale");
		this.addCommandParam("composite", "vector4", "roof.scale");
		this.addCommandParam("composite", "string", "material.id;material.ref;pattern;mapping.type;mapping.face");
		this.addCommandParam("composite", "float", "border;margin;corner");
		this.addCommandParam("composite", /*"vector"*/ "string", "begin;end");
		this.addCommandParam("composite", "point", "section");
		this.addCommandParam("path", "string", "transfor.value");
		this.addCommandParam("path", "boolean", "inverse.point");

		return this.commandParamList;
	}

	private addCommandParam(category: string, format: string, names: string): void {
		for (let name of names.split(";")) {
			this.commandParamList.push(new CommandParam(name, format, category));
		}
	}

	private addCommandParamTexture(format: string, names: string): void {
		for (let name of names.split(";")) {
			this.commandParamList.push(new CommandParam("material.diffuseMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.specularMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.ambientMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.bumpMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.opacityMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.emissiveMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.reflectionMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.albedoMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.ambientMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.environmentMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.metallicReflectanceMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.metallicMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.microSurfaceMap." + name, format, "material"));
			this.commandParamList.push(new CommandParam("material.reflectivityMap." + name, format, "material"));
		}
	}

}