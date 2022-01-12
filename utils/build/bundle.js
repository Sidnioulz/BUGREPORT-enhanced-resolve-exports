'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('@babel/runtime/helpers/typeof');
require('whatwg-fetch');

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}

/**
 * Hypertext Transfer Protocol (HTTP) response status codes.
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
 */
const httpStatusCodes = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'Ok',
    201: 'Created',
    202: 'Accepted',
    203: 'Non Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi Status',
    208: 'Already Reported',
    226: "I'm Used",
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    // 306: 'Switch Proxy', // NOTE: not in use in Node.js.
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'Uri Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'I Am A Teapot',
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'Http Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',
    511: 'Network Authentication Required',
};
class HttpError extends Error {
    constructor(code, message) {
        super(message || httpStatusCodes[code]);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = HttpError.name;
        this._code = code;
    }
    get code() {
        return this._code;
    }
    toString() {
        return `[${this.name}] ${this.code}: ${this.message}`;
    }
}

const requestState = {
    WAITING: 'waiting',
    ABORTED: 'aborted',
    PENDING: 'pending',
    READY: 'ready',
    ERROR: 'error',
};
/**
 * Api class.
 *
 * Wrapper class around the fetch API.
 * It creates an AbortController alongside with the request.
 * Also, it keeps track of the request state and throws an HttpError on HTTP status code !== 2xx.
 * @example
 *
 * const api = new Api(url, options)
 *
 * const response = api.fetch()
 *
 * const abortRequest = api.abort()
 */
class Api {
    /**
     * Construct an API object, which helps you fetch and abort to a specific URL repeatedly.
     * @param {string} url The URL that the API object will fetch when its fetch method is called.
     * @param {object} options Request options (header, method...).
     */
    constructor(url, options) {
        this.controller = new AbortController();
        this.url = url;
        this.options = Object.assign(Object.assign({}, (options || {})), { signal: this.controller.signal });
        this.state = requestState.WAITING;
    }
    /**
     * Fetch API request.
     *
     * @returns {Object} Json data (await (await fetch()).json()).
     * @throws {HttpError} If error happens during fetch or if the fetch is aborted.
     *
     */
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.url, this.options);
                if (!response.ok) {
                    throw new HttpError(response.status);
                }
                this.state = requestState.READY;
                return response.json();
            }
            catch (error) {
                this.state = requestState.ERROR;
                throw error;
            }
        });
    }
    /**
     * Cancel the request.
     */
    abort() {
        if (this.controller) {
            this.state = requestState.ABORTED;
            this.controller.abort();
        }
    }
}

/**
 * Checks if a value is null or undefined.
 *
 * @param value       The value to check.
 * @returns {boolean} Whether that value is null or undefined.
 */
const isNil = (value) => value === null || value === undefined;

/**
 * Checks if a value is an object.
 *
 * @param {*} value   The value to check.
 * @returns {boolean} Whether that value is an object.
 */
const isObject = (value) => !!value && typeof value === 'object';

/**
 * Checks if a value is a string.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value is a string.
 */
const isString = (value) => typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';

/**
 * Replaces, in a URL, all the strings between double-brackets (eg. {{foo}}) by
 * the value in `options` matching the key between brackets (eg. Options.foo).
 * @param   {string}  url       The URL in which to replace double-bracket text with `options` values.
 * @param   {?object} options   The optional object that contains key/value pairs with which to replace
 * double-bracket text in `url`.
 * @returns {string}            The URL with all matching options replaced.
 */
const replaceOptionsUrl = (url, options) => {
    let formattedUrl = url;
    if (!isNil(options)) {
        Object.keys(options).forEach((optionKey) => {
            const value = options[optionKey];
            if (formattedUrl.includes(`{{${optionKey}}}`)) {
                formattedUrl = formattedUrl.replace(new RegExp(`{{${optionKey}}}`, 'g'), value);
            }
        });
    }
    return formattedUrl;
};
const protocolAndDomainRe = /([a-zA-Z]+:\/\/)?[^/]+/;
const protocolRe = /[a-zA-Z]+:\/\//;
/**
 * Adds a path to an existing URL, inserting a slash in between if necessary, and returns the new URL.
 * @param   {string} url      The URL to add to.
 * @param   {string} addition The path to add.
 * @returns {string}          The new URL with the path added.
 */
const addToUrl = (url, addition) => {
    if (url.length !== 0 && addition.length !== 0) {
        /* Start from a new absolute path at the root of our domain. */
        if (addition.startsWith('/')) {
            return url.match(protocolAndDomainRe)[0] + addition;
        }
        /* If there is a URL protocol, we have a brand new URL. */
        if (addition.match(protocolRe)) {
            return addition;
        }
        /* Any other case is a relative path. */
        return url.endsWith('/') ? `${url}${addition}` : `${url}/${addition}`;
    }
    /* If one parameter is empty, return the other. */
    return addition.length ? addition : url;
};
/**
 * Formats and throws an error for when the resolveApiUrl function fails.
 * @param {string}         key           The overall key that was requested.
 * @param {Array.<string>} remainingKeys The leftover part of the key that could not be matched.
 * @param {string}         reason        The cause of the error.
 */
function resolveAPIUrlThrowError(key, remainingKeys, reason) {
    const matched = key.replace(remainingKeys.join('.'), '');
    const theError = new Error(`API key '${key}' cannot be resolved to an URL. ${reason}`.replace('{{matched}}', `'${matched}'`));
    throw theError;
}
/**
 * Builds an URL based on a config object and a dot-separated key that traverses said object,
 * and resolves any options in the resulting URL if `options` is provided.
 * @param   {object} routeConfig The object that will be traversed use to build the URL.
 * @param   {string} key         The path to resolve in `routeConfig`, with dots separating each property name.
 * @param   {object} options     Optional object that contains key/value pairs to replace substrings in the constructed URL.
 * @param   {string} baseUrl     A prefix to apply to the URL.
 * @returns {string}             The resolved and formatted URL.
 */
const resolveApiUrl = (routeConfig, key, options, baseUrl = '') => {
    var _a;
    const keys = (_a = key === null || key === void 0 ? void 0 : key.split('.')) !== null && _a !== void 0 ? _a : [key];
    let url = baseUrl;
    let currentNode = routeConfig;
    do {
        if (isString(currentNode)) {
            // Key is a leaf in the route config, we can finish the URL. Any leftover in the key is an error.
            url = addToUrl(url, currentNode);
            if (keys.length) {
                resolveAPIUrlThrowError(key, keys, '{{matched}} was matched, but child routes are missing.');
            }
            currentNode = null;
        }
        else {
            // Key has children. We add the current route and go further down in the config.
            if (!isString(currentNode.route)) {
                resolveAPIUrlThrowError(key, keys, 'No route name found after {{matched}}.');
            }
            if (!isObject(currentNode.children)) {
                resolveAPIUrlThrowError(key, keys, '{{matched}} was matched, but child routes are missing or not well formed.');
            }
            url = addToUrl(url, currentNode.route);
            currentNode = keys.length ? currentNode.children[keys.shift()] : null;
        }
    } while (currentNode);
    return replaceOptionsUrl(url, options);
};

const makeApiUrlResolver = (config, namespace, entryPoint = 'api') => {
    if (isNil(config[entryPoint])) {
        throw new Error(`The config needs to have an "${entryPoint}" key to build the URL.`);
    }
    return (key, options, baseUrl = '') => resolveApiUrl(config[entryPoint], isNil(namespace) ? key : `${namespace}.${key}`, options, baseUrl);
};

/**
 * Checks if a value is an array.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value is an array.
 */
const isArray = (value) => Array.isArray(value);

