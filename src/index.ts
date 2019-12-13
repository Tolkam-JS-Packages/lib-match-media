import { debounce } from '@tolkam/lib-utils';

const MM = window.matchMedia;

class MatchMedia {

    /**
     * Media rules
     * @type {IRule[]}
     */
    public readonly rules: IRule[] = [];

    /**
     * Registered listeners
     * @type {any[]}
     */
    protected listeners: any[] = [];

    /**
     * @param {IRule[]} rules
     */
    constructor(rules: IRule[]) {
        const that = this;

        if (typeof MM !== 'function') {
            console && console.warn('window.matchMedia() not found.');
            return;
        }

        this.rules = rules;

        rules.forEach(function(ruleGroup) {
            for (var key in ruleGroup) {
                let mql = MM(ruleGroup[key]);
                if (typeof mql.addListener === 'function') {
                    mql.addListener(function(key: string, e: MediaQueryList) {
                        that.notify(e, key);
                    }.bind(null, key)); // bind to get updated key on each call
                }
            }
        });
    }

    /**
     * Notifies listeners on changes
     *
     * @param {MediaQueryList} e
     * @param {string} ruleKey
     * @param {number} ruleGroupIdx
     */
    protected notify = (e: MediaQueryList, ruleKey: string) => {
        const that = this;

        for (var i = 0; i < that.listeners.length; i++) {

            let keys = that.listeners[i][1];
            if (e.matches) {
                keys.push(ruleKey);
            } else {
                keys.splice(keys.indexOf(ruleKey), 1);
            }

            // notify listener when keys calc is done and count
            // of calculated keys equals to rules groups count
            // if (keys.length === that.rules.length) {
                that.listeners[i][0](keys, that.rules);
            // }
        }
    };

    /**
     * Adds listener for the matchmedia events
     *
     * @param {Function} listener
     * @param {Boolean}  immediate
     */
    public listen(listener: Listener, immediate: boolean = true): () => void {

        const that = this;

        // debounce listener to fire only when calculations are done
        listener = debounce(listener, 1);

        // check if rules matches
        let keys: string[] = [];
        let groupIdx: number;

        that.rules.forEach((group: any) => {
            for (var key in group) {
                if (MM(group[key]).matches) {
                    keys.push(key);
                }
            }
        });

        // call listener (initial match)
        if (immediate && keys.length) {
            listener(keys, that.rules);
        }

        // register listener with keys matched on init
        const listenerArr = [listener, keys];
        that.listeners.push(listenerArr);

        // return unlisten function
        return function unlisten() {
            that.listeners.splice(that.listeners.indexOf(listenerArr), 1);
        }
    }
}

/*
 * [
 *   {
 *      'k1': '(max-width:575px)',
 *      'k1': '(min-width:576px) and (max-width:767px)',
 *   },
 *   {
 *      'k3': 'all and (orientation: landscape)',
 *   }
 * ]
 */
export interface IRule {
    [key: string]: string
}

export default MatchMedia;

type Listener = (keys: string[], rules: IRule[]) => void;

