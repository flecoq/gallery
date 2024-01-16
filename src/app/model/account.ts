import { Content } from './content';
import { Room } from './room';
import { CreationGroup } from './assembler/creationGroup';

export class Account {
	public id: number;
	public login: string;
	public password: string;
	public email: string;
	public profil: number;
    public content: Content = new Content();
	public CreationGroup: CreationGroup = new CreationGroup();
	public roomList: Room[] = [];
	public room: Room;

    constructor() {}
	
	public createFromJson(data: any): void {
		this.id = data.id;
		this.login = data.login;
		this.password = data.password;
		this.email = data.email;
		this.profil = data.profil;
		if( data.content ) {
			this.content.createFromJson(data.content);
		}
		this.CreationGroup.createFromJson(data.CreationGroup);
		if( data.Room) {
			for(let roomData of data.Room) {
				var room = new Room();
				room.createFromJson(roomData);
				room.CreationGroup = this.CreationGroup;
				this.addRoom(room);
			}
		}
	}
	
	public getRoom(id: number): Room {
		for(let room of this.roomList) {
			if( room.id == id ) {
				this.room = room;
				return room;
			}
		}
		return null;
	}
	
	public addRoom(room: Room): void {
		this.roomList.push(room);
	}
	
	public getPseudo(): string {
		return this.content.getInfoValue('pseudo');
	}
	
	public getProfilLabel(): string {
		if(this.profil == 1) {
			return "Author";
		} else if(this.profil == 2) {
			return "Visitor";
		} else if(this.profil == 3) {
			return "Designer";
		}
	}
}