/**
 * Compares the content of two arrays. By default, considers arrays equal if they
 * contain the same members, in different orders.
 *
 * @param {Array}    a                       The first array.
 * @param {Array}    b                       The second array.
 * @param {object?}  options                 Options for this function.
 * @param {Function} options.compareFunction An alternative equality function for items in `a` and `b` to be compared with.
 * @param {number}   options.ordered         Whether items must appear in the same order for this function to return `true`.
 * @returns {boolean} Whether the two arrays are comparable given the selected options.
 * @example
 * const list = [0, 1, 2, 3, 4]
 * const otherList = [1, 2, 3, 4, 0]
 * console.log(compareArrays(list, otherList) // true
 * console.log(compareArrays(list, otherList, { ordered: true }) // false
 */
function compareArrays(a, b, options = {}) {
    if (!a || !b || !isArray(a) || !isArray(b) || a.length !== b.length) {
        return false;
    }
    const { compareFunction = (c, d) => c === d, ordered = false } = options;
    if (!ordered) {
        const aCopy = [...a];
        const bCopy = [...b];
        for (let i = 0; i < aCopy.length; i += 1) {
            const item = aCopy[i];
            const indexOfItemInB = bCopy.findIndex((itemB) => compareFunction(item, itemB));
            if (indexOfItemInB === -1) {
                return false;
            }
            bCopy.splice(indexOfItemInB, 1);
        }
    }
    else {
        for (let i = 0; i < a.length; i += 1) {
            if (!compareFunction(a[i], b[i])) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Filters an array in place, removing any element not matching the filter condition,
 * and returns all such removed elements if `options.remainder` is `true`.
 * Has a linear time complexity, linear memory complexity (up to twice the size of `arrayToFilter`),
 * and a constant to linear number of memory allocations (constant if `options.remainder` is `false`).
 *
 * @param {Array}    arrayToFilter         The array to filter.
 * @param {Function} filterCondition       The filter function, taking one item and returning whether `true` if it should be kept.
 * @param {object?}  options               Options for this function.
 * @param {boolean}  options.remainder     Pass `true` for this function to return all items that were filtered out.
 * @param {number}   options.expectedRatio The expected ratio of items matching the filter. Pass 1 if you expect most
 * to match, 0 otherwise. Used to optimise initial memory allocations.
 * @returns {Array}                        An array with all the elements removed from `arrayToFilter` if `remainder` is `true`. Undefined behaviour if `remainder` is `false`.
 * @modifies {arrayToFilter}
 * @example
 * const numbers = [0, 1, 2, 3, 4, 5, 6]
 * const evens = filterInPlace(numbers, (n) => n % 2)
 * console.log(numbers) // [1, 3, 5]
 * console.log(evens) // [0, 2, 4, 6]
 */
var filterInPlace = (arrayToFilter, filterCondition, options = {}) => {
    let iOut = 0;
    let iRemainder = 0;
    const { remainder = false, expectedRatio = 0.5 } = options;
    const remainderOutput = remainder ? new Array(Math.round(arrayToFilter.length * (1 - expectedRatio))) : null;
    /* eslint-disable no-param-reassign */
    for (let i = 0; i < arrayToFilter.length; i++) {
        if (filterCondition(arrayToFilter[i])) {
            arrayToFilter[iOut++] = arrayToFilter[i];
        }
        else if (remainder) {
            remainderOutput[iRemainder++] = arrayToFilter[i];
        }
    }
    arrayToFilter.length = iOut;
    /* eslint-enable no-param-reassign */
    if (remainder) {
        remainderOutput.length = iRemainder;
        return remainderOutput;
    }
    return [];
};

/**
 * Returns a random index within the range of an array's length.
 * @param   {Array}  array The array for which a random index is wanted.
 * @returns {number}       A random number that is a valid index for this array.
 */
var getRandomIndex = (array) => (array.length ? Math.round(Math.random() * (array.length - 1)) : -1);

/**
 * Manage list of random items.
 * @example
 *
 * const list = [1, 2]
 *
 * const randomList = new RandomList(list)
 * randomList.pick()
 * // => 1
 *
 * randomList.pick()
 * // => 2
 */
class RandomList {
    /**
     * Creates a new RandomList.
     * @param {Array} originalList The array of items.
     */
    constructor(originalList) {
        this.originalList = originalList;
        this._length = originalList.length;
        this._originalList = originalList.map((value, index) => ({
            uid: index,
            value,
        }));
        this._alreadyPicked = [];
    }
    /**
     * Return a random item in an array and ensure an item cannot be picked twice in a row.
     *
     * @returns {*} A random item.
     */
    pick() {
        if (this._length === 0) {
            return void 0;
        }
        if (this._length === 1) {
            return this._originalList[0].value;
        }
        let lastCyclesLastValue = { uid: -1, value: undefined };
        if (this._originalList.length === 0) {
            lastCyclesLastValue = this._alreadyPicked[this._alreadyPicked.length - 1];
            this._originalList = this._alreadyPicked;
            this._alreadyPicked = [];
        }
        let value = lastCyclesLastValue;
        let index;
        while (value.uid === lastCyclesLastValue.uid) {
            index = getRandomIndex(this._originalList);
            value = this._originalList[index];
        }
        this._originalList.splice(index, 1);
        this._alreadyPicked.push(value);
        return value.value;
    }
}

/**
 * Toggles the presence of an item in a collection.
 * If `array` contains `item`, returns a copy of `array` without `item`. Otherwise,
 * returns a copy of `array` with item appended to it.
 * @param   {Array}     array   The array.
 * @param   {*}         item    The item to add or remove.
 * @param   {?object}   options Options for this function.
 * @param   {?Function} options.equality    An equality function. If omitted, strict equality is used.
 * @param   {?boolean}  options.mutateArray If `true`, the original `array` is modified instead of this function creating a copy.
 * @returns {Array}     The new array with `item`'s presence toggled.
 */
var toggleItem = (array, item, options) => {
    const { equality = null, mutateArray = false } = options || {};
    const newArray = mutateArray ? array : [...array];
    const index = equality ? newArray.findIndex((itemInArray) => equality(item, itemInArray)) : newArray.indexOf(item);
    if (index === -1) {
        newArray.push(item);
    }
    else {
        newArray.splice(index, 1);
    }
    return newArray;
};

/**
 * Sorts an array of objects based on the order of a string stored in a property identified by `key`.
 * Respects the ordering rules of the first valid locale identified by `locales`. Does not modify the input array.
 * @param {Object[]} value The array to be sorted.
 * @param {string} key The key to sort by, which must be defined in each object of the array.
 * @param {?string | string[]}locales A BCP 47 language tag or an array of such tags that will be used to determine the sort order.
 * @param {?Object} options Optional options passed to `localeCompare`.
 * @returns {Object[]} A sorted version of the input array.
 */
var sortObjectsByLocale = (value, key, locales, options) => {
    if (!!value && !!key) {
        const collator = new Intl.Collator(locales, options);
        return [...value].sort((a, b) => collator.compare(a[key], b[key]));
    }
    return value;
};

const percentize = (float) => float.toLocaleString('en-US', { style: 'percent', maximumFractionDigits: 2 });
/**
 * Formats a given color as an hexadecimal expression.
 * @param {IColorPrimaries} color   The color to represent.
 * @param {boolean} withAlpha       Whether alpha should be included or not.
 * @returns {string}                The hexadecimal value.
 */
const hex = ({ red, green, blue, alpha }, withAlpha = false) => {
    const values = [red, green, blue];
    if (withAlpha) {
        values.push(Math.round(alpha * 255));
    }
    return `#${values.reduce((hexa, val) => hexa + val.toString(16).toLowerCase().padStart(2, '0'), '')}`;
};
/**
 * Formats a given color as a hue-saturation-lightness expression.
 * @param {IColorPrimaries} color   The color to represent.
 * @param {boolean} withAlpha       Whether alpha should be included or not.
 * @returns {string}                The HSL value.
 */
const hsl = ({ hue, saturation, lightness, alpha }, withAlpha = false) => {
    const prefix = withAlpha ? 'hsla' : 'hsl';
    const values = [hue, percentize(saturation), percentize(lightness)];
    if (withAlpha) {
        values.push(alpha);
    }
    return `${prefix}(${values.join(', ')})`;
};
/**
 * Formats a given color as a red-green-blue expression.
 * @param {IColorPrimaries} color   The color to represent.
 * @param {boolean} withAlpha       Whether alpha should be included or not.
 * @returns {string}                The RGB value.
 */
const rgb = ({ red, green, blue, alpha }, withAlpha = false) => {
    const prefix = withAlpha ? 'rgba' : 'rgb';
    const values = [red, green, blue];
    if (withAlpha) {
        values.push(alpha);
    }
    return `${prefix}(${values.join(', ')})`;
};

/**
 * Checks if a number is included in a range defined by two numbers (including
 * the smallest, but not including the largest).
 *
 * It doesn't matter if you pass the largest number to `start` or `end` to define
 * the range. Both ways are supported.
 * @param   {number} number The number to check.
 * @param   {number} start  The start of the range.
 * @param   {number} end    The end of the range.
 * @returns {boolean}       Returns true if number is in the range, else false.
 */
const isInRange = (number, start, end) => {
    return number >= Math.min(start, end) && number < Math.max(start, end);
};

/*
 * A set of patterns used for parser detection.
 */
const hslaPattern = /^hsla\( *\d{1,3} *(, *\d*(\.\d+)?% *){2}, *(0?(\.\d+)|0|1) *\)$/i;
const hslPattern = /^hsl\( *\d{1,3} *(, *\d*(\.\d+)?% *){2}\)$/i;
const rgbaPattern = /^rgba\(( *\d{1,3} *,){3} *(0?(\.\d+)|0|1) *\)$/i;
const rgbPattern = /^rgb\(( *\d{1,3} *,){2} *\d{1,3} *\)$/i;
const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexaPattern = /^#([0-9a-f]{4}|[0-9a-f]{8})$/i;
/**
 * Returns red, green and blue components, given hue, saturation and lightness.
 * @param {IHSLSet} hsl   An object with hue, saturation and lightness properties.
 * @returns {IRGBSet}     An object with red, green and blue properties.
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
 */
const measureRGBComponents = ({ hue, saturation, lightness }) => {
    const [red, green, blue] = [0, 8, 4].map((shift) => {
        const movement = (shift + hue / 30) % 12;
        const scale = saturation * Math.min(lightness, 1 - lightness);
        const positionOnTriangle = Math.min(movement - 3, 9 - movement);
        const boundedPosition = Math.max(-1, Math.min(1, positionOnTriangle));
        return Math.round((lightness - scale * boundedPosition) * 255);
    });
    return { red, green, blue };
};
/**
 * Returns hue, saturation and lightness components, given red, green and blue.
 * @param {IRGBSet} rgb   An object with red, green and blue properties.
 * @returns {IHSLSet}     An object with hue, saturation and lightness properties.
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
 */
const measureHSLComponents = ({ red, green, blue }) => {
    const [boundedRed, boundedGreen, boundedBlue] = [red, green, blue].map((v) => v / 255);
    const value = Math.max(boundedRed, boundedGreen, boundedBlue);
    const minor = Math.min(boundedRed, boundedGreen, boundedBlue);
    const chroma = value - minor;
    const lightness = (value + minor) / 2;
    let hue;
    switch (value) {
        default:
        case minor:
            hue = 0;
            break;
        case boundedRed:
            hue = 360 + (60 * (boundedGreen - boundedBlue)) / chroma;
            break;
        case boundedGreen:
            hue = 120 + (60 * (boundedBlue - boundedRed)) / chroma;
            break;
        case boundedBlue:
            hue = 240 + (60 * (boundedRed - boundedGreen)) / chroma;
            break;
    }
    hue = Math.round(hue % 360);
    let saturation;
    if (lightness === 0 || lightness === 1)
        saturation = 0;
    else
        saturation = chroma / (1 - Math.abs(2 * lightness - 1));
    return { hue, saturation, lightness };
};
const _parsers = {
    /**
     * Converts a hsl(a) expression into a set of primaries.
     * @param {string} expression   The string beginning with hsl or hsla.
     * @returns {IColorPrimaries}   A set of 7 primaries corresponding to the given color.
     */
    hsl: (expression) => {
        const values = expression
            .replace(/hsla?\(/, '')
            .replace(')', '')
            .split(',')
            .map((val, index) => {
            switch (index) {
                case 0:
                case 3:
                    return Number(val.trim());
                case 1:
                case 2:
                    return Number(val.trim().replace('%', '')) / 100;
                default:
                    return null;
            }
        });
        if (!isInRange(values[0], 0, 360) || values.slice(1).some((value) => !isInRange(value, 0, 1.00001)))
            return null;
        if (expression.startsWith('hsl('))
            values.push(1);
        if (values.length !== 4)
            return null;
        const [hue, saturation, lightness, alpha] = values;
        const { red, green, blue } = measureRGBComponents({ hue, saturation, lightness });
        return { red, green, blue, hue, saturation, lightness, alpha };
    },
    /**
     * Converts a rgb(a) expression into a set of primaries.
     * @param {string} expression   The string beginning with rgb or rgba.
     * @returns {IColorPrimaries}   A set of 7 primaries corresponding to the given color.
     */
    rgb: (expression) => {
        const values = expression
            .replace(/rgba?\(/, '')
            .replace(')', '')
            .split(',')
            .map((val) => Number(val.trim()));
        if (values.some((value) => !isInRange(value, 0, 256)))
            return null;
        if (expression.startsWith('rgb('))
            values.push(1);
        if (values.length !== 4)
            return null;
        const [red, green, blue, alpha] = values;
        const { hue, saturation, lightness } = measureHSLComponents({ red, green, blue });
        return { red, green, blue, hue, saturation, lightness, alpha };
    },
    /**
     * Converts a hexadecimal expression into a set of primaries.
     * @param {string} expression   The string beginning with #.
     * @returns {IColorPrimaries}   A set of 7 primaries corresponding to the given color.
     */
    hex: (expression) => {
        const digits = expression.substring(1);
        let pairs;
        switch (digits.length) {
            case 3:
            case 4:
                pairs = digits.split('').map((p) => p.repeat(2));
                break;
            case 8:
            case 6:
                pairs = digits
                    .split('')
                    .map((d, index) => !(index % 2) && `${d}${digits[index + 1]}`)
                    .filter((d) => !!d);
                break;
        }
        const [red, green, blue, alpha] = pairs.map((t) => parseInt(t, 16));
        const { hue, saturation, lightness } = measureHSLComponents({ red, green, blue });
        return { red, green, blue, hue, saturation, lightness, alpha: alpha / 255 || 1 };
    },
};
/**
 * Converts a CSS color expresion into a set of primaries.
 * @param {string} expression   The string representing the CSS value.
 * @returns {IColorPrimaries}   A set of 7 primaries corresponding to the given color.
 * @throws {TypeError}          If the value cannot be parsed.
 */
var parse = (expression) => {
    if (hslaPattern.test(expression) || hslPattern.test(expression)) {
        const result = _parsers.hsl(expression);
        if (!result)
            throw new TypeError(`The given hsl expression does not resolve to a valid color: ${expression}`);
        return result;
    }
    if (rgbaPattern.test(expression) || rgbPattern.test(expression)) {
        const result = _parsers.rgb(expression);
        if (!result)
            throw new TypeError(`The given rgb expression does not resolve to a valid color: ${expression}`);
        return result;
    }
    if (hexPattern.test(expression) || hexaPattern.test(expression)) {
        const result = _parsers.hex(expression);
        if (!result)
            throw new TypeError(`The given hexadecimal expression does not resolve to a valid color: ${expression}`);
        return result;
    }
    throw new TypeError(`The given expression cannot be parsed by this utility: ${expression}`);
};

var _Color_instances, _a, _Color_primaries, _Color_luminanceComponents, _Color_componentFormulaThreshold, _Color_setPrimaries, _Color_computeIndividualLuminances;
/** Class representing a color. */
class Color {
    /**
     * Creates a Color object.
     * @param {string} value Any CSS representation of a color.
     */
    constructor(value) {
        _Color_instances.add(this);
        /**
         * The seven primary values of the color (red, green, blue, hue, saturation, lightness and alpha).
         * Every property in this object is readonly.
         */
        _Color_primaries.set(this, void 0);
        /**
         * The luminance components of the color.
         * Every property in this object is readonly.
         */
        _Color_luminanceComponents.set(this, void 0);
        __classPrivateFieldGet(this, _Color_instances, "m", _Color_setPrimaries).call(this, value);
    }
    /**
     * Outputs the CSS-compliant hexadecimal value of the color.
     * @returns {string} The hexadecimal representation of the color.
     */
    toHex() {
        return hex(__classPrivateFieldGet(this, _Color_primaries, "f"));
    }
    /**
     * Outputs the CSSNext-compliant hexadecimal with alpha value of the color.
     * @returns {string} The 8 digits hexadecimal representation of the color.
     * @see https://www.w3.org/TR/css-color-4/#hex-notation
     */
    toHexa() {
        return hex(__classPrivateFieldGet(this, _Color_primaries, "f"), true);
    }
    /**
     * Outputs the CSS-compliant red-green-blue value of the color.
     * @returns {string} The rgb() representation of the color.
     */
    toRgb() {
        return rgb(__classPrivateFieldGet(this, _Color_primaries, "f"));
    }
    /**
     * Outputs the CSS-compliant red-green-blue-alpha value of the color.
     * @returns {string} The rgba() representation of the color.
     */
    toRgba() {
        return rgb(__classPrivateFieldGet(this, _Color_primaries, "f"), true);
    }
    /**
     * Outputs the CSS-compliant hue-saturation-lightness value of the color.
     * @returns {string} The hsl() representation of the color.
     */
    toHsl() {
        return hsl(__classPrivateFieldGet(this, _Color_primaries, "f"));
    }
    /**
     * Outputs the CSS-compliant hue-saturation-lightness-alpha value of the color.
     * @returns {string} The hsla() representation of the color.
     */
    toHsla() {
        return hsl(__classPrivateFieldGet(this, _Color_primaries, "f"), true);
    }
    /**
     * Fetches the combined luminance of the color by adding weighted individual ones.
     * If individual luminances are not yet computed, they will be beforehand.
     * @returns {number} A value from 0 for darkest black to 1 for lightest white.
     */
    get luminance() {
        if (!__classPrivateFieldGet(this, _Color_luminanceComponents, "f"))
            __classPrivateFieldGet(this, _Color_instances, "m", _Color_computeIndividualLuminances).call(this);
        return (0.2126 * __classPrivateFieldGet(this, _Color_luminanceComponents, "f").red +
            0.7152 * __classPrivateFieldGet(this, _Color_luminanceComponents, "f").green +
            0.0722 * __classPrivateFieldGet(this, _Color_luminanceComponents, "f").blue);
    }
    /* eslint-disable jsdoc/require-returns */
    /**
     * A shortcut for the red primary.
     */
    get r() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").red;
    }
    /**
     * A shortcut for the green primary.
     */
    get g() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").green;
    }
    /**
     * A shortcut for the blue primary.
     */
    get b() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").blue;
    }
    /**
     * A shortcut for the hue.
     */
    get h() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").hue;
    }
    /**
     * A shortcut for the saturation.
     */
    get s() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").saturation;
    }
    /**
     * A shortcut for the lightness.
     */
    get l() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").lightness;
    }
    /**
     * A shortcut for the opacity (alpha).
     */
    get a() {
        return __classPrivateFieldGet(this, _Color_primaries, "f").alpha;
    }
}
_a = Color, _Color_primaries = new WeakMap(), _Color_luminanceComponents = new WeakMap(), _Color_instances = new WeakSet(), _Color_setPrimaries = function _Color_setPrimaries(value) {
    __classPrivateFieldSet(this, _Color_primaries, parse(value), "f");
}, _Color_computeIndividualLuminances = function _Color_computeIndividualLuminances() {
    const { red: pred, green: pgreen, blue: pblue } = __classPrivateFieldGet(this, _Color_primaries, "f");
    const [red, green, blue] = [pred, pgreen, pblue].map((primary) => {
        if (primary < __classPrivateFieldGet(Color, _a, "f", _Color_componentFormulaThreshold))
            return primary / 255 / 12.92;
        return Math.pow(((primary / 255 + 0.055) / 1.055), 2.4);
    });
    __classPrivateFieldSet(this, _Color_luminanceComponents, { red, green, blue }, "f");
};
/**
 * A threshold for the individual luminance computation, expressed in a [0,255] range.
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
_Color_componentFormulaThreshold = { value: 10 };

/**
 * Computes the contrast ratio between two colors.
 * A ratio is always expressed as the lighter color on the darker color ratio.
 * The computing method follows W3C recommendations.
 *
 * @param {string} color1 	The first color, eg desired text color.
 * @param {string} color2 	The second color, eg the background color.
 * @returns {number}		A ratio between 1 and 21, bigger is better.
 */
