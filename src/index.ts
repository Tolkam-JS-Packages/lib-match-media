import { debounce } from '@tolkam/lib-utils';

const MM = window.matchMedia;

class MatchMedia {

    /**
     * Media rules
     * @type {IRules}
     */
    public readonly rules: IRules;

    /**
     * Registered listeners
     * @type {any[]}
     */
    protected listeners: any[] = [];

    /**
     * @param {IRules} rules
     */
    constructor(rules: IRules) {
        const that = this;

        if (typeof MM !== 'function') {
            console && console.warn('window.matchMedia() not found.');
            return;
        }

        this.rules = rules;

        for (const key in rules) {
            let mql = MM(rules[key]);
            if (typeof mql.addListener === 'function') {
                mql.addListener(function(key: string, e: MediaQueryList) {
                    that.notify(e, key);
                }.bind(null, key)); // bind to get updated key on each call
            }
        }
    }


    /**
     * Adds listener for the match media events
     *
     * @param {Function} listener
     * @param {Boolean}  immediate
     */
    public listen(listener: TListener, immediate: boolean = true): () => void {

        const that = this;
        const rules = that.rules;

        // debounce listener to fire only when calculations are done
        listener = debounce(listener, 1);

        // check if rules matches
        const matches: any = {};

        for (const key in rules) {
            matches[key] = MM(rules[key]).matches;
        }

        // call listener (initial match)
        if (immediate) {
            listener(matches, rules);
        }

        // register listener with keys matched on init
        const listenerArr = [listener, matches];
        that.listeners.push(listenerArr);

        // return unlisten function
        return function unlisten() {
            that.listeners.splice(that.listeners.indexOf(listenerArr), 1);
        }
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
            const matches = that.listeners[i][1];
            matches[ruleKey] = e.matches;

            that.listeners[i][0](matches, that.rules);
        }
    };
}

/*
 * {
 *     'k1': '(max-width:575px)',
 *     'k2': '(min-width:576px) and (max-width:767px)',
 *     'k3': 'all and (orientation: landscape)',
 *  }
 */

export interface IRules {
    [key: string]: string
}

interface IMatches {
    [key: string]: boolean
}

type TListener = (matches: IMatches, rules: IRules) => void;

export default MatchMedia;
export { TListener }

