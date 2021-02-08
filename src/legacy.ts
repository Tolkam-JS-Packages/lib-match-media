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
            for (const key in ruleGroup) {
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
     */
    protected notify = (e: MediaQueryList, ruleKey: string) => {
        const that = this;

        for (let i = 0; i < that.listeners.length; i++) {

            let keys = that.listeners[i][1];
            if (e.matches) {
                keys.push(ruleKey);
            } else {
                keys.splice(keys.indexOf(ruleKey), 1);
            }

            that.listeners[i][0](keys, that.rules);
        }
    };

    /**
     * Adds listener for the match media events
     *
     * @param {Function} listener
     * @param {Boolean}  immediate
     */
    public listen(listener: TListener, immediate: boolean = true): () => void {

        const that = this;

        // debounce listener to fire only when calculations are done
        listener = debounce(listener, 1);

        // check if rules matches
        let keys: string[] = [];

        that.rules.forEach((group: any) => {
            for (const key in group) {
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

type TListener = (keys: string[], rules: IRule[]) => void;

export { TListener }