const contrastRatio = (color1, color2) => {
    const bgColor = new Color(color1);
    const fgColor = new Color(color2);
    if (fgColor.luminance >= bgColor.luminance) {
        return (fgColor.luminance + 0.05) / (bgColor.luminance + 0.05);
    }
    return (bgColor.luminance + 0.05) / (fgColor.luminance + 0.05);
};

/**
 * Transform a hex value to a rgba value.
 * @param {string} hex The hex value to transform.
 * @param {number} [alpha] The alpha value to apply.
 * @returns {number} The rgba value.
 */
const hexToRgba = (hex, alpha = 1) => {
    try {
        let normalizedHex = hex;
        if (!hex.startsWith('#'))
            normalizedHex = `#${normalizedHex.replace(/^(0x)/i, '')}`;
        return rgb(Object.assign(Object.assign({}, parse(normalizedHex)), { alpha }), true);
    }
    catch (error) {
        return null;
    }
};

/**
 * Transforms a hsla color to a rgba one.
 *
 * @param   {string} hsla     The hsla value to transform.
 * @returns {string|null}     The rgba value for the color. Returns null on invalid input.
 */
const hslaToRgba = (hsla) => {
    try {
        return rgb(parse(hsla), true);
    }
    catch (error) {
        return null;
    }
};

