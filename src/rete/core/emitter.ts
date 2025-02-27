import { Events } from './events';

export class Emitter<EventTypes> {

    events: {[key: string]: Function[]} = {};
    silent = false;

    constructor(events: Events | Emitter<EventTypes>) {
        this.events = events instanceof Emitter ? events.events : events.handlers;
    }

    on<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => void | unknown): () => void {
        const events = names instanceof Array ? names : (names as string).split(' ');

        (events as string[]).forEach(name => {
            if (!this.events[name])
                throw new Error(`The event ${name} does not exist`);
            this.events[name].push(handler);
        });

        return () => {
            (events as string[]).forEach(name => {
                const index= this.events[name].indexOf(handler);
                if (index > -1) this.events[name].splice(index, 1);
            });
        };
    }


    trigger<K extends keyof EventTypes>(name: K, params: EventTypes[K] | {} = {}) {
        if (!(name in this.events))
            throw new Error(`The event ${String(name)} cannot be triggered`);

        return this.events[name as string].reduce((r: boolean, e: Function) => {
            return (e(params) !== false) && r
        }, true); // return false if at least one event is false
    }

    bind(name: string) {
        if (this.events[name])
            throw new Error(`The event ${name} is already bound`);

        this.events[name] = [];
    }

    exist(name: string) {
        return Array.isArray(this.events[name]);
    }
}