/**
 * Transforms a rgba color to an hexadecimal code with alpha values.
 *
 * @param   {string} rgba The rgba value to transform, or an hex code which will
 * be returned as an 8-character hex.
 * @returns {string}      The hex code for the color, including alpha.
 */
const rgbaToHex = (rgba) => {
    try {
        let value = rgba;
        if (rgba.startsWith('0x'))
            value = rgba.replace('0x', '#');
        return hex(parse(value), true);
    }
    catch (error) {
        return null;
    }
};

const white = '#fff';
const black = '#000';
/**
 * Determines the foreground color, among multiple provided options, that provides the best contrast ratio for a given background color.
 * @param {string} background			The background color.
 * @param {Array<string>} foregrounds	The foreground colors to be compared. Defaults to black and white.
 * @returns {string}					The best foreground color, among the provided options.
 */
const pickForeground = (background, foregrounds = [black, white]) => {
    if (foregrounds.length === 1)
        return foregrounds[0];
    let bestColor = { color: null, result: 0 };
    foregrounds.forEach((color) => {
        const result = contrastRatio(color, background);
        if (result > bestColor.result)
            bestColor = { color, result };
    });
    return bestColor.color;
};

const isDateAfter = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) {
        return false;
    }
    return new Date(firstDate) > new Date(secondDate);
};

const isDateAfterOrEqual = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) {
        return false;
    }
    return new Date(firstDate) >= new Date(secondDate);
};

const isDateBefore = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) {
        return false;
    }
    return new Date(firstDate) < new Date(secondDate);
};

const isDateBeforeOrEqual = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) {
        return false;
    }
    return new Date(firstDate) <= new Date(secondDate);
};

const isDateEqual = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) {
        return false;
    }
    const a = new Date(firstDate);
    const b = new Date(secondDate);
    return a <= b && a >= b;
};

/**
 * Generates a callback for the `onKeyDown` event of a React component, that
 * allows you to abstract away implementation details of `KeyboardEvent`.
 * @param   {Function}        callback  The callback to call when the right key is
 * pressed. Takes a KeyboardEvent and returns nothing.
 * @param   {Function|string|Array.<string>} keyFilter The function used to decide
 * which keydown events should trigger the callback, or alternatively, the name
 * of one or several key(s) (eg. 'Enter'). If a function, takes a keydown Event
 * and returns true if the event should trigger the callback.
 * @param   {boolean=}        preventDefault If true, prevents the event from being
 * propagated.
 * @returns {Function} A callback that matches React's `onKeyDown` function.
 */
const keydownCallback = (callback, keyFilter, preventDefault = true) => {
    return (e) => {
        let isRightKey;
        if (isString(keyFilter)) {
            isRightKey = (f) => f.key === keyFilter;
        }
        else if (isArray(keyFilter)) {
            isRightKey = (f) => keyFilter.includes(f.key);
        }
        else {
            isRightKey = keyFilter;
        }
        if (isRightKey(e)) {
            if (preventDefault) {
                e.preventDefault();
            }
            callback(e);
        }
    };
};

/**
 * Checks if a value is a number. BigInts are not considered numbers by this utility.
 *
 * @param   {*}       value   The value to check.
 * @returns {boolean} Whether that value is a number.
 */
const isNumber$1 = (value) => typeof value === 'number';

/**
 * Converts a JSX Element tree to a string, similarly to the textContent method
 * of HTMLElement.
 * @param   {object|string|number|Array.<object|string|number>} node The JSX tree to convert.
 * @returns {string} All the text present in the JSX tree, flattened into a string.
 */
const textContent = (node) => {
    if (isString(node)) {
        return node;
    }
    if (isNumber$1(node)) {
        return `${node}`;
    }
    if (isArray(node)) {
        return node.map(textContent).join('');
    }
    if (isObject(node)) {
        if (node instanceof HTMLElement) {
            const childNodeList = Array.from(node.childNodes);
            const childNodeArray = childNodeList.map((child) => {
                if (child instanceof Text) {
                    return child.textContent;
                }
                return child;
            });
            return textContent(childNodeArray);
        }
        return textContent(node.props.children);
    }
    return '';
};

/**
 * Checks if a value is a function.
 *
 * @param {*} value   The value to check.
 * @returns {boolean} Whether that value is a function.
 */
const isFunction = (value) => value instanceof Function || typeof value === 'function';

/**
 * Calls each function sequentially until one returns successfully.
 *
 * @param {Array<Function>} functions 	Functions to be called in order. They can be asynchronous.
 * @returns {Promise<any>|null}			The return value of the successful call, or null if none succeeded.
 * @throws {TypeError}					If any argument given is not a function.
 */
const callUntilSuccessful = (...functions) => __awaiter(void 0, void 0, void 0, function* () {
    const intruders = functions.filter((fn) => !isFunction(fn));
    if (intruders.length) {
        const printableList = intruders.map((i) => { var _a; return (_a = i.toString()) !== null && _a !== void 0 ? _a : '<unknown>'; }).join(', ');
        throw new TypeError(`Some args are not functions : ${printableList}`);
    }
    const failures = [];
    const loop = () => __awaiter(void 0, void 0, void 0, function* () {
        const candidate = functions.shift();
        if (candidate) {
            try {
                return yield candidate();
            }
            catch (error) {
                failures.push(error);
                return loop();
            }
        }
        const sumUpError = new Error("All function calls threw an Error. See the 'failures' property of this Error for a full report.");
        Object.defineProperty(sumUpError, 'failures', { value: failures });
        throw sumUpError;
    });
    return loop();
});

/**
 * Checks if an HTTP response code is successful or expected.
 *
 * @param {number|string} httpCode		The HTTP response code to test.
 * @param {number|string} expectedCode	If given, will be checked against the first parameter for equality.
 * @returns {boolean}					The result of the comparison.
 */
const checkStatus = (httpCode, expectedCode = null) => {
    if (expectedCode === null) {
        return httpCode.toString()[0] === '2';
    }
    return httpCode.toString() === expectedCode.toString();
};

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */
/**
 * A constant name for anonymous functions.
 */
const ANONYMOUS = '<<anonymous>>';
/**
 * Returns the name of a function.
 *
 * @param   {Function} func     The function.
 * @returns {string}            The function's name.
 */
const getFunctionName = (func) => {
    if (func.name) {
        return func.name;
    }
    const match = /function\s(.+)\(/.exec(func.toString());
    return match ? match[1] : ANONYMOUS;
};

/**
 * Checks if a value is a number.
 *
 * @param   {*}       value The value to check.
 * @returns {boolean} Whether that value is a number.
 */
const isNumber = (value) => {
    if (typeof value !== 'number') {
        return false;
    }
    if (value !== Number(value)) {
        return false;
    }
    if (!Number.isFinite(value)) {
        return false;
    }
    return true;
};

/**
 * Converts a degree to a radian.
 * @param {number} degree The degree to convert.
 * @returns {number} The converted value in radian.
 */
const degreeToRadian = (degree) => {
    return (degree * Math.PI) / 180;
};

const units = ['km', 'hm', 'ham', 'm', 'dm', 'cm', 'mm'];
/**
 * Computes the Haversine distance between geographical coordinates.
 * Supports longitude and latitude but not elevation.
 * @param {object} coordinatesA First coordinates point.
 * @param {object} coordinatesB Second coordinates point.
 * @param {object} options Optional options.
 * @param {string=} options.unit Distance unit output, default to km.
 * @param {number=} options.radius Radius in km to compute distance, default to 6371 (earth .
 * @returns {number} Distance between the two coordinates point.
 */
const coordinatesDistance = (coordinatesA, coordinatesB, options) => {
    const { radius = 6371, unit = 'km' } = options || {};
    const dLat = degreeToRadian(coordinatesB.lat - coordinatesA.lat);
    const dLng = degreeToRadian(coordinatesB.lng - coordinatesA.lng);
    const lat1 = degreeToRadian(coordinatesA.lat);
    const lat2 = degreeToRadian(coordinatesB.lat);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = radius * c;
    const multiplicand = Math.pow(10, units.indexOf(unit));
    return d * multiplicand;
};

/**
 * Deletes any undefined prop in an object.
 * Mutates the object passed as argument by default, change immutable option to true to enforce immutability.
 * Does not operate recursively by default, change deep option to true to also clean nested objects.
 *
 * @param {Object} value    		The object to clean.
 * @param {DeleteUndefinedPropsSettings} opts	Flags changing the function behavior.
 * @returns {Object}        		Returns a copy of the object without undefined props.
 */
const deleteUndefinedProps = (value, opts = { deep: false, immutable: false }) => {
    const cleanObj = opts.immutable ? Object.assign({}, value) : value;
    Object.keys(value).forEach((prop) => {
        if (opts.deep && typeof value[prop] === 'object' && value[prop] !== null) {
            const dirtyValue = value[prop];
            cleanObj[prop] = deleteUndefinedProps(dirtyValue, opts);
        }
        else if (value[prop] === undefined) {
            delete cleanObj[prop];
        }
    });
    return cleanObj;
};

/**
 * Find the value of last given key in an object generated by an Elastic Search query.
 *
 * @param {Object} input    The input to search.
 * @param {string} key      The key to find.
 * @param {*} defaultValue  The value to return if the key is not found.
 * @returns {*}             Returns the value of the last founded key in the given object. Returns null if the key is not found.
 */
const findDeepestValueWithKey = (input, key, defaultValue = null) => {
    if (isObject(input)) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
            return findDeepestValueWithKey(input[key], key, defaultValue);
        }
        return !isNil(input[key]) ? input : defaultValue;
    }
    return !isNil(input) ? input : defaultValue;
};

/**
 * Checks if a value is a map.
 * @param {*} value The value to check.
 * @returns {boolean} Whether that value is a map.
 */
const isMap = (value) => isObject(value) && value.toString() === '[object Map]';

/**
 * Renames properties of an object and returns a new object with the renamed properties.
 *
 * @param {object} obj The object the properties of which need to be renamed.
 * @param  {object} newKeys An object where keys are the current names of properties in `obj`
 * and values are the new names to apply in the object to return.
 * @params {RenamePropertiesSettings} opts Option to prevent the same new key name error to be thrown.
 * @returns {object} The object with the properties listed in `newKeys` renamed accordingly.
 */
const renameProperties = (input, newKeys, opts = { destructive: false }) => {
    let oldObject = input;
    if (isMap(input)) {
        const mapKeysValuesArray = Array.from(input.entries());
        oldObject = Object.fromEntries(mapKeysValuesArray);
    }
    const newKeysNames = Object.values(newKeys);
    const newKeysUniqueNames = new Set(newKeysNames);
    if (!opts.destructive && newKeysNames.length > newKeysUniqueNames.size) {
        throw new Error('There are duplicates in the values you use to rename the keys. This will lead to a loss of data.');
    }
    if (newKeysNames.includes(''))
        throw new Error('One of the values used to rename the keys is empty.');
    const renamedObject = {};
    Object.keys(oldObject).forEach((key) => {
        const keyValue = oldObject[key];
        if (Object.prototype.hasOwnProperty.call(newKeys, key)) {
            const newKey = newKeys[key];
            renamedObject[newKey] = keyValue;
        }
        else {
            renamedObject[key] = keyValue;
        }
    });
    let output = renamedObject;
    if (isMap(input)) {
        output = new Map(Object.entries(renamedObject));
    }
    return output;
};

/**
 * Checks if a value is a Date object.
 * @param   {*}       value The value to check.
 * @returns {boolean}       Whether that value is a map.
 */
const isDate = (value) => value instanceof Date;

/**
 * Checks if a value implementss "iterable" protocol.
 * Covers Arrays, TypedArrays, Node Buffers, Sets, Maps and Strings.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value is iterable.
 */
const isIterable = (value) => !isNil(value) && typeof value[Symbol.iterator] === 'function';

/**
 * Checks if a collection is considered empty. For iterable collections, only iterated items are considered, meaning assigned props on the object (or its prototype) will be ignored.
 * Given a non-collection value, the function checks its falsiness.
 *
 * Note that this implementation is pragmatic, as there is no universal concept of emptiness in JavaScript.
 * @see {@link https://es.discourse.group/t/object-isempty/166} for further information.
 *
 * @param   value     					The value to check.
 * @param {IsEmptySettings} opts		Flags changing the function behavior.
 * @returns {boolean} 					Whether that value is empty.
 */
const isEmpty = (value, opts = { useReflect: false }) => {
    var _a;
    if (isIterable(value)) {
        const iterValue = value;
        const size = (_a = iterValue.size) !== null && _a !== void 0 ? _a : iterValue.length;
        return size === 0;
    }
    if (isObject(value)) {
        const countFunction = opts.useReflect ? Reflect.ownKeys : Object.keys;
        const objValue = value;
        return countFunction(objValue).length === 0;
    }
    return !value;
};

/**
 * Used to handle the sort param
 * It will sort the array of object, given a property, ascendingly or descendingly.
 * @param {Record<string, SortableData>[]} data An array of objects to be sorted, with content that should be sortable as text.
 * @param {string} sortParam  The property used to sort. If using "-" at the start, it will sort descendingly.
 * @returns {Array} The sorted array of object.
 * @example
 * sortByQueryParam([{ a: 1 }, { a: 2 }], '-a') // returns [{ a: 2 }, { a: 1 }]
 * sortByQueryParam([{ a: 'abc' }, { a: 'def' }], 'a') // returns [{ a: 'abc' }, { a: 'def' }]
 */
const sortByQueryParam = (data, sortParam) => {
    /* Callees should know what data type they send us. This is likely indicative of an error. */
    if (!isArray(data) && !isNil(data)) {
        throw new Error('sortByQueryParam expects an array of objects and cannot sort other formats.');
    }
    /* Those are normal cases expected to happen when plugging directly into the pagination API. */
    if (isNil(data) || isEmpty(data) || !isString(sortParam)) {
        return data;
    }
    const compareFunction = (a, b) => {
        if (isString(a)) {
            if (!isString(b)) {
                throw new Error('sortByQueryParam does not support mixed type sorting of strings and non-strings.');
            }
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }
        if (isNumber$1(a)) {
            if (!isNumber$1(b)) {
                throw new Error('sortByQueryParam does not support mixed type sorting of numbers and non-numbers.');
            }
            return a - b;
        }
        if (isDate(a)) {
            if (!isDate(b)) {
                throw new Error('sortByQueryParam does not support mixed type sorting of dates and non-dates.');
            }
            if (isDateEqual(a, b)) {
                return 0;
            }
            return isDateBefore(a, b) ? -1 : 1;
        }
        throw new Error(`sortByQueryParam cannot sort data of type ${typeof a}.`);
    };
    const reverseSort = sortParam.startsWith('-');
    const dataKey = reverseSort ? sortParam.substring(1) : sortParam;
    const sortedData = [...data].sort((a, b) => compareFunction(a[dataKey], b[dataKey]));
    return reverseSort ? sortedData.reverse() : sortedData;
};

const detectors = new Map()
    .set('uppercase', (pw) => __awaiter(void 0, void 0, void 0, function* () { return /[A-Z]/.test(pw); }))
    .set('lowercase', (pw) => __awaiter(void 0, void 0, void 0, function* () { return /[a-z]/.test(pw); }))
    .set('number', (pw) => __awaiter(void 0, void 0, void 0, function* () { return /[0-9]/.test(pw); }))
    .set('symbol', (pw) => __awaiter(void 0, void 0, void 0, function* () { return /[^A-Za-z0-9]/.test(pw); }));
const errorMessages = new Map()
    .set('min', 'ERROR_PASSWORD_TOO_SHORT')
    .set('max', 'ERROR_PASSWORD_TOO_LONG')
    .set('uppercase', 'ERROR_PASSWORD_MUST_CONTAIN_UPPERCASE')
    .set('lowercase', 'ERROR_PASSWORD_MUST_CONTAIN_LOWERCASE')
    .set('number', 'ERROR_PASSWORD_MUST_CONTAIN_DIGIT')
    .set('symbol', 'ERROR_PASSWORD_MUST_CONTAIN_SPECIAL')
    .set('requirementCount', 'ERROR_PASSWORD_CHARACTER_TYPES_NOT_DIVERSE_ENOUGH');
const presets = {
    safe: {
        uppercase: 1,
        lowercase: 1,
        number: 1,
        min: 12,
    },
    strong: {
        uppercase: 1,
        lowercase: 1,
        number: 1,
        symbol: 1,
        min: 20,
    },
    strongest: {
        uppercase: 1,
        lowercase: 1,
        number: 1,
        symbol: 1,
        min: 32,
    },
};
/**
 * A function that checks a password against a previously defined set of rules.
 *
 * Please be aware that this function only checks the complexity of a password, not its security.
 * @callback PasswordChecker
 * @param {string} password   The password to check.
 * @returns {boolean}         If the given password is secure enough.
 * @throws                    If the given password is not secure enough. A 'report' property lists unfulfilled rules.
 */
/**
 * Generates a password checking function with the given settings.
 *
 * Please be aware that the function generated only checks the complexity of a password, not its security.
 * @param {string|IPWStrengthConfig} rules               Either the name of a preset ('safe', 'strong' or 'strongest') or a bitwise combination of rule flags.
 * @returns {PasswordChecker}                 The function, ready to be called with a password.
 * @throws {Error}                            If settings cannot be created from the specified rules.
 */
const checkerFactory = (rules = 'safe') => {
    let settings;
    if (typeof rules === 'string') {
        if (!['safe', 'strong', 'strongest'].includes(rules)) {
            throw new Error(`Settings '${rules}' were not recognized for password complexity check`);
        }
        settings = presets[rules];
    }
    else {
        settings = rules;
    }
    return (password) => __awaiter(void 0, void 0, void 0, function* () {
        const normalizedPassword = password.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        // Another map becaus keys are meaningful here (to retrieve appropriate error messages).
        // An array would index rules incrementally from 0, preventing any mapping to error messages.
        const usedDetectors = new Map(Array.from(detectors).filter(([rule]) => !!settings[rule])).set('min', (pw) => __awaiter(void 0, void 0, void 0, function* () { return pw.length >= settings.min; }));
        if (settings.requirementCount) {
            usedDetectors.set('requirementCount', (pw) => __awaiter(void 0, void 0, void 0, function* () {
                const results = yield Promise.allSettled(['uppercase', 'lowercase', 'number', 'symbol'].map((charType) => detectors.get(charType)(pw)));
                return results.filter((res) => res.status === 'fulfilled' && res.value).length >= settings.requirementCount;
            }));
        }
        if (settings.max) {
            usedDetectors.set('max', (pw) => __awaiter(void 0, void 0, void 0, function* () { return pw.length <= settings.max; }));
        }
        const results = yield Promise.allSettled(Array.from(usedDetectors).map(([rule, detector]) => __awaiter(void 0, void 0, void 0, function* () {
            let candidate = normalizedPassword;
            // For length validation, check the original password.
            if (['min', 'max'].includes(rule)) {
                candidate = password;
            }
            if (yield detector(candidate)) {
                return;
            }
            throw new Error(errorMessages.get(rule));
        })));
        const failures = results.filter(({ status }) => status === 'rejected');
        if (failures.length > 0) {
            const theError = new Error("The provided password is not complex enough, see 'report' property for details");
            Object.defineProperty(theError, 'report', { value: failures.map((f) => f.reason) });
            throw theError;
        }
        return true;
    });
};

/**
 * Processes options for ellipsize utils and provides default values.
 * @param   {object?} options The options passed to the utils. Can be null.
 * @returns {object}          A sanitised version of the options with all properties defined.
 */
const _readOptions = (options) => {
    var _a;
    return ({
        preserveWords: !!(options === null || options === void 0 ? void 0 : options.preserveWords),
        wordSeparator: (_a = options === null || options === void 0 ? void 0 : options.wordSeparator) !== null && _a !== void 0 ? _a : ' ',
    });
};
/**
 * Adjusts the start index of an ellipsize function to avoid cutting a word in half,
 * by making the start index lower if necessary (resulting in a longer string).
 *
 * @param   {string}    string                The string to shorten.
 * @param   {length}    length                The number of characters to keep.
 * @param   {IOptions?} options               Optional options.
 * @param   {boolean=}  options.preserveWords Whether to avoid cutting words.
 * @param   {string=}   options.wordSeparator The character used to separate words.
 * @returns {number}                          The index to use to shorten the
 * string's start without cutting any word, if `preserveWords` is true.
 */
const _adjustStart = (string, length, options) => {
    if (length === 0) {
        return string.length;
    }
    const { preserveWords, wordSeparator } = _readOptions(options);
    let start = string.length - length;
    if (preserveWords && string[start] !== wordSeparator && string[start - 1] !== wordSeparator) {
        start = string.substring(0, start).lastIndexOf(wordSeparator) + 1;
    }
    return start;
};
/**
 * Adjusts the end index of an ellipsize function to avoid cutting a word in half,
 * by making the end index higher if necessary (resulting in a longer string).
 *
 * @param   {string}    string                The string to shorten.
 * @param   {length}    length                The number of characters to keep.
 * @param   {IOptions?} options               Optional options.
 * @param   {boolean=}  options.preserveWords Whether to avoid cutting words.
 * @param   {string=}   options.wordSeparator The character used to separate words.
 * @returns {number}                          The index to use to shorten the
 * string's end without cutting any word, if `preserveWords` is true.
 */
const _adjustEnd = (string, length, options) => {
    if (length === 0) {
        return 0;
    }
    const { preserveWords, wordSeparator } = _readOptions(options);
    let end = length;
    if (preserveWords && string[end] !== wordSeparator && string[end - 1] !== wordSeparator) {
        end += string.substring(end, string.length).indexOf(wordSeparator);
    }
    return end;
};

/**
 * Shortens a string to a given length. Keeps the start of the string and replaces
 * the end with an ellipsis.
 *
 * @param   {string}    string                The string to shorten.
 * @param   {length}    length                The number of characters to keep.
 * @param   {IOptions?} options               Optional options.
 * @param   {boolean=}  options.preserveWords Whether to avoid cutting words.
 * @param   {string=}   options.wordSeparator The character used to separate words.
 * @returns {string}                          The shortened string.
 */
const ellipsize = (string, length, options) => {
    if (string.length <= length) {
        return string;
    }
    const start = 0;
    const end = _adjustEnd(string, length, options);
    return `${string.substring(start, end)}...`;
};

/**
 * Shortens a string to a given length. Keeps the end of the string and replaces
 * the start with an ellipsis.
 *
 * @param   {string}    string                The string to shorten.
 * @param   {length}    length                The number of characters to keep.
 * @param   {IOptions?} options               Optional options.
 * @param   {boolean=}  options.preserveWords Whether to avoid cutting words.
 * @param   {string=}   options.wordSeparator The character used to separate words.
 * @returns {string}                          The shortened string.
 */
const ellipsizeEnd$1 = (string, length, options) => {
    if (string.length <= length) {
        return string;
    }
    const halfLength = Math.ceil(length / 2);
    const leftStart = 0;
    const leftEnd = _adjustEnd(string, halfLength, options);
    const rightStart = _adjustStart(string, halfLength, options);
    const rightEnd = string.length;
    if (leftEnd < rightStart) {
        return `${string.substring(leftStart, leftEnd)}...${string.substring(rightStart, rightEnd)}`;
    }
    return string;
};

/**
 * Shortens a string to a given length. Keeps the start of the string and replaces
 * the end with an ellipsis.
 *
 * @param   {string}    string                The string to shorten.
 * @param   {length}    length                The number of characters to keep.
 * @param   {IOptions?} options               Optional options.
 * @param   {boolean=}  options.preserveWords Whether to avoid cutting words.
 * @param   {string=}   options.wordSeparator The character used to separate words.
 * @returns {string}                          The shortened string.
 */
const ellipsizeEnd = (string, length, options) => {
    if (string.length <= length) {
        return string;
    }
    const start = _adjustStart(string, length, options);
    const end = string.length;
    return `...${string.substring(start, end)}`;
};

/**
 * Extracts the initials of words in a given string.
 * @param   {string}  string    The string for which initials should be extracted.
 * @param   {string=} delimiter The character to use to separate initials.
 * @returns {string}  The initials, separated by the delimiter character.
 */
const toInitials = (string, delimiter = '') => string
    .match(/(\b[a-zA-Z])\s?/g)
    .map((wordBoundary) => wordBoundary.trim())
    .join(delimiter);

/**
 * Compares two instances of Set and verifies if they contain the same items.
 * @param {Set} a The first set.
 * @param {Set} b The second set.
 * @param {object?} options Optional options.
 * @param {Function=} options.equality Function to checks equality between two values.
 * @param {boolean=} options.order Verifies if sets are in the same order.
 * @returns {boolean} Sets are equal or not.
 */
const setsAreEqual = (a, b, options) => {
    const { equality = null, order = false } = options || {};
    if (a.size !== b.size) {
        return false;
    }
    const aIterator = a.values();
    const bIterator = b.values();
    const bArray = Array.from(b);
    for (let i = 0; i < a.size; i++) {
        const aValue = aIterator.next().value;
        const bValue = bIterator.next().value;
        if (order) {
            const isEqual = equality ? equality(aValue, bValue) : aValue === bValue;
            if (!isEqual) {
                return false;
            }
        }
        else {
            const contains = bArray.some((elem) => (equality ? equality(aValue, elem) : aValue === elem));
            if (!contains) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Creates a Promise that resolves after a time has elapsed. The timer runs for
 * however many milliseconds are passed to the first parameter.
 * @param   {number} milliseconds The number of milliseconds to sleep for.
 * @returns {Promise} A Promise that resolves after the timer has elapsed.
 */
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Checks if a value is a large integer represented with BigInt.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value is a BigInt.
 */
const isBigInt = (value) => typeof value === 'bigint';

/**
 * Checks if a value is a boolean.
 *
 * @param   {*}       value   The value to check.
 * @returns {boolean} Whether that value is a boolean.
 */
const isBoolean = (value) => typeof value === 'boolean';

/**
 * Checks if a value is a JavaScript regular expression.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value is a RegExp.
 */
const isRegExp = (value) => {
    try {
        return value instanceof RegExp;
    }
    catch (error) {
        return false;
    }
};

/**
 * Checks if a value is a primitive literal, ie. A string, an integer or floating-point
 * number, a BigInt, a RegExp, a symbol or a boolean.
 *
 * What qualifies as primitive is here defined as any literal JavaScript type except
 * for the extensible Object and Array types. Symbols are a unique type in JavaScript,
 * but not literals as multiple symbols made with the same syntax are considered to
 * have different values.
 *
 * @param   value     The value to check.
 * @returns {boolean} Whether that value's type is one considered to be a primitive literal.
 */
const isPrimitiveLiteral = (value) => {
    return isString(value) || isBigInt(value) || isNumber$1(value) || isRegExp(value) || isBoolean(value);
};

/**
 * Checks if a value is a set.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Whether that value is a set.
 */
const isSet = (value) => isObject(value) && Object.prototype.toString.call(value) === '[object Set]';

/**
 * Checks if a value is a weakMap.
 * @param {*} value The value to check.
 * @returns {boolean} Whether that value is a weakMap.
 */
const isWeakMap = (value) => isObject(value) && Object.prototype.toString.call(value) === '[object WeakMap]';

/**
 * Checks if a value is a weakSet.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Whether that value is a weak set.
 */
const isWeakSet = (value) => typeof value === 'object' && Object.prototype.toString.call(value) === '[object WeakSet]';

const _normalizeSearch = (searchString) => {
    var _a;
    return ((_a = searchString === null || searchString === void 0 ? void 0 : searchString.slice(1)) === null || _a === void 0 ? void 0 : _a.split('&').map((param) => (param.includes('=') ? param : `${param}=true`))) || [];
};
function compareLocations(a, b, options = {}) {
    if (!a || !b) {
        return false;
    }
    const comparisonCriteria = {
        pathname: options.pathname || true,
        key: options.key || false,
        hash: options.hash || false,
        search: options.search || false,
    };
    const compareFunctions = {
        pathname: (pathnameA, pathnameB) => pathnameA === pathnameB,
        key: (keyA, keyB) => keyA === keyB,
        hash: (hashA, hashB) => hashA === hashB,
        search: (searchA, searchB) => {
            const paramsA = _normalizeSearch(searchA);
            const paramsB = _normalizeSearch(searchB);
            return compareArrays(paramsA, paramsB);
        },
    };
    const criteriaToCheck = Object.keys(comparisonCriteria).filter((key) => comparisonCriteria[key]);
    for (let i = 0; i < criteriaToCheck.length; i += 1) {
        const criteria = criteriaToCheck[i];
        if (!compareFunctions[criteria](a[criteria], b[criteria])) {
            return false;
        }
    }
    return true;
}

exports.Api = Api;
exports.Color = Color;
exports.HttpError = HttpError;
exports.RandomList = RandomList;
exports.callUntilSuccessful = callUntilSuccessful;
exports.checkPasswordStrength = checkerFactory;
exports.checkStatus = checkStatus;
exports.compareArrays = compareArrays;
exports.compareLocations = compareLocations;
exports.contrastRatio = contrastRatio;
exports.coordinatesToDistance = coordinatesDistance;
exports.degreeToRadian = degreeToRadian;
exports.deleteUndefinedProps = deleteUndefinedProps;
exports.ellipsize = ellipsize;
exports.ellipsizeInside = ellipsizeEnd$1;
exports.ellipsizeStart = ellipsizeEnd;
exports.filterInPlace = filterInPlace;
exports.findDeepestValueWithKey = findDeepestValueWithKey;
exports.getFunctionName = getFunctionName;
exports.getRandomIndex = getRandomIndex;
exports.hexToRgba = hexToRgba;
exports.hslaToRgba = hslaToRgba;
exports.isArray = isArray;
exports.isBigInt = isBigInt;
exports.isBoolean = isBoolean;
exports.isDate = isDate;
exports.isDateAfter = isDateAfter;
exports.isDateAfterOrEqual = isDateAfterOrEqual;
exports.isDateBefore = isDateBefore;
exports.isDateBeforeOrEqual = isDateBeforeOrEqual;
exports.isDateEqual = isDateEqual;
exports.isEmpty = isEmpty;
exports.isFiniteNumber = isNumber;
exports.isFunction = isFunction;
exports.isInRange = isInRange;
exports.isIterable = isIterable;
exports.isMap = isMap;
exports.isNil = isNil;
exports.isNumber = isNumber$1;
exports.isObject = isObject;
exports.isPrimitiveLiteral = isPrimitiveLiteral;
exports.isRegExp = isRegExp;
exports.isSet = isSet;
exports.isString = isString;
exports.isWeakMap = isWeakMap;
exports.isWeakSet = isWeakSet;
exports.keydownCallback = keydownCallback;
exports.makeApiUrlResolver = makeApiUrlResolver;
exports.pickForeground = pickForeground;
exports.renameProperties = renameProperties;
exports.rgbaToHex = rgbaToHex;
exports.setsAreEqual = setsAreEqual;
exports.sleep = sleep;
exports.sortByQueryParam = sortByQueryParam;
exports.sortObjectsByLocale = sortObjectsByLocale;
exports.textContent = textContent;
exports.toInitials = toInitials;
exports.toggleItem = toggleItem;
