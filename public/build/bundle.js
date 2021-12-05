
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page$1 = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const page = writable(undefined);
    const params = writable(undefined);

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    const crowdfundings = writable([]);
    const crowdfunding = writable({});

    let headers = new Headers();

    headers.append("Access-Control-Allow-Origin", "https://freeducation-api.herokuapp.com");

    async function getCrowdfundings() {
        const res = await fetch("https://freeducation-api.herokuapp.com/crowdfundings");
        const data = await res.json();
        crowdfundings.set(data);

        if (res.ok) {
            return data;
        } else {
            throw new Error(data);
        }
    }

    async function getCrowdfunding(id) {
        const res = await fetch(
            `https://freeducation-api.herokuapp.com/crowdfundings/${id}`
        );
        const data = await res.json();
        crowdfunding.set(data);

        if (res.ok) {
            return data;
        } else {
            throw new Error(data);
        }
    }

    getCrowdfundings();

    /* src\components\Loader.svelte generated by Svelte v3.44.1 */

    const file$c = "src\\components\\Loader.svelte";

    function create_fragment$e(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "double-bounce1");
    			add_location(div0, file$c, 2, 4, 51);
    			attr_dev(div1, "class", "double-bounce2");
    			add_location(div1, file$c, 3, 4, 87);
    			attr_dev(div2, "class", "spinner");
    			add_location(div2, file$c, 1, 2, 24);
    			attr_dev(div3, "id", "preloader");
    			add_location(div3, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\CrowdfundingList.svelte generated by Svelte v3.44.1 */
    const file$b = "src\\components\\CrowdfundingList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (141:8) {:else}
    function create_else_block$1(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(141:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:8) {#each $crowdfundings as crowdfunding}
    function create_each_block(ctx) {
    	let div8;
    	let div7;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let div0;
    	let p;
    	let span0;
    	let t1_value = calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "";
    	let t1;
    	let t2;
    	let p_intro;
    	let t3;
    	let div6;
    	let ul0;
    	let li0;
    	let a0;
    	let t4_value = /*crowdfunding*/ ctx[4].category + "";
    	let t4;
    	let a0_href_value;
    	let t5;
    	let a1;
    	let t6_value = /*crowdfunding*/ ctx[4].title + "";
    	let t6;
    	let a1_href_value;
    	let t7;
    	let ul1;
    	let li1;
    	let t8_value = formatCurrency(/*crowdfunding*/ ctx[4].target) + "";
    	let t8;
    	let t9;
    	let span1;
    	let t11;
    	let li2;
    	let span2;
    	let t12_value = calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "";
    	let t12;
    	let t13;
    	let span3;
    	let t15;
    	let li3;
    	let t16_value = calculateDaysRemaining(/*crowdfunding*/ ctx[4].date_end) + "";
    	let t16;
    	let t17;
    	let span4;
    	let t19;
    	let span5;
    	let t20;
    	let div5;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let div4;
    	let a2;
    	let span6;
    	let t23;
    	let t24_value = /*crowdfunding*/ ctx[4].profile_name + "";
    	let t24;
    	let a2_href_value;
    	let t25;
    	let span7;
    	let t26;
    	let a3;
    	let t27;
    	let a3_href_value;
    	let t28;
    	let div8_intro;
    	let div8_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = text("\r\n                      %");
    			t3 = space();
    			div6 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			a1 = element("a");
    			t6 = text(t6_value);
    			t7 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			t8 = text(t8_value);
    			t9 = space();
    			span1 = element("span");
    			span1.textContent = "Dibutuhkan";
    			t11 = space();
    			li2 = element("li");
    			span2 = element("span");
    			t12 = text(t12_value);
    			t13 = text("\r\n                    %\r\n                    ");
    			span3 = element("span");
    			span3.textContent = "Terdanai";
    			t15 = space();
    			li3 = element("li");
    			t16 = text(t16_value);
    			t17 = space();
    			span4 = element("span");
    			span4.textContent = "Hari lagi";
    			t19 = space();
    			span5 = element("span");
    			t20 = space();
    			div5 = element("div");
    			div3 = element("div");
    			img1 = element("img");
    			t21 = space();
    			div4 = element("div");
    			a2 = element("a");
    			span6 = element("span");
    			span6.textContent = "By";
    			t23 = space();
    			t24 = text(t24_value);
    			t25 = space();
    			span7 = element("span");
    			t26 = space();
    			a3 = element("a");
    			t27 = text("Bantu Urun Dana");
    			t28 = space();
    			if (!src_url_equal(img0.src, img0_src_value = /*crowdfunding*/ ctx[4].thumbnail)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "height", "250px");
    			set_style(img0, "width", "350px");
    			add_location(img0, file$b, 64, 16, 1838);
    			attr_dev(span0, "class", "number-percentage-count number-percentage");
    			attr_dev(span0, "data-value", "90");
    			attr_dev(span0, "data-animation-duration", "3500");
    			add_location(span0, file$b, 71, 22, 2233);
    			set_style(p, "left", "100%");
    			add_location(p, file$b, 70, 20, 2153);
    			attr_dev(div0, "class", "xs-skill-track");
    			set_style(div0, "width", calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "%");
    			add_location(div0, file$b, 67, 18, 1985);
    			attr_dev(div1, "class", "xs-skill-bar");
    			add_location(div1, file$b, 66, 16, 1939);
    			attr_dev(div2, "class", "xs-item-header");
    			add_location(div2, file$b, 62, 14, 1788);
    			attr_dev(a0, "href", a0_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id);
    			add_location(a0, file$b, 86, 20, 2839);
    			add_location(li0, file$b, 85, 18, 2813);
    			attr_dev(ul0, "class", "xs-simple-tag xs-mb-20");
    			add_location(ul0, file$b, 84, 16, 2758);
    			attr_dev(a1, "href", a1_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id);
    			attr_dev(a1, "class", "xs-post-title xs-mb-30");
    			add_location(a1, file$b, 90, 16, 2974);
    			add_location(span1, file$b, 95, 20, 3243);
    			attr_dev(li1, "class", "pledged svelte-1u7cali");
    			add_location(li1, file$b, 93, 18, 3142);
    			attr_dev(span2, "class", "number-percentage-count number-percentage");
    			attr_dev(span2, "data-value", "90");
    			attr_dev(span2, "data-animation-duration", "3500");
    			add_location(span2, file$b, 98, 20, 3337);
    			add_location(span3, file$b, 105, 20, 3667);
    			add_location(li2, file$b, 97, 18, 3311);
    			add_location(span4, file$b, 109, 20, 3828);
    			add_location(li3, file$b, 107, 18, 3733);
    			attr_dev(ul1, "class", "xs-list-with-content svelte-1u7cali");
    			add_location(ul1, file$b, 92, 16, 3089);
    			attr_dev(span5, "class", "xs-separetor");
    			add_location(span5, file$b, 113, 16, 3920);
    			if (!src_url_equal(img1.src, img1_src_value = /*crowdfunding*/ ctx[4].profile_photo)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$b, 117, 20, 4071);
    			attr_dev(div3, "class", "xs-round-avatar");
    			add_location(div3, file$b, 116, 18, 4020);
    			add_location(span6, file$b, 121, 22, 4277);
    			attr_dev(a2, "href", a2_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id);
    			add_location(a2, file$b, 120, 20, 4215);
    			attr_dev(div4, "class", "xs-avatar-title");
    			add_location(div4, file$b, 119, 18, 4164);
    			attr_dev(div5, "class", "row xs-margin-0");
    			add_location(div5, file$b, 115, 16, 3971);
    			attr_dev(span7, "class", "xs-separetor");
    			add_location(span7, file$b, 127, 16, 4441);
    			attr_dev(a3, "href", a3_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id);
    			attr_dev(a3, "data-toggle", "modal");
    			attr_dev(a3, "data-target", "#exampleModal");
    			attr_dev(a3, "class", "btn btn-primary btn-block");
    			add_location(a3, file$b, 129, 16, 4492);
    			attr_dev(div6, "class", "xs-item-content");
    			add_location(div6, file$b, 83, 14, 2711);
    			attr_dev(div7, "class", "xs-popular-item xs-box-shadow");
    			add_location(div7, file$b, 61, 12, 1729);
    			attr_dev(div8, "class", "col-lg-4 col-md-6");
    			add_location(div8, file$b, 57, 10, 1591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, span0);
    			append_dev(span0, t1);
    			append_dev(p, t2);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t4);
    			append_dev(div6, t5);
    			append_dev(div6, a1);
    			append_dev(a1, t6);
    			append_dev(div6, t7);
    			append_dev(div6, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, t8);
    			append_dev(li1, t9);
    			append_dev(li1, span1);
    			append_dev(ul1, t11);
    			append_dev(ul1, li2);
    			append_dev(li2, span2);
    			append_dev(span2, t12);
    			append_dev(li2, t13);
    			append_dev(li2, span3);
    			append_dev(ul1, t15);
    			append_dev(ul1, li3);
    			append_dev(li3, t16);
    			append_dev(li3, t17);
    			append_dev(li3, span4);
    			append_dev(div6, t19);
    			append_dev(div6, span5);
    			append_dev(div6, t20);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div5, t21);
    			append_dev(div5, div4);
    			append_dev(div4, a2);
    			append_dev(a2, span6);
    			append_dev(a2, t23);
    			append_dev(a2, t24);
    			append_dev(div6, t25);
    			append_dev(div6, span7);
    			append_dev(div6, t26);
    			append_dev(div6, a3);
    			append_dev(a3, t27);
    			append_dev(div8, t28);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a3, "click", /*handleButton*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$crowdfundings*/ 1 && !src_url_equal(img0.src, img0_src_value = /*crowdfunding*/ ctx[4].thumbnail)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if ((!current || dirty & /*$crowdfundings*/ 1) && t1_value !== (t1_value = calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*$crowdfundings*/ 1) {
    				set_style(div0, "width", calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "%");
    			}

    			if ((!current || dirty & /*$crowdfundings*/ 1) && t4_value !== (t4_value = /*crowdfunding*/ ctx[4].category + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*$crowdfundings*/ 1 && a0_href_value !== (a0_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*$crowdfundings*/ 1) && t6_value !== (t6_value = /*crowdfunding*/ ctx[4].title + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*$crowdfundings*/ 1 && a1_href_value !== (a1_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((!current || dirty & /*$crowdfundings*/ 1) && t8_value !== (t8_value = formatCurrency(/*crowdfunding*/ ctx[4].target) + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$crowdfundings*/ 1) && t12_value !== (t12_value = calculateFunded(/*crowdfunding*/ ctx[4].pledged, /*crowdfunding*/ ctx[4].target) + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*$crowdfundings*/ 1) && t16_value !== (t16_value = calculateDaysRemaining(/*crowdfunding*/ ctx[4].date_end) + "")) set_data_dev(t16, t16_value);

    			if (!current || dirty & /*$crowdfundings*/ 1 && !src_url_equal(img1.src, img1_src_value = /*crowdfunding*/ ctx[4].profile_photo)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if ((!current || dirty & /*$crowdfundings*/ 1) && t24_value !== (t24_value = /*crowdfunding*/ ctx[4].profile_name + "")) set_data_dev(t24, t24_value);

    			if (!current || dirty & /*$crowdfundings*/ 1 && a2_href_value !== (a2_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id)) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$crowdfundings*/ 1 && a3_href_value !== (a3_href_value = "/donation/" + /*crowdfunding*/ ctx[4].id)) {
    				attr_dev(a3, "href", a3_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fly, { delay: 3500, x: -100 });
    					p_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div8_outro) div8_outro.end(1);
    				div8_intro = create_in_transition(div8, slide, { delay: 1000 });
    				div8_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div8_intro) div8_intro.invalidate();
    			div8_outro = create_out_transition(div8, fade, { delay: 1000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (detaching && div8_outro) div8_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:8) {#each $crowdfundings as crowdfunding}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let span;
    	let t2;
    	let p;
    	let t4;
    	let div2;
    	let current;
    	let each_value = /*$crowdfundings*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Penggalangan Dana";
    			t1 = space();
    			span = element("span");
    			t2 = space();
    			p = element("p");
    			p.textContent = "Berikut adalah penggalangan dana yang sedang aktif dan berjalan di Freeducation";
    			t4 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(h2, "class", "xs-title");
    			add_location(h2, file$b, 48, 10, 1222);
    			attr_dev(span, "class", "xs-separetor dashed");
    			add_location(span, file$b, 49, 10, 1277);
    			add_location(p, file$b, 50, 10, 1325);
    			attr_dev(div0, "class", "col-md-9 col-xl-9");
    			add_location(div0, file$b, 47, 8, 1179);
    			attr_dev(div1, "class", "xs-heading row xs-mb-60");
    			add_location(div1, file$b, 46, 6, 1132);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 55, 6, 1514);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$b, 45, 4, 1101);
    			attr_dev(section, "id", "popularcause");
    			attr_dev(section, "class", "bg-gray waypoint-tigger xs-section-padding");
    			add_location(section, file$b, 44, 2, 1017);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(div3, t4);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$crowdfundings, handleButton, calculateDaysRemaining, calculateFunded, formatCurrency*/ 3) {
    				each_value = /*$crowdfundings*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						group_outros();

    						transition_out(each_1_else, 1, 1, () => {
    							each_1_else = null;
    						});

    						check_outros();
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					transition_in(each_1_else, 1);
    					each_1_else.m(div2, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function calculateFunded(pledged, target) {
    	return Math.round(1 / (target / pledged) * 100);
    }

    function formatCurrency(nominal) {
    	return nominal.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    }

    function calculateDaysRemaining(date_end) {
    	const delta = date_end - new Date();
    	const oneDay = 24 * 60 * 60 * 1000;
    	return Math.round(Math.abs(delta / oneDay));
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $crowdfundings;
    	validate_store(crowdfundings, 'crowdfundings');
    	component_subscribe($$self, crowdfundings, $$value => $$invalidate(0, $crowdfundings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CrowdfundingList', slots, []);
    	let isModalOpen = false;

    	function handleButton() {
    		isModalOpen = true;
    	}

    	function handleCloseModal() {
    		isModalOpen = false;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CrowdfundingList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		slide,
    		crowdfundings,
    		Loader,
    		isModalOpen,
    		calculateFunded,
    		formatCurrency,
    		calculateDaysRemaining,
    		handleButton,
    		handleCloseModal,
    		$crowdfundings
    	});

    	$$self.$inject_state = $$props => {
    		if ('isModalOpen' in $$props) isModalOpen = $$props.isModalOpen;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$crowdfundings, handleButton];
    }

    class CrowdfundingList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CrowdfundingList",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.44.1 */

    const file$a = "src\\components\\Header.svelte";

    function create_fragment$c(ctx) {
    	let section;
    	let style;
    	let t1;
    	let nav;
    	let div2;
    	let a0;
    	let img;
    	let img_src_value;
    	let t2;
    	let button;
    	let span;
    	let t3;
    	let div1;
    	let ul;
    	let li0;
    	let a1;
    	let t5;
    	let li1;
    	let a2;
    	let t7;
    	let li2;
    	let a3;
    	let t9;
    	let li3;
    	let a4;
    	let t11;
    	let li4;
    	let a5;
    	let t13;
    	let li5;
    	let a6;
    	let t15;
    	let div0;
    	let a7;
    	let i;
    	let t16;

    	const block = {
    		c: function create() {
    			section = element("section");
    			style = element("style");
    			style.textContent = "@import url(\"https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap\");\r\n\r\n    .navbar-1-1.navbar-light .navbar-nav .nav-link {\r\n      color: #092a33;\r\n      transition: 0.3s;\r\n    }\r\n\r\n    .navbar-1-1.navbar-light .navbar-nav .nav-link.active {\r\n      font-weight: 500;\r\n    }\r\n\r\n    .navbar-1-1 .btn-get-started {\r\n      border-radius: 20px;\r\n      padding: 12px 30px;\r\n      font-weight: 500;\r\n    }\r\n\r\n    .navbar-1-1 .btn-get-started-blue {\r\n      background-color: #012c6d;\r\n      transition: 0.3s;\r\n    }\r\n\r\n    .navbar-1-1 .btn-get-started-blue:hover {\r\n      background-color: #1976d2;\r\n      transition: 0.3s;\r\n    }";
    			t1 = space();
    			nav = element("nav");
    			div2 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t2 = space();
    			button = element("button");
    			span = element("span");
    			t3 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Beranda";
    			t5 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Tentang";
    			t7 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Kontak";
    			t9 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Tim Kami";
    			t11 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Kerja Sama";
    			t13 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Sponsor";
    			t15 = space();
    			div0 = element("div");
    			a7 = element("a");
    			i = element("i");
    			t16 = text("Berdonasi");
    			add_location(style, file$a, 3, 2, 291);
    			if (!src_url_equal(img.src, img_src_value = "/assets/images/logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo Freeducation");
    			set_style(img, "height", "50px");
    			add_location(img, file$a, 34, 8, 1268);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$a, 33, 6, 1225);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file$a, 37, 8, 1579);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarTogglerDemo02");
    			attr_dev(button, "aria-controls", "navbarTogglerDemo02");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$a, 36, 6, 1371);
    			attr_dev(a1, "class", "nav-link px-md-4 active");
    			attr_dev(a1, "aria-current", "page");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$a, 42, 12, 1804);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$a, 41, 10, 1769);
    			attr_dev(a2, "class", "nav-link px-md-4");
    			attr_dev(a2, "href", "/about");
    			add_location(a2, file$a, 45, 12, 1943);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$a, 44, 10, 1908);
    			attr_dev(a3, "class", "nav-link px-md-4");
    			attr_dev(a3, "href", "/contact");
    			add_location(a3, file$a, 48, 12, 2060);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$a, 47, 10, 2025);
    			attr_dev(a4, "class", "nav-link px-md-4");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$a, 51, 12, 2178);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file$a, 50, 10, 2143);
    			attr_dev(a5, "class", "nav-link px-md-4");
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$a, 54, 12, 2291);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file$a, 53, 10, 2256);
    			attr_dev(a6, "class", "nav-link px-md-4");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$a, 57, 12, 2406);
    			attr_dev(li5, "class", "nav-item");
    			add_location(li5, file$a, 56, 10, 2371);
    			attr_dev(ul, "class", "navbar-nav mx-auto mb-2 mb-lg-0");
    			add_location(ul, file$a, 40, 8, 1713);
    			attr_dev(i, "class", "fas fa-heart mr-1");
    			add_location(i, file$a, 61, 82, 2600);
    			attr_dev(a7, "class", "btn btn-get-started btn-get-started-blue text-white");
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$a, 61, 10, 2528);
    			attr_dev(div0, "class", "d-flex");
    			add_location(div0, file$a, 60, 8, 2496);
    			attr_dev(div1, "class", "collapse navbar-collapse");
    			attr_dev(div1, "id", "navbarTogglerDemo02");
    			add_location(div1, file$a, 39, 6, 1640);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$a, 32, 4, 1194);
    			attr_dev(nav, "class", "navbar-1-1 navbar navbar-expand-lg navbar-light px-md-4 bg-body");
    			set_style(nav, "font-family", "Poppins, sans-serif");
    			add_location(nav, file$a, 31, 2, 1070);
    			attr_dev(section, "class", "h-100 w-100 bg-white");
    			set_style(section, "box-sizing", "border-box");
    			add_location(section, file$a, 2, 0, 218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, style);
    			append_dev(section, t1);
    			append_dev(section, nav);
    			append_dev(nav, div2);
    			append_dev(div2, a0);
    			append_dev(a0, img);
    			append_dev(div2, t2);
    			append_dev(div2, button);
    			append_dev(button, span);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    			append_dev(ul, t11);
    			append_dev(ul, li4);
    			append_dev(li4, a5);
    			append_dev(ul, t13);
    			append_dev(ul, li5);
    			append_dev(li5, a6);
    			append_dev(div1, t15);
    			append_dev(div1, div0);
    			append_dev(div0, a7);
    			append_dev(a7, i);
    			append_dev(a7, t16);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\Welcome.svelte generated by Svelte v3.44.1 */

    const file$9 = "src\\components\\Welcome.svelte";

    function create_fragment$b(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let p;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Every child has the right to learn.";
    			t1 = space();
    			p = element("p");
    			t2 = text("On any given school day, over 1 billion children\r\n              ");
    			br = element("br");
    			t3 = text("\r\n              around the world head to class.");
    			t4 = space();
    			a = element("a");
    			a.textContent = "Lihat Proyek Yang Sedang Berjalan";
    			add_location(h2, file$9, 7, 12, 247);
    			add_location(br, file$9, 11, 14, 402);
    			add_location(p, file$9, 9, 12, 319);
    			attr_dev(a, "href", "#popularcause");
    			attr_dev(a, "class", "btn btn-outline-primary");
    			add_location(a, file$9, 14, 12, 487);
    			attr_dev(div0, "class", "xs-welcome-wraper color-white");
    			add_location(div0, file$9, 6, 10, 190);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$9, 5, 8, 155);
    			attr_dev(div2, "class", "xs-welcome-content");
    			set_style(div2, "background-image", "url(assets/images/sekolah.jpg)");
    			add_location(div2, file$9, 2, 6, 37);
    			add_location(div3, file$9, 1, 4, 24);
    			attr_dev(section, "class", "");
    			add_location(section, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, br);
    			append_dev(p, t3);
    			append_dev(div0, t4);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Welcome', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Welcome> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Welcome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Welcome",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Promo.svelte generated by Svelte v3.44.1 */

    const file$8 = "src\\components\\Promo.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let div10;
    	let div0;
    	let h2;
    	let t0;
    	let span0;
    	let br0;
    	let t2;
    	let span1;
    	let t4;
    	let t5;
    	let div9;
    	let div2;
    	let div1;
    	let span2;
    	let i0;
    	let t6;
    	let h50;
    	let t7;
    	let br1;
    	let t8;
    	let t9;
    	let p0;
    	let t11;
    	let div4;
    	let div3;
    	let span3;
    	let i1;
    	let t12;
    	let h51;
    	let t13;
    	let br2;
    	let t14;
    	let t15;
    	let p1;
    	let t17;
    	let div6;
    	let div5;
    	let span4;
    	let i2;
    	let t18;
    	let h52;
    	let t19;
    	let br3;
    	let t20;
    	let t21;
    	let p2;
    	let t23;
    	let div8;
    	let div7;
    	let span5;
    	let i3;
    	let t24;
    	let h53;
    	let t25;
    	let br4;
    	let t26;
    	let t27;
    	let p3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div10 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text("Kami sudah membantu mendanai ");
    			span0 = element("span");
    			span0.textContent = "1 proyek";
    			br0 = element("br");
    			t2 = text(" untuk ");
    			span1 = element("span");
    			span1.textContent = "25 orang";
    			t4 = text(" dari seluruh Indonesia");
    			t5 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			span2 = element("span");
    			i0 = element("i");
    			t6 = space();
    			h50 = element("h5");
    			t7 = text("Beasiswa");
    			br1 = element("br");
    			t8 = text("Untuk Anak Berprestasi");
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Di Freeducation.id kami membantu siswa-siswi yang ingin mengenyam pendidikan namu terkendala di bagian finansial.";
    			t11 = space();
    			div4 = element("div");
    			div3 = element("div");
    			span3 = element("span");
    			i1 = element("i");
    			t12 = space();
    			h51 = element("h5");
    			t13 = text("Dana Untuk");
    			br2 = element("br");
    			t14 = text("Perbaikan Sekolah");
    			t15 = space();
    			p1 = element("p");
    			p1.textContent = "Kami juga membantu sekolah-sekolah yang bangunannya kurang layak agar bisa mendapatkan dana untuk merenovasi bangunan.";
    			t17 = space();
    			div6 = element("div");
    			div5 = element("div");
    			span4 = element("span");
    			i2 = element("i");
    			t18 = space();
    			h52 = element("h5");
    			t19 = text("Dana Untuk");
    			br3 = element("br");
    			t20 = text(" Riset dan Penelitian");
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "Kami sangat menghargai ilmuwan-ilmuwan muda yang bekerja demi kemajuan ilmu, bangsa, dan negara. Untuk itu Freeducation hadir untuk memberikan akses ke dana riset dan penelitian.";
    			t23 = space();
    			div8 = element("div");
    			div7 = element("div");
    			span5 = element("span");
    			i3 = element("i");
    			t24 = space();
    			h53 = element("h5");
    			t25 = text("Bantuan Buku ");
    			br4 = element("br");
    			t26 = text("Untuk Siswa Yang Membutuhkan");
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "Buku adalah salah satu sumber belajar bagi banyak siswa-siswi di Indonesia, namun masih ada yang terkendala untuk membelinya. Freeducation ada untuk mengatasi masalah tersebut.";
    			add_location(span0, file$8, 3, 70, 192);
    			add_location(br0, file$8, 3, 91, 213);
    			add_location(span1, file$8, 3, 102, 224);
    			attr_dev(h2, "class", "xs-mb-0 xs-title");
    			add_location(h2, file$8, 3, 12, 134);
    			attr_dev(div0, "class", "xs-heading xs-mb-70 text-center");
    			add_location(div0, file$8, 2, 8, 75);
    			attr_dev(i0, "class", "fas fa-user-graduate");
    			add_location(i0, file$8, 9, 26, 467);
    			add_location(span2, file$8, 9, 20, 461);
    			add_location(br1, file$8, 10, 32, 544);
    			add_location(h50, file$8, 10, 20, 532);
    			add_location(p0, file$8, 11, 20, 597);
    			attr_dev(div1, "class", "xs-service-promo");
    			add_location(div1, file$8, 8, 16, 409);
    			attr_dev(div2, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div2, file$8, 7, 12, 348);
    			attr_dev(i1, "class", "fas fa-school");
    			add_location(i1, file$8, 16, 26, 924);
    			add_location(span3, file$8, 16, 20, 918);
    			add_location(br2, file$8, 17, 34, 996);
    			add_location(h51, file$8, 17, 20, 982);
    			add_location(p1, file$8, 18, 20, 1044);
    			attr_dev(div3, "class", "xs-service-promo");
    			add_location(div3, file$8, 15, 16, 866);
    			attr_dev(div4, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div4, file$8, 14, 12, 805);
    			attr_dev(i2, "class", "fas fa-microscope");
    			add_location(i2, file$8, 23, 26, 1376);
    			add_location(span4, file$8, 23, 20, 1370);
    			add_location(br3, file$8, 24, 34, 1452);
    			add_location(h52, file$8, 24, 20, 1438);
    			add_location(p2, file$8, 25, 20, 1504);
    			attr_dev(div5, "class", "xs-service-promo");
    			add_location(div5, file$8, 22, 16, 1318);
    			attr_dev(div6, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div6, file$8, 21, 12, 1257);
    			attr_dev(i3, "class", "fas fa-book-open");
    			add_location(i3, file$8, 30, 26, 1896);
    			add_location(span5, file$8, 30, 20, 1890);
    			add_location(br4, file$8, 31, 37, 1974);
    			add_location(h53, file$8, 31, 20, 1957);
    			add_location(p3, file$8, 32, 20, 2033);
    			attr_dev(div7, "class", "xs-service-promo");
    			add_location(div7, file$8, 29, 16, 1838);
    			attr_dev(div8, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div8, file$8, 28, 12, 1777);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$8, 6, 8, 317);
    			attr_dev(div10, "class", "container");
    			add_location(div10, file$8, 1, 4, 42);
    			attr_dev(section, "class", "xs-section-padding");
    			add_location(section, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div10);
    			append_dev(div10, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, span0);
    			append_dev(h2, br0);
    			append_dev(h2, t2);
    			append_dev(h2, span1);
    			append_dev(h2, t4);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(span2, i0);
    			append_dev(div1, t6);
    			append_dev(div1, h50);
    			append_dev(h50, t7);
    			append_dev(h50, br1);
    			append_dev(h50, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p0);
    			append_dev(div9, t11);
    			append_dev(div9, div4);
    			append_dev(div4, div3);
    			append_dev(div3, span3);
    			append_dev(span3, i1);
    			append_dev(div3, t12);
    			append_dev(div3, h51);
    			append_dev(h51, t13);
    			append_dev(h51, br2);
    			append_dev(h51, t14);
    			append_dev(div3, t15);
    			append_dev(div3, p1);
    			append_dev(div9, t17);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div5, span4);
    			append_dev(span4, i2);
    			append_dev(div5, t18);
    			append_dev(div5, h52);
    			append_dev(h52, t19);
    			append_dev(h52, br3);
    			append_dev(h52, t20);
    			append_dev(div5, t21);
    			append_dev(div5, p2);
    			append_dev(div9, t23);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, span5);
    			append_dev(span5, i3);
    			append_dev(div7, t24);
    			append_dev(div7, h53);
    			append_dev(h53, t25);
    			append_dev(h53, br4);
    			append_dev(h53, t26);
    			append_dev(div7, t27);
    			append_dev(div7, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Promo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Promo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Promo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Promo",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.44.1 */

    const file$7 = "src\\components\\Footer.svelte";

    function create_fragment$9(ctx) {
    	let body;
    	let section;
    	let style;
    	let t1;
    	let div11;
    	let div6;
    	let div5;
    	let div1;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t2;
    	let p0;
    	let t3;
    	let i0;
    	let t5;
    	let t6;
    	let div2;
    	let h20;
    	let t8;
    	let nav0;
    	let li0;
    	let a1;
    	let t10;
    	let li1;
    	let a2;
    	let t12;
    	let li2;
    	let a3;
    	let t14;
    	let li3;
    	let a4;
    	let t16;
    	let div3;
    	let h21;
    	let t18;
    	let nav1;
    	let li4;
    	let a5;
    	let t20;
    	let li5;
    	let a6;
    	let t22;
    	let li6;
    	let a7;
    	let t24;
    	let li7;
    	let a8;
    	let t26;
    	let li8;
    	let a9;
    	let t28;
    	let div4;
    	let h22;
    	let t30;
    	let nav2;
    	let li9;
    	let a10;
    	let t32;
    	let li10;
    	let a11;
    	let t34;
    	let li11;
    	let a12;
    	let t36;
    	let li12;
    	let a13;
    	let t38;
    	let li13;
    	let a14;
    	let t40;
    	let div10;
    	let div7;
    	let hr;
    	let t41;
    	let div9;
    	let div8;
    	let ul;
    	let li14;
    	let a15;
    	let i1;
    	let t42;
    	let li15;
    	let a16;
    	let i2;
    	let t43;
    	let li16;
    	let a17;
    	let i3;
    	let t44;
    	let nav3;
    	let a18;
    	let t46;
    	let span0;
    	let t48;
    	let a19;
    	let t50;
    	let span1;
    	let t52;
    	let a20;
    	let t54;
    	let nav4;
    	let p1;
    	let t56;
    	let script;
    	let script_src_value;

    	const block = {
    		c: function create() {
    			body = element("body");
    			section = element("section");
    			style = element("style");
    			style.textContent = "@import url(\"https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap\");\r\n            \r\n            .footer-2-1 {\r\n                background-color: #012C6D;\r\n                min-height: 100vh;\r\n            }\r\n\r\n\t\t\t.footer-2-1 .list-space {\r\n\t\t\t\tmargin-bottom: 1.25rem;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .footer-text-title {\r\n\t\t\t\tfont: 600 1.5rem Poppins, sans-serif;\r\n\t\t\t\tmargin-bottom: 1.5rem;\r\n                color: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .list-menu {\r\n\t\t\t\tcolor: white;\r\n\t\t\t\ttext-decoration: none !important;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .list-menu:hover {\r\n\t\t\t\tcolor: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 hr.hr {\r\n\t\t\t\tmargin: 0;\r\n\t\t\t\tborder: 0;\r\n\t\t\t\tborder-top: 1px solid rgba(0, 0, 0, 0.1);\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .border-color {\r\n\t\t\t\tcolor: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .footer-link {\r\n\t\t\t\tcolor: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .footer-link:hover {\r\n\t\t\t\tcolor: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .social-media-c:hover circle,\r\n\t\t\t.footer-2-1 .social-media-p:hover path {\r\n\t\t\t\tfill: white;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .footer-info-space {\r\n\t\t\t\tpadding-top: 3rem;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .list-footer {\r\n\t\t\t\tpadding: 5rem 1rem 3rem 1rem;\r\n\t\t\t}\r\n\r\n\t\t\t.footer-2-1 .info-footer {\r\n\t\t\t\tpadding: 0 1rem 3rem;\r\n\t\t\t}\r\n\r\n\t\t\t@media (min-width: 576px) {\r\n\t\t\t\t.footer-2-1 .list-footer {\r\n\t\t\t\t\tpadding: 5rem 2rem 3rem 2rem;\r\n\t\t\t\t}\r\n\r\n\t\t\t\t.footer-2-1 .info-footer {\r\n\t\t\t\t\tpadding: 0 2rem 3rem;\r\n\t\t\t\t}\r\n\t\t\t}\r\n\r\n\t\t\t@media (min-width: 768px) {\r\n\t\t\t\t.footer-2-1 .list-footer {\r\n\t\t\t\t\tpadding: 5rem 4rem 6rem 4rem;\r\n\t\t\t\t}\r\n\r\n\t\t\t\t.footer-2-1 .info-footer {\r\n\t\t\t\t\tpadding: 0 4rem 3rem;\r\n\t\t\t\t}\r\n\t\t\t}\r\n\r\n\t\t\t@media (min-width: 992px) {\r\n\t\t\t\t.footer-2-1 .list-footer {\r\n\t\t\t\t\tpadding: 5rem 6rem 6rem 6rem;\r\n\t\t\t\t}\r\n\r\n\t\t\t\t.footer-2-1 .info-footer {\r\n\t\t\t\t\tpadding: 0 6rem 3rem;\r\n\t\t\t\t}\r\n\t\t\t}\r\n\r\n            .footer-caption {\r\n                    color: white;\r\n                }";
    			t1 = space();
    			div11 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Freeducation adalah sebuah platform ");
    			i0 = element("i");
    			i0.textContent = "open source";
    			t5 = text(" untuk membantu saudara-saudara kita yang ada di tanah air dari sisi finansial untuk mengenyam pendidikan.");
    			t6 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Fitur";
    			t8 = space();
    			nav0 = element("nav");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Berdonasi";
    			t10 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Penggalangan Dana";
    			t12 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Mengajukan Beasiswa";
    			t14 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Mengadakan Beasiswa";
    			t16 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Informasi";
    			t18 = space();
    			nav1 = element("nav");
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Kontak";
    			t20 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Tentang";
    			t22 = space();
    			li6 = element("li");
    			a7 = element("a");
    			a7.textContent = "Tim";
    			t24 = space();
    			li7 = element("li");
    			a8 = element("a");
    			a8.textContent = "Kerja sama";
    			t26 = space();
    			li8 = element("li");
    			a9 = element("a");
    			a9.textContent = "Sponsor";
    			t28 = space();
    			div4 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Bantuan";
    			t30 = space();
    			nav2 = element("nav");
    			li9 = element("li");
    			a10 = element("a");
    			a10.textContent = "Pers";
    			t32 = space();
    			li10 = element("li");
    			a11 = element("a");
    			a11.textContent = "Media";
    			t34 = space();
    			li11 = element("li");
    			a12 = element("a");
    			a12.textContent = "Pelatihan";
    			t36 = space();
    			li12 = element("li");
    			a13 = element("a");
    			a13.textContent = "Kampanye";
    			t38 = space();
    			li13 = element("li");
    			a14 = element("a");
    			a14.textContent = "Open Projects ID";
    			t40 = space();
    			div10 = element("div");
    			div7 = element("div");
    			hr = element("hr");
    			t41 = space();
    			div9 = element("div");
    			div8 = element("div");
    			ul = element("ul");
    			li14 = element("li");
    			a15 = element("a");
    			i1 = element("i");
    			t42 = space();
    			li15 = element("li");
    			a16 = element("a");
    			i2 = element("i");
    			t43 = space();
    			li16 = element("li");
    			a17 = element("a");
    			i3 = element("i");
    			t44 = space();
    			nav3 = element("nav");
    			a18 = element("a");
    			a18.textContent = "Syarat & Ketentuan";
    			t46 = space();
    			span0 = element("span");
    			span0.textContent = "|";
    			t48 = space();
    			a19 = element("a");
    			a19.textContent = "Kebijakan Privasi";
    			t50 = space();
    			span1 = element("span");
    			span1.textContent = "|";
    			t52 = space();
    			a20 = element("a");
    			a20.textContent = "Lisensi";
    			t54 = space();
    			nav4 = element("nav");
    			p1 = element("p");
    			p1.textContent = "Hak Cipta © 2021 Freeducation";
    			t56 = space();
    			script = element("script");
    			add_location(style, file$7, 2, 2, 88);
    			if (!src_url_equal(img.src, img_src_value = "/assets/images/Footer_Logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 105, 36, 2420);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "xs-footer-logo");
    			add_location(a0, file$7, 104, 32, 2347);
    			add_location(i0, file$7, 107, 94, 2603);
    			attr_dev(p0, "class", "footer-caption");
    			add_location(p0, file$7, 107, 32, 2541);
    			add_location(div0, file$7, 103, 7, 2308);
    			attr_dev(div1, "class", "col-lg-3 col-md-6 px-5");
    			add_location(div1, file$7, 102, 5, 2263);
    			attr_dev(h20, "class", "footer-text-title");
    			add_location(h20, file$7, 112, 6, 2883);
    			attr_dev(a1, "href", "https://api.whatsapp.com/send?phone=6282125609413&text=Halo%20Admin%20Freeducation%20ID,%20Saya%20mau%20berdonasi");
    			attr_dev(a1, "class", "list-menu");
    			add_location(a1, file$7, 115, 8, 3000);
    			attr_dev(li0, "class", "list-space");
    			add_location(li0, file$7, 114, 7, 2967);
    			attr_dev(a2, "href", "https://api.whatsapp.com/send?phone=6282125609413&text=Halo%20Admin%20Freeducation%20ID,%20Saya%20mau%20menggalang%20dana%20untuk%20pendidikan");
    			attr_dev(a2, "class", "list-menu");
    			add_location(a2, file$7, 118, 8, 3211);
    			attr_dev(li1, "class", "list-space");
    			add_location(li1, file$7, 117, 7, 3178);
    			attr_dev(a3, "href", "https://api.whatsapp.com/send?phone=6282125609413&text=Halo%20Admin%20Freeducation%20ID,%20Saya%20mau%20mengajukan%beasiswa");
    			attr_dev(a3, "class", "list-menu");
    			add_location(a3, file$7, 121, 8, 3459);
    			attr_dev(li2, "class", "list-space");
    			add_location(li2, file$7, 120, 7, 3426);
    			attr_dev(a4, "href", "https://api.whatsapp.com/send?phone=6282125609413&text=Halo%20Admin%20Freeducation%20ID,%20Saya%20mau%20mengadakan%beasiswa");
    			attr_dev(a4, "class", "list-menu");
    			add_location(a4, file$7, 124, 8, 3690);
    			attr_dev(li3, "class", "list-space");
    			add_location(li3, file$7, 123, 7, 3657);
    			attr_dev(nav0, "class", "list-unstyled");
    			add_location(nav0, file$7, 113, 6, 2931);
    			attr_dev(div2, "class", "col-lg-3 col-md-6 px-5");
    			add_location(div2, file$7, 111, 20, 2839);
    			attr_dev(h21, "class", "footer-text-title");
    			add_location(h21, file$7, 129, 6, 3957);
    			attr_dev(a5, "href", "/contact");
    			attr_dev(a5, "class", "list-menu");
    			add_location(a5, file$7, 132, 8, 4078);
    			attr_dev(li4, "class", "list-space");
    			add_location(li4, file$7, 131, 7, 4045);
    			attr_dev(a6, "href", "/about");
    			attr_dev(a6, "class", "list-menu");
    			add_location(a6, file$7, 135, 8, 4181);
    			attr_dev(li5, "class", "list-space");
    			add_location(li5, file$7, 134, 7, 4148);
    			attr_dev(a7, "href", "");
    			attr_dev(a7, "class", "list-menu");
    			add_location(a7, file$7, 138, 8, 4283);
    			attr_dev(li6, "class", "list-space");
    			add_location(li6, file$7, 137, 7, 4250);
    			attr_dev(a8, "href", "");
    			attr_dev(a8, "class", "list-menu");
    			add_location(a8, file$7, 141, 8, 4375);
    			attr_dev(li7, "class", "list-space");
    			add_location(li7, file$7, 140, 7, 4342);
    			attr_dev(a9, "href", "");
    			attr_dev(a9, "class", "list-menu");
    			add_location(a9, file$7, 144, 8, 4474);
    			attr_dev(li8, "class", "list-space");
    			add_location(li8, file$7, 143, 7, 4441);
    			attr_dev(nav1, "class", "list-unstyled");
    			add_location(nav1, file$7, 130, 6, 4009);
    			attr_dev(div3, "class", "col-lg-3 col-md-6 px-5");
    			add_location(div3, file$7, 128, 5, 3913);
    			attr_dev(h22, "class", "footer-text-title");
    			add_location(h22, file$7, 149, 6, 4606);
    			attr_dev(a10, "href", "");
    			attr_dev(a10, "class", "list-menu");
    			add_location(a10, file$7, 152, 8, 4725);
    			attr_dev(li9, "class", "list-space");
    			add_location(li9, file$7, 151, 7, 4692);
    			attr_dev(a11, "href", "");
    			attr_dev(a11, "class", "list-menu");
    			add_location(a11, file$7, 155, 8, 4818);
    			attr_dev(li10, "class", "list-space");
    			add_location(li10, file$7, 154, 7, 4785);
    			attr_dev(a12, "href", "");
    			attr_dev(a12, "class", "list-menu");
    			add_location(a12, file$7, 158, 8, 4912);
    			attr_dev(li11, "class", "list-space");
    			add_location(li11, file$7, 157, 7, 4879);
    			attr_dev(a13, "href", "");
    			attr_dev(a13, "class", "list-menu");
    			add_location(a13, file$7, 161, 8, 5010);
    			attr_dev(li12, "class", "list-space");
    			add_location(li12, file$7, 160, 7, 4977);
    			attr_dev(a14, "href", "https://github.com/OpenProjects-id");
    			attr_dev(a14, "class", "list-menu");
    			add_location(a14, file$7, 164, 8, 5107);
    			attr_dev(li13, "class", "list-space");
    			add_location(li13, file$7, 163, 7, 5074);
    			attr_dev(nav2, "class", "list-unstyled");
    			add_location(nav2, file$7, 150, 6, 4656);
    			attr_dev(div4, "class", "col-lg-3 col-md-6 px-5");
    			add_location(div4, file$7, 148, 5, 4562);
    			attr_dev(div5, "class", "row gap-md-0 gap-3");
    			add_location(div5, file$7, 101, 4, 2224);
    			attr_dev(div6, "class", "list-footer");
    			add_location(div6, file$7, 100, 3, 2193);
    			attr_dev(hr, "class", "hr");
    			add_location(hr, file$7, 173, 5, 5326);
    			attr_dev(div7, "class", "");
    			add_location(div7, file$7, 172, 4, 5305);
    			attr_dev(i1, "class", "fab fa-facebook");
    			add_location(i1, file$7, 178, 66, 5637);
    			attr_dev(a15, "href", "");
    			attr_dev(a15, "class", "color-facebook");
    			add_location(a15, file$7, 178, 32, 5603);
    			add_location(li14, file$7, 178, 28, 5599);
    			attr_dev(i2, "class", "fab fa-twitter");
    			add_location(i2, file$7, 179, 65, 5744);
    			attr_dev(a16, "href", "");
    			attr_dev(a16, "class", "color-twitter");
    			add_location(a16, file$7, 179, 32, 5711);
    			add_location(li15, file$7, 179, 28, 5707);
    			attr_dev(i3, "class", "fab fa-instagram");
    			add_location(i3, file$7, 180, 108, 5893);
    			attr_dev(a17, "href", "https://www.instagram.com/freeducation.id/");
    			attr_dev(a17, "class", "color-dribbble");
    			add_location(a17, file$7, 180, 32, 5817);
    			add_location(li16, file$7, 180, 28, 5813);
    			attr_dev(ul, "class", "xs-social-list-v2");
    			add_location(ul, file$7, 177, 6, 5539);
    			attr_dev(div8, "class", "d-flex title-font font-medium align-items-center gap-4");
    			add_location(div8, file$7, 176, 5, 5463);
    			attr_dev(a18, "href", "");
    			attr_dev(a18, "class", "footer-link");
    			set_style(a18, "text-decoration", "none");
    			add_location(a18, file$7, 184, 6, 6079);
    			add_location(span0, file$7, 185, 6, 6170);
    			attr_dev(a19, "href", "");
    			attr_dev(a19, "class", "footer-link");
    			set_style(a19, "text-decoration", "none");
    			add_location(a19, file$7, 186, 6, 6192);
    			add_location(span1, file$7, 187, 6, 6282);
    			attr_dev(a20, "href", "https://github.com/OpenProjects-id/Freeducation/blob/main/LICENSE");
    			attr_dev(a20, "class", "footer-link");
    			set_style(a20, "text-decoration", "none");
    			add_location(a20, file$7, 188, 6, 6304);
    			attr_dev(nav3, "class", "mx-auto d-flex flex-wrap align-items-center justify-content-center gap-4");
    			add_location(nav3, file$7, 183, 5, 5985);
    			set_style(p1, "margin", "0");
    			add_location(p1, file$7, 191, 6, 6555);
    			attr_dev(nav4, "class", "d-flex flex-lg-row flex-column align-items-center justify-content-center");
    			add_location(nav4, file$7, 190, 5, 6461);
    			attr_dev(div9, "class", "mx-auto d-flex flex-column flex-lg-row align-items-center footer-info-space gap-4");
    			add_location(div9, file$7, 175, 4, 5361);
    			attr_dev(div10, "class", "border-color info-footer");
    			add_location(div10, file$7, 171, 3, 5261);
    			attr_dev(div11, "class", "footer-2-1 container-xxl mx-auto position-relative p-0");
    			set_style(div11, "font-family", "'Poppins', sans-serif");
    			add_location(div11, file$7, 99, 2, 2077);
    			attr_dev(section, "class", "h-100 w-100 bg-white");
    			set_style(section, "box-sizing", "border-box");
    			add_location(section, file$7, 1, 7, 15);
    			if (!src_url_equal(script.src, script_src_value = "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "integrity", "sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0");
    			attr_dev(script, "crossorigin", "anonymous");
    			add_location(script, file$7, 197, 6, 6677);
    			add_location(body, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, section);
    			append_dev(section, style);
    			append_dev(section, t1);
    			append_dev(section, div11);
    			append_dev(div11, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, t3);
    			append_dev(p0, i0);
    			append_dev(p0, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div2);
    			append_dev(div2, h20);
    			append_dev(div2, t8);
    			append_dev(div2, nav0);
    			append_dev(nav0, li0);
    			append_dev(li0, a1);
    			append_dev(nav0, t10);
    			append_dev(nav0, li1);
    			append_dev(li1, a2);
    			append_dev(nav0, t12);
    			append_dev(nav0, li2);
    			append_dev(li2, a3);
    			append_dev(nav0, t14);
    			append_dev(nav0, li3);
    			append_dev(li3, a4);
    			append_dev(div5, t16);
    			append_dev(div5, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t18);
    			append_dev(div3, nav1);
    			append_dev(nav1, li4);
    			append_dev(li4, a5);
    			append_dev(nav1, t20);
    			append_dev(nav1, li5);
    			append_dev(li5, a6);
    			append_dev(nav1, t22);
    			append_dev(nav1, li6);
    			append_dev(li6, a7);
    			append_dev(nav1, t24);
    			append_dev(nav1, li7);
    			append_dev(li7, a8);
    			append_dev(nav1, t26);
    			append_dev(nav1, li8);
    			append_dev(li8, a9);
    			append_dev(div5, t28);
    			append_dev(div5, div4);
    			append_dev(div4, h22);
    			append_dev(div4, t30);
    			append_dev(div4, nav2);
    			append_dev(nav2, li9);
    			append_dev(li9, a10);
    			append_dev(nav2, t32);
    			append_dev(nav2, li10);
    			append_dev(li10, a11);
    			append_dev(nav2, t34);
    			append_dev(nav2, li11);
    			append_dev(li11, a12);
    			append_dev(nav2, t36);
    			append_dev(nav2, li12);
    			append_dev(li12, a13);
    			append_dev(nav2, t38);
    			append_dev(nav2, li13);
    			append_dev(li13, a14);
    			append_dev(div11, t40);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, hr);
    			append_dev(div10, t41);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, ul);
    			append_dev(ul, li14);
    			append_dev(li14, a15);
    			append_dev(a15, i1);
    			append_dev(ul, t42);
    			append_dev(ul, li15);
    			append_dev(li15, a16);
    			append_dev(a16, i2);
    			append_dev(ul, t43);
    			append_dev(ul, li16);
    			append_dev(li16, a17);
    			append_dev(a17, i3);
    			append_dev(div9, t44);
    			append_dev(div9, nav3);
    			append_dev(nav3, a18);
    			append_dev(nav3, t46);
    			append_dev(nav3, span0);
    			append_dev(nav3, t48);
    			append_dev(nav3, a19);
    			append_dev(nav3, t50);
    			append_dev(nav3, span1);
    			append_dev(nav3, t52);
    			append_dev(nav3, a20);
    			append_dev(div9, t54);
    			append_dev(div9, nav4);
    			append_dev(nav4, p1);
    			append_dev(body, t56);
    			append_dev(body, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.44.1 */

    function create_fragment$8(ctx) {
    	let header;
    	let t0;
    	let welcome;
    	let t1;
    	let crowdfundinglist;
    	let t2;
    	let promo;
    	let t3;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	welcome = new Welcome({ $$inline: true });
    	crowdfundinglist = new CrowdfundingList({ $$inline: true });
    	promo = new Promo({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(welcome.$$.fragment);
    			t1 = space();
    			create_component(crowdfundinglist.$$.fragment);
    			t2 = space();
    			create_component(promo.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(welcome, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(crowdfundinglist, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(promo, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(welcome.$$.fragment, local);
    			transition_in(crowdfundinglist.$$.fragment, local);
    			transition_in(promo.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(welcome.$$.fragment, local);
    			transition_out(crowdfundinglist.$$.fragment, local);
    			transition_out(promo.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(welcome, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(crowdfundinglist, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(promo, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CrowdfundingList,
    		Header,
    		Welcome,
    		Promo,
    		Footer
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\About.svelte generated by Svelte v3.44.1 */
    const file$6 = "src\\pages\\About.svelte";

    function create_fragment$7(ctx) {
    	let header;
    	let t0;
    	let section0;
    	let div1;
    	let div0;
    	let h20;
    	let t2;
    	let p0;
    	let t4;
    	let main;
    	let div7;
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t5;
    	let div2;
    	let a;
    	let i0;
    	let t6;
    	let section1;
    	let div21;
    	let div10;
    	let div9;
    	let div8;
    	let h21;
    	let t7;
    	let span0;
    	let t9;
    	let t10;
    	let div13;
    	let div12;
    	let div11;
    	let h50;
    	let t11;
    	let span1;
    	let t13;
    	let span2;
    	let t15;
    	let div20;
    	let div15;
    	let div14;
    	let h30;
    	let t17;
    	let p1;
    	let t19;
    	let div17;
    	let div16;
    	let h31;
    	let t21;
    	let p2;
    	let t23;
    	let div19;
    	let div18;
    	let h32;
    	let t25;
    	let p3;
    	let t27;
    	let p4;
    	let t29;
    	let p5;
    	let t31;
    	let p6;
    	let t33;
    	let br0;
    	let t34;
    	let div33;
    	let div32;
    	let div22;
    	let h22;
    	let t36;
    	let div31;
    	let div24;
    	let div23;
    	let i1;
    	let t37;
    	let span3;
    	let span4;
    	let t40;
    	let small0;
    	let t42;
    	let div26;
    	let div25;
    	let i2;
    	let t43;
    	let span5;
    	let span6;
    	let t46;
    	let small1;
    	let t48;
    	let div28;
    	let div27;
    	let i3;
    	let t49;
    	let span7;
    	let span8;
    	let t52;
    	let small2;
    	let t54;
    	let div30;
    	let div29;
    	let i4;
    	let t55;
    	let span9;
    	let t57;
    	let small3;
    	let t59;
    	let section2;
    	let div45;
    	let div35;
    	let div34;
    	let h23;
    	let t61;
    	let span10;
    	let t62;
    	let p7;
    	let t64;
    	let div44;
    	let div37;
    	let div36;
    	let span11;
    	let i5;
    	let t65;
    	let h51;
    	let t66;
    	let br1;
    	let t67;
    	let t68;
    	let p8;
    	let t70;
    	let div39;
    	let div38;
    	let span12;
    	let i6;
    	let t71;
    	let h52;
    	let t72;
    	let br2;
    	let t73;
    	let t74;
    	let p9;
    	let t76;
    	let div41;
    	let div40;
    	let span13;
    	let i7;
    	let t77;
    	let h53;
    	let t78;
    	let br3;
    	let t79;
    	let t80;
    	let p10;
    	let t82;
    	let div43;
    	let div42;
    	let span14;
    	let i8;
    	let t83;
    	let h54;
    	let t84;
    	let br4;
    	let t85;
    	let t86;
    	let p11;
    	let t88;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Tentang";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Membantu Indonesia demi pendidikan yang lebih maju";
    			t4 = space();
    			main = element("main");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t5 = space();
    			div2 = element("div");
    			a = element("a");
    			i0 = element("i");
    			t6 = space();
    			section1 = element("section");
    			div21 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h21 = element("h2");
    			t7 = text("Kami adalah organisasi non-profit yang ");
    			span0 = element("span");
    			span0.textContent = "membantu";
    			t9 = text(" mereka yang ingin meraih pendidikan tinggi tapi terhambat masalah finansial.");
    			t10 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			h50 = element("h5");
    			t11 = text("Bertepatan dengan Hari Guru Nasional 2021, kami ingin memperkenalkan Freeducation sebagai Social Business Enterprise. Freeducation ingin turut berkontribusi mengimplementasikan Pembukaan UUD 1945 alinea keempat yang berbunyi ");
    			span1 = element("span");
    			span1.textContent = "\"... mencerdaskan kehidupan bangsa\"";
    			t13 = text("\r\n              dan UUD 1945 Pasal 31 ayat 1 yang berbunyi ");
    			span2 = element("span");
    			span2.textContent = "\"Setiap warga negara berhak mendapatkan pendidikan\".";
    			t15 = space();
    			div20 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Visi Kami";
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "Mencerdaskan kehidupan bangsa melalui teknologi untuk semua lapisan masyarakat, kapan saja dan dimana saja secara gratis.";
    			t19 = space();
    			div17 = element("div");
    			div16 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Misi Kami";
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "Membangun komunitas open-source yang bertujuan membantu Indonesia demi pendidikan yang lebih maju.";
    			t23 = space();
    			div19 = element("div");
    			div18 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Nilai Kami";
    			t25 = space();
    			p3 = element("p");
    			p3.textContent = "Cepat";
    			t27 = space();
    			p4 = element("p");
    			p4.textContent = "Tanggap";
    			t29 = space();
    			p5 = element("p");
    			p5.textContent = "Lincah";
    			t31 = space();
    			p6 = element("p");
    			p6.textContent = "Profesional";
    			t33 = space();
    			br0 = element("br");
    			t34 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div22 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Kami hadir untuk membantu semua orang mendapatkan hak yang sama dalam pendidikan.";
    			t36 = space();
    			div31 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			i1 = element("i");
    			t37 = space();
    			span3 = element("span");
    			span3.textContent = "0";
    			span4 = element("span");
    			span4.textContent = "M";
    			t40 = space();
    			small0 = element("small");
    			small0.textContent = "Proyek";
    			t42 = space();
    			div26 = element("div");
    			div25 = element("div");
    			i2 = element("i");
    			t43 = space();
    			span5 = element("span");
    			span5.textContent = "0";
    			span6 = element("span");
    			span6.textContent = "k";
    			t46 = space();
    			small1 = element("small");
    			small1.textContent = "Relawan";
    			t48 = space();
    			div28 = element("div");
    			div27 = element("div");
    			i3 = element("i");
    			t49 = space();
    			span7 = element("span");
    			span7.textContent = "0";
    			span8 = element("span");
    			span8.textContent = "k";
    			t52 = space();
    			small2 = element("small");
    			small2.textContent = "Orang";
    			t54 = space();
    			div30 = element("div");
    			div29 = element("div");
    			i4 = element("i");
    			t55 = space();
    			span9 = element("span");
    			span9.textContent = "0";
    			t57 = space();
    			small3 = element("small");
    			small3.textContent = "Negara";
    			t59 = space();
    			section2 = element("section");
    			div45 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Apa yang kami lakukan?";
    			t61 = space();
    			span10 = element("span");
    			t62 = space();
    			p7 = element("p");
    			p7.textContent = "Membantu apa yang bisa kami bantu dalam berbagai hal demi deunia pendidikan yang lebih baik.";
    			t64 = space();
    			div44 = element("div");
    			div37 = element("div");
    			div36 = element("div");
    			span11 = element("span");
    			i5 = element("i");
    			t65 = space();
    			h51 = element("h5");
    			t66 = text("Beasiswa");
    			br1 = element("br");
    			t67 = text("Untuk Anak Berprestasi");
    			t68 = space();
    			p8 = element("p");
    			p8.textContent = "Di Freeducation.id kami membantu siswa-siswi yang ingin mengenyam pendidikan namu terkendala di bagian finansial.";
    			t70 = space();
    			div39 = element("div");
    			div38 = element("div");
    			span12 = element("span");
    			i6 = element("i");
    			t71 = space();
    			h52 = element("h5");
    			t72 = text("Dana Untuk");
    			br2 = element("br");
    			t73 = text("Perbaikan Sekolah");
    			t74 = space();
    			p9 = element("p");
    			p9.textContent = "Kami juga membantu sekolah-sekolah yang bangunannya kurang layak agar bisa mendapatkan dana untuk merenovasi bangunan.";
    			t76 = space();
    			div41 = element("div");
    			div40 = element("div");
    			span13 = element("span");
    			i7 = element("i");
    			t77 = space();
    			h53 = element("h5");
    			t78 = text("Dana Untuk");
    			br3 = element("br");
    			t79 = text(" Riset dan Penelitian");
    			t80 = space();
    			p10 = element("p");
    			p10.textContent = "Kami sangat menghargai ilmuwan-ilmuwan muda yang bekerja demi kemajuan ilmu, bangsa, dan negara. Untuk itu Freeducation hadir untuk memberikan akses ke dana riset dan penelitian.";
    			t82 = space();
    			div43 = element("div");
    			div42 = element("div");
    			span14 = element("span");
    			i8 = element("i");
    			t83 = space();
    			h54 = element("h5");
    			t84 = text("Bantuan Buku ");
    			br4 = element("br");
    			t85 = text("Untuk Siswa Yang Membutuhkan");
    			t86 = space();
    			p11 = element("p");
    			p11.textContent = "Buku adalah salah satu sumber belajar bagi banyak siswa-siswi di Indonesia, namun masih ada yang terkendala untuk membelinya. Freeducation ada untuk mengatasi masalah tersebut.";
    			t88 = space();
    			create_component(footer.$$.fragment);
    			add_location(h20, file$6, 9, 6, 347);
    			add_location(p0, file$6, 10, 6, 371);
    			attr_dev(div0, "class", "color-white xs-inner-banner-content");
    			add_location(div0, file$6, 8, 4, 290);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$6, 7, 2, 261);
    			attr_dev(section0, "class", "xs-banner-inner-section parallax-window");
    			set_style(section0, "background-image", "url('assets/images/about_bg.png')");
    			add_location(section0, file$6, 6, 0, 141);
    			if (!src_url_equal(img.src, img_src_value = "assets/images/thumbnail-video.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 23, 12, 785);
    			attr_dev(i0, "class", "fa fa-play");
    			add_location(i0, file$6, 26, 16, 1029);
    			attr_dev(a, "href", "https://www.youtube.com/watch?v=CmcjO4SWrgQ");
    			attr_dev(a, "class", "xs-video-popup xs-round-btn");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 25, 14, 905);
    			attr_dev(div2, "class", "xs-video-popup-content");
    			add_location(div2, file$6, 24, 12, 853);
    			attr_dev(div3, "class", "xs-video-popup-wraper");
    			add_location(div3, file$6, 22, 10, 736);
    			attr_dev(div4, "class", "col-lg-8 content-center");
    			add_location(div4, file$6, 21, 8, 687);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$6, 20, 6, 660);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$6, 19, 4, 629);
    			attr_dev(div7, "class", "xs-video-popup-section");
    			add_location(div7, file$6, 18, 2, 587);
    			attr_dev(span0, "class", "color-green");
    			add_location(span0, file$6, 46, 80, 1690);
    			attr_dev(h21, "class", "xs-mb-0 xs-title");
    			add_location(h21, file$6, 46, 12, 1622);
    			attr_dev(div8, "class", "xs-heading xs-mb-100 text-center");
    			add_location(div8, file$6, 45, 10, 1562);
    			attr_dev(div9, "class", "col-lg-12 content-center");
    			add_location(div9, file$6, 44, 8, 1512);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$6, 43, 6, 1485);
    			attr_dev(span1, "class", "color-green");
    			add_location(span1, file$6, 55, 239, 2266);
    			attr_dev(span2, "class", "color-green");
    			add_location(span2, file$6, 58, 57, 2426);
    			add_location(h50, file$6, 54, 12, 2021);
    			attr_dev(div11, "class", "xs-mb-100 content-justify");
    			add_location(div11, file$6, 53, 10, 1968);
    			attr_dev(div12, "class", "col-lg-12 text-center");
    			add_location(div12, file$6, 52, 8, 1921);
    			attr_dev(div13, "class", "row");
    			add_location(div13, file$6, 51, 6, 1894);
    			add_location(h30, file$6, 67, 12, 2728);
    			attr_dev(p1, "class", "lead");
    			add_location(p1, file$6, 68, 12, 2760);
    			attr_dev(div14, "class", "xs-about-feature");
    			add_location(div14, file$6, 66, 10, 2684);
    			attr_dev(div15, "class", "col-md-4");
    			add_location(div15, file$6, 65, 8, 2650);
    			add_location(h31, file$6, 73, 12, 3023);
    			attr_dev(p2, "class", "lead");
    			add_location(p2, file$6, 74, 12, 3055);
    			attr_dev(div16, "class", "xs-about-feature");
    			add_location(div16, file$6, 72, 10, 2979);
    			attr_dev(div17, "class", "col-md-4");
    			add_location(div17, file$6, 71, 8, 2945);
    			add_location(h32, file$6, 79, 12, 3295);
    			attr_dev(p3, "class", "lead");
    			add_location(p3, file$6, 80, 12, 3328);
    			attr_dev(p4, "class", "lead");
    			add_location(p4, file$6, 81, 12, 3367);
    			attr_dev(p5, "class", "lead");
    			add_location(p5, file$6, 82, 12, 3408);
    			attr_dev(p6, "class", "lead");
    			add_location(p6, file$6, 83, 12, 3448);
    			add_location(br0, file$6, 84, 12, 3493);
    			attr_dev(div18, "class", "xs-about-feature");
    			add_location(div18, file$6, 78, 10, 3251);
    			attr_dev(div19, "class", "col-md-4");
    			add_location(div19, file$6, 77, 8, 3217);
    			attr_dev(div20, "class", "row text-center");
    			add_location(div20, file$6, 64, 6, 2611);
    			attr_dev(div21, "class", "container");
    			add_location(div21, file$6, 42, 4, 1454);
    			attr_dev(section1, "class", "xs-content-section-padding");
    			add_location(section1, file$6, 41, 2, 1404);
    			attr_dev(h22, "class", "xs-title color-white small text-center");
    			add_location(h22, file$6, 94, 8, 3798);
    			attr_dev(div22, "class", "row col-lg-10 xs-heading mx-auto");
    			add_location(div22, file$6, 93, 6, 3742);
    			attr_dev(i1, "class", "icon-donation_2");
    			add_location(i1, file$6, 99, 12, 4084);
    			attr_dev(span3, "class", "number-percentage-count number-percentage");
    			attr_dev(span3, "data-value", "10");
    			attr_dev(span3, "data-animation-duration", "3500");
    			add_location(span3, file$6, 100, 12, 4127);
    			add_location(span4, file$6, 100, 123, 4238);
    			add_location(small0, file$6, 101, 12, 4266);
    			attr_dev(div23, "class", "xs-single-funFact color-white");
    			add_location(div23, file$6, 98, 10, 4027);
    			attr_dev(div24, "class", "col-lg-3 col-md-6");
    			add_location(div24, file$6, 97, 8, 3984);
    			attr_dev(i2, "class", "icon-group");
    			add_location(i2, file$6, 106, 12, 4431);
    			attr_dev(span5, "class", "number-percentage-count number-percentage");
    			attr_dev(span5, "data-value", "25");
    			attr_dev(span5, "data-animation-duration", "3500");
    			add_location(span5, file$6, 107, 12, 4469);
    			add_location(span6, file$6, 107, 123, 4580);
    			add_location(small1, file$6, 108, 12, 4608);
    			attr_dev(div25, "class", "xs-single-funFact color-white");
    			add_location(div25, file$6, 105, 10, 4374);
    			attr_dev(div26, "class", "col-lg-3 col-md-6");
    			add_location(div26, file$6, 104, 8, 4331);
    			attr_dev(i3, "class", "icon-children");
    			add_location(i3, file$6, 113, 12, 4774);
    			attr_dev(span7, "class", "number-percentage-count number-percentage");
    			attr_dev(span7, "data-value", "30");
    			attr_dev(span7, "data-animation-duration", "3500");
    			add_location(span7, file$6, 114, 12, 4815);
    			add_location(span8, file$6, 114, 123, 4926);
    			add_location(small2, file$6, 115, 12, 4954);
    			attr_dev(div27, "class", "xs-single-funFact color-white");
    			add_location(div27, file$6, 112, 10, 4717);
    			attr_dev(div28, "class", "col-lg-3 col-md-6");
    			add_location(div28, file$6, 111, 8, 4674);
    			attr_dev(i4, "class", "icon-planet-earth");
    			add_location(i4, file$6, 120, 12, 5118);
    			attr_dev(span9, "class", "number-percentage-count number-percentage");
    			attr_dev(span9, "data-value", "14");
    			attr_dev(span9, "data-animation-duration", "3500");
    			add_location(span9, file$6, 121, 12, 5163);
    			add_location(small3, file$6, 122, 12, 5288);
    			attr_dev(div29, "class", "xs-single-funFact color-white");
    			add_location(div29, file$6, 119, 10, 5061);
    			attr_dev(div30, "class", "col-lg-3 col-md-6");
    			add_location(div30, file$6, 118, 8, 5018);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$6, 96, 6, 3957);
    			attr_dev(div32, "class", "container");
    			add_location(div32, file$6, 92, 4, 3711);
    			attr_dev(div33, "class", "xs-funfact-section xs-content-section-padding waypoint-tigger parallax-window");
    			set_style(div33, "background-color", "#012C6D");
    			add_location(div33, file$6, 91, 2, 3579);
    			attr_dev(h23, "class", "xs-title");
    			add_location(h23, file$6, 133, 10, 5548);
    			attr_dev(span10, "class", "xs-separetor dashed");
    			add_location(span10, file$6, 134, 10, 5608);
    			add_location(p7, file$6, 135, 10, 5656);
    			attr_dev(div34, "class", "col-md-9 col-xl-9");
    			add_location(div34, file$6, 132, 8, 5505);
    			attr_dev(div35, "class", "xs-heading row xs-mb-60");
    			add_location(div35, file$6, 131, 6, 5458);
    			attr_dev(i5, "class", "fas fa-user-graduate");
    			add_location(i5, file$6, 143, 18, 5990);
    			add_location(span11, file$6, 143, 12, 5984);
    			add_location(br1, file$6, 144, 24, 6057);
    			add_location(h51, file$6, 144, 12, 6045);
    			add_location(p8, file$6, 145, 12, 6104);
    			attr_dev(div36, "class", "xs-service-promo");
    			add_location(div36, file$6, 142, 10, 5940);
    			attr_dev(div37, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div37, file$6, 141, 8, 5885);
    			attr_dev(i6, "class", "fas fa-school");
    			add_location(i6, file$6, 151, 18, 6415);
    			add_location(span12, file$6, 151, 12, 6409);
    			add_location(br2, file$6, 152, 26, 6477);
    			add_location(h52, file$6, 152, 12, 6463);
    			add_location(p9, file$6, 153, 12, 6519);
    			attr_dev(div38, "class", "xs-service-promo");
    			add_location(div38, file$6, 150, 10, 6365);
    			attr_dev(div39, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div39, file$6, 149, 8, 6310);
    			attr_dev(i7, "class", "fas fa-microscope");
    			add_location(i7, file$6, 159, 18, 6835);
    			add_location(span13, file$6, 159, 12, 6829);
    			add_location(br3, file$6, 160, 26, 6901);
    			add_location(h53, file$6, 160, 12, 6887);
    			add_location(p10, file$6, 161, 12, 6947);
    			attr_dev(div40, "class", "xs-service-promo");
    			add_location(div40, file$6, 158, 10, 6785);
    			attr_dev(div41, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div41, file$6, 157, 8, 6730);
    			attr_dev(i8, "class", "fas fa-book-open");
    			add_location(i8, file$6, 167, 18, 7323);
    			add_location(span14, file$6, 167, 12, 7317);
    			add_location(br4, file$6, 168, 29, 7391);
    			add_location(h54, file$6, 168, 12, 7374);
    			add_location(p11, file$6, 169, 12, 7444);
    			attr_dev(div42, "class", "xs-service-promo");
    			add_location(div42, file$6, 166, 10, 7273);
    			attr_dev(div43, "class", "col-md-6 col-lg-3 text-center");
    			add_location(div43, file$6, 165, 8, 7218);
    			attr_dev(div44, "class", "row");
    			add_location(div44, file$6, 140, 6, 5858);
    			attr_dev(div45, "class", "container");
    			add_location(div45, file$6, 130, 4, 5427);
    			attr_dev(section2, "class", "xs-section-padding");
    			add_location(section2, file$6, 129, 2, 5385);
    			attr_dev(main, "class", "xs-main");
    			add_location(main, file$6, 16, 0, 521);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, i0);
    			append_dev(main, t6);
    			append_dev(main, section1);
    			append_dev(section1, div21);
    			append_dev(div21, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h21);
    			append_dev(h21, t7);
    			append_dev(h21, span0);
    			append_dev(h21, t9);
    			append_dev(div21, t10);
    			append_dev(div21, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, h50);
    			append_dev(h50, t11);
    			append_dev(h50, span1);
    			append_dev(h50, t13);
    			append_dev(h50, span2);
    			append_dev(div21, t15);
    			append_dev(div21, div20);
    			append_dev(div20, div15);
    			append_dev(div15, div14);
    			append_dev(div14, h30);
    			append_dev(div14, t17);
    			append_dev(div14, p1);
    			append_dev(div20, t19);
    			append_dev(div20, div17);
    			append_dev(div17, div16);
    			append_dev(div16, h31);
    			append_dev(div16, t21);
    			append_dev(div16, p2);
    			append_dev(div20, t23);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, h32);
    			append_dev(div18, t25);
    			append_dev(div18, p3);
    			append_dev(div18, t27);
    			append_dev(div18, p4);
    			append_dev(div18, t29);
    			append_dev(div18, p5);
    			append_dev(div18, t31);
    			append_dev(div18, p6);
    			append_dev(div18, t33);
    			append_dev(div18, br0);
    			append_dev(main, t34);
    			append_dev(main, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div22);
    			append_dev(div22, h22);
    			append_dev(div32, t36);
    			append_dev(div32, div31);
    			append_dev(div31, div24);
    			append_dev(div24, div23);
    			append_dev(div23, i1);
    			append_dev(div23, t37);
    			append_dev(div23, span3);
    			append_dev(div23, span4);
    			append_dev(div23, t40);
    			append_dev(div23, small0);
    			append_dev(div31, t42);
    			append_dev(div31, div26);
    			append_dev(div26, div25);
    			append_dev(div25, i2);
    			append_dev(div25, t43);
    			append_dev(div25, span5);
    			append_dev(div25, span6);
    			append_dev(div25, t46);
    			append_dev(div25, small1);
    			append_dev(div31, t48);
    			append_dev(div31, div28);
    			append_dev(div28, div27);
    			append_dev(div27, i3);
    			append_dev(div27, t49);
    			append_dev(div27, span7);
    			append_dev(div27, span8);
    			append_dev(div27, t52);
    			append_dev(div27, small2);
    			append_dev(div31, t54);
    			append_dev(div31, div30);
    			append_dev(div30, div29);
    			append_dev(div29, i4);
    			append_dev(div29, t55);
    			append_dev(div29, span9);
    			append_dev(div29, t57);
    			append_dev(div29, small3);
    			append_dev(main, t59);
    			append_dev(main, section2);
    			append_dev(section2, div45);
    			append_dev(div45, div35);
    			append_dev(div35, div34);
    			append_dev(div34, h23);
    			append_dev(div34, t61);
    			append_dev(div34, span10);
    			append_dev(div34, t62);
    			append_dev(div34, p7);
    			append_dev(div45, t64);
    			append_dev(div45, div44);
    			append_dev(div44, div37);
    			append_dev(div37, div36);
    			append_dev(div36, span11);
    			append_dev(span11, i5);
    			append_dev(div36, t65);
    			append_dev(div36, h51);
    			append_dev(h51, t66);
    			append_dev(h51, br1);
    			append_dev(h51, t67);
    			append_dev(div36, t68);
    			append_dev(div36, p8);
    			append_dev(div44, t70);
    			append_dev(div44, div39);
    			append_dev(div39, div38);
    			append_dev(div38, span12);
    			append_dev(span12, i6);
    			append_dev(div38, t71);
    			append_dev(div38, h52);
    			append_dev(h52, t72);
    			append_dev(h52, br2);
    			append_dev(h52, t73);
    			append_dev(div38, t74);
    			append_dev(div38, p9);
    			append_dev(div44, t76);
    			append_dev(div44, div41);
    			append_dev(div41, div40);
    			append_dev(div40, span13);
    			append_dev(span13, i7);
    			append_dev(div40, t77);
    			append_dev(div40, h53);
    			append_dev(h53, t78);
    			append_dev(h53, br3);
    			append_dev(h53, t79);
    			append_dev(div40, t80);
    			append_dev(div40, p10);
    			append_dev(div44, t82);
    			append_dev(div44, div43);
    			append_dev(div43, div42);
    			append_dev(div42, span14);
    			append_dev(span14, i8);
    			append_dev(div42, t83);
    			append_dev(div42, h54);
    			append_dev(h54, t84);
    			append_dev(h54, br4);
    			append_dev(h54, t85);
    			append_dev(div42, t86);
    			append_dev(div42, p11);
    			insert_dev(target, t88, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t88);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Footer });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 11,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: true,
        scaleControl: false,
        draggable: true,
        disableDefaultUI: true,

        // The latitude and longitude to center the map (always required)
        center: { lat: -6.17646, lng: 106.791752 }, // New York

        // How you would like to style the map.
        // This is where you would paste any style found on Snazzy Maps.
        styles: [
            {
                featureType: "administrative",
                elementType: "all",
                stylers: [{ saturation: "-100" }],
            },
            {
                featureType: "administrative.province",
                elementType: "all",
                stylers: [{ visibility: "off" }],
            },
            {
                featureType: "landscape",
                elementType: "all",
                stylers: [
                    { saturation: -100 },
                    { lightness: 65 },
                    { visibility: "on" },
                ],
            },
            {
                featureType: "poi",
                elementType: "all",
                stylers: [
                    { saturation: -100 },
                    { lightness: "50" },
                    { visibility: "simplified" },
                ],
            },
            {
                featureType: "road",
                elementType: "all",
                stylers: [{ saturation: "-100" }],
            },
            {
                featureType: "road.highway",
                elementType: "all",
                stylers: [{ visibility: "simplified" }],
            },
            {
                featureType: "road.arterial",
                elementType: "all",
                stylers: [{ lightness: "30" }],
            },
            {
                featureType: "road.local",
                elementType: "all",
                stylers: [{ lightness: "40" }],
            },
            {
                featureType: "transit",
                elementType: "all",
                stylers: [{ saturation: -100 }, { visibility: "simplified" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [
                    { hue: "#ffff00" },
                    { lightness: -25 },
                    { saturation: -97 },
                ],
            },
            {
                featureType: "water",
                elementType: "labels",
                stylers: [{ lightness: -25 }, { saturation: -100 }],
            },
        ],
    };

    /* src\components\Map.svelte generated by Svelte v3.44.1 */
    const file$5 = "src\\components\\Map.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "xs-map");
    			attr_dev(div0, "class", "xs-box-shadow-2");
    			add_location(div0, file$5, 15, 4, 437);
    			attr_dev(div1, "class", "xs-maps-wraper map-wraper-v2");
    			add_location(div1, file$5, 14, 2, 389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[1](div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Map', slots, []);
    	let container, map;

    	onMount(function () {
    		map = new google.maps.Map(container, mapOptions);

    		new google.maps.Marker({
    				position: new google.maps.LatLng(40.67, -73.94),
    				map,
    				title: "Snazzy!"
    			});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, mapOptions, container, map });

    	$$self.$inject_state = $$props => {
    		if ('container' in $$props) $$invalidate(0, container = $$props.container);
    		if ('map' in $$props) map = $$props.map;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [container, div0_binding];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\Contact.svelte generated by Svelte v3.44.1 */
    const file$4 = "src\\pages\\Contact.svelte";

    function create_fragment$5(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let header;
    	let t1;
    	let section0;
    	let div1;
    	let div0;
    	let h2;
    	let t3;
    	let p;
    	let t5;
    	let main;
    	let section1;
    	let div16;
    	let div15;
    	let div14;
    	let div12;
    	let div11;
    	let h4;
    	let t7;
    	let form;
    	let div4;
    	let input0;
    	let t8;
    	let div3;
    	let div2;
    	let i0;
    	let t9;
    	let div7;
    	let input1;
    	let t10;
    	let div6;
    	let div5;
    	let i1;
    	let t11;
    	let div10;
    	let textarea;
    	let t12;
    	let div9;
    	let div8;
    	let i2;
    	let t13;
    	let button;
    	let t15;
    	let div13;
    	let iframe;
    	let iframe_src_value;
    	let t16;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			section0 = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Kontak";
    			t3 = space();
    			p = element("p");
    			p.textContent = "Butuh bantuan? Hubungi kami";
    			t5 = space();
    			main = element("main");
    			section1 = element("section");
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Kirimkan kami pesan";
    			t7 = space();
    			form = element("form");
    			div4 = element("div");
    			input0 = element("input");
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");
    			i0 = element("i");
    			t9 = space();
    			div7 = element("div");
    			input1 = element("input");
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			i1 = element("i");
    			t11 = space();
    			div10 = element("div");
    			textarea = element("textarea");
    			t12 = space();
    			div9 = element("div");
    			div8 = element("div");
    			i2 = element("i");
    			t13 = space();
    			button = element("button");
    			button.textContent = "Kirim";
    			t15 = space();
    			div13 = element("div");
    			iframe = element("iframe");
    			t16 = space();
    			create_component(footer.$$.fragment);
    			script.defer = true;
    			script.async = true;
    			if (!src_url_equal(script.src, script_src_value = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCy7becgYuLwns3uumNm6WdBYkBpLfy44k&callback=initMap")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$4, 9, 2, 216);
    			add_location(h2, file$4, 22, 3, 660);
    			add_location(p, file$4, 23, 3, 680);
    			attr_dev(div0, "class", "color-white xs-inner-banner-content");
    			add_location(div0, file$4, 21, 2, 606);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$4, 20, 1, 579);
    			attr_dev(section0, "class", "xs-banner-inner-section parallax-window");
    			set_style(section0, "background-image", "url('assets/images/contact_bg.png')");
    			add_location(section0, file$4, 19, 0, 458);
    			add_location(h4, file$4, 36, 14, 1040);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "id", "xs-name");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Enter Your Name.....");
    			add_location(input0, file$4, 39, 18, 1239);
    			attr_dev(i0, "class", "fa fa-user");
    			add_location(i0, file$4, 41, 50, 1445);
    			attr_dev(div2, "class", "input-group-text");
    			add_location(div2, file$4, 41, 20, 1415);
    			attr_dev(div3, "class", "input-group-append");
    			add_location(div3, file$4, 40, 18, 1361);
    			attr_dev(div4, "class", "input-group");
    			add_location(div4, file$4, 38, 16, 1194);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "id", "xs-email");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "placeholder", "Enter Your Email.....");
    			add_location(input1, file$4, 46, 18, 1631);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$4, 48, 50, 1841);
    			attr_dev(div5, "class", "input-group-text");
    			add_location(div5, file$4, 48, 20, 1811);
    			attr_dev(div6, "class", "input-group-append");
    			add_location(div6, file$4, 47, 18, 1757);
    			attr_dev(div7, "class", "input-group");
    			add_location(div7, file$4, 45, 16, 1586);
    			attr_dev(textarea, "name", "massage");
    			attr_dev(textarea, "placeholder", "Enter Your Message.....");
    			attr_dev(textarea, "id", "xs-massage");
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file$4, 53, 18, 2046);
    			attr_dev(i2, "class", "fa fa-pencil");
    			add_location(i2, file$4, 55, 50, 2272);
    			attr_dev(div8, "class", "input-group-text");
    			add_location(div8, file$4, 55, 20, 2242);
    			attr_dev(div9, "class", "input-group-append");
    			add_location(div9, file$4, 54, 18, 2188);
    			attr_dev(div10, "class", "input-group massage-group");
    			add_location(div10, file$4, 52, 16, 1987);
    			attr_dev(button, "class", "btn btn-success");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "id", "xs-submit");
    			add_location(button, file$4, 59, 16, 2415);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "id", "xs-contact-form");
    			attr_dev(form, "class", "xs-contact-form contact-form-v2");
    			add_location(form, file$4, 37, 14, 1084);
    			attr_dev(div11, "class", "xs-contact-form-wraper");
    			add_location(div11, file$4, 35, 12, 988);
    			attr_dev(div12, "class", "col-lg-6");
    			add_location(div12, file$4, 34, 10, 952);
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3966.6591430492995!2d106.7892984!3d-6.1763647!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f65f9ccbfb47%3A0x94f1dfd1fc19abb8!2sJl.%20Letjen%20S.%20Parman%20No.28%2C%20RT.12%2FRW.6%2C%20Tj.%20Duren%20Sel.%2C%20Kec.%20Grogol%20petamburan%2C%20Kota%20Jakarta%20Barat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2011470!5e0!3m2!1sid!2sid!4v1638122679679!5m2!1sid!2sid")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "500");
    			attr_dev(iframe, "height", "450");
    			set_style(iframe, "border", "0");
    			iframe.allowFullscreen = "";
    			attr_dev(iframe, "loading", "lazy");
    			add_location(iframe, file$4, 66, 12, 2711);
    			attr_dev(div13, "class", "col-lg-6");
    			add_location(div13, file$4, 65, 10, 2675);
    			attr_dev(div14, "class", "row");
    			add_location(div14, file$4, 33, 8, 923);
    			attr_dev(div15, "class", "xs-contact-container");
    			add_location(div15, file$4, 32, 6, 879);
    			attr_dev(div16, "class", "container");
    			add_location(div16, file$4, 31, 4, 848);
    			attr_dev(section1, "class", "xs-contact-section-v2");
    			add_location(section1, file$4, 30, 2, 803);
    			attr_dev(main, "class", "xs-main");
    			add_location(main, file$4, 28, 0, 749);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			append_dev(section1, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div12, div11);
    			append_dev(div11, h4);
    			append_dev(div11, t7);
    			append_dev(div11, form);
    			append_dev(form, div4);
    			append_dev(div4, input0);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, i0);
    			append_dev(form, t9);
    			append_dev(form, div7);
    			append_dev(div7, input1);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, i1);
    			append_dev(form, t11);
    			append_dev(form, div10);
    			append_dev(div10, textarea);
    			append_dev(div10, t12);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, i2);
    			append_dev(form, t13);
    			append_dev(form, button);
    			append_dev(div14, t15);
    			append_dev(div14, div13);
    			append_dev(div13, iframe);
    			insert_dev(target, t16, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t16);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	let { ready } = $$props;
    	const writable_props = ['ready'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	$$self.$capture_state = () => ({ Header, Footer, Map: Map$1, ready });

    	$$self.$inject_state = $$props => {
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ready];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { ready: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ready*/ ctx[0] === undefined && !('ready' in props)) {
    			console.warn("<Contact> was created without expected prop 'ready'");
    		}
    	}

    	get ready() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ready(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Donation.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$3 = "src\\pages\\Donation.svelte";

    // (66:0) {:else}
    function create_else_block(ctx) {
    	let section0;
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t2_value = /*$crowdfunding*/ ctx[1].title + "";
    	let t2;
    	let t3;
    	let main;
    	let section1;
    	let div12;
    	let div11;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t4;
    	let div10;
    	let div9;
    	let div4;
    	let h21;
    	let t5_value = /*$crowdfunding*/ ctx[1].title + "";
    	let t5;
    	let t6;
    	let p1;
    	let t8;
    	let h5;
    	let t9;
    	let strong;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let span0;
    	let t14;
    	let form;
    	let div5;
    	let label0;
    	let t15;
    	let span1;
    	let t17;
    	let input0;
    	let t18;
    	let div6;
    	let label1;
    	let t19;
    	let span2;
    	let t21;
    	let input1;
    	let t22;
    	let div7;
    	let label2;
    	let t23;
    	let span3;
    	let t25;
    	let input2;
    	let t26;
    	let div8;
    	let input3;
    	let t27;
    	let label3;
    	let t28;
    	let span4;
    	let t30;
    	let button;
    	let span5;
    	let i;
    	let t31;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Berdonasi";
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			main = element("main");
    			section1 = element("section");
    			div12 = element("div");
    			div11 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t4 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div4 = element("div");
    			h21 = element("h2");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Meskipun kami hadir sebagai organisasi non-profit, namun tidak bisa dipungkiri bahwa biaya server, domain, pemeliharaan, dll harus tetap jalan. Kamu bisa berdonasi buat kami agar tetap bisa menyalakan layanan platform\r\n                  Freeducation ini untuk menolong saudara-saudara kita.";
    			t8 = space();
    			h5 = element("h5");
    			t9 = text("Donasi kami akan berkontribusi sebesar\r\n                  ");
    			strong = element("strong");
    			t10 = text(/*contribute*/ ctx[5]);
    			t11 = text("%");
    			t12 = text("\r\n                  dari total donasi yang ada.");
    			t13 = space();
    			span0 = element("span");
    			t14 = space();
    			form = element("form");
    			div5 = element("div");
    			label0 = element("label");
    			t15 = text("Jumlah Donasi\r\n                    ");
    			span1 = element("span");
    			span1.textContent = "**";
    			t17 = space();
    			input0 = element("input");
    			t18 = space();
    			div6 = element("div");
    			label1 = element("label");
    			t19 = text("Nama Anda\r\n                    ");
    			span2 = element("span");
    			span2.textContent = "**";
    			t21 = space();
    			input1 = element("input");
    			t22 = space();
    			div7 = element("div");
    			label2 = element("label");
    			t23 = text("Email Anda\r\n                    ");
    			span3 = element("span");
    			span3.textContent = "**";
    			t25 = space();
    			input2 = element("input");
    			t26 = space();
    			div8 = element("div");
    			input3 = element("input");
    			t27 = space();
    			label3 = element("label");
    			t28 = text("Saya setuju dengan Syarat dan Ketentuan dari Freeducation\r\n                    ");
    			span4 = element("span");
    			span4.textContent = "**";
    			t30 = space();
    			button = element("button");
    			span5 = element("span");
    			i = element("i");
    			t31 = text("\r\n                  Berdonasi Sekarang");
    			add_location(h20, file$3, 72, 8, 2152);
    			add_location(p0, file$3, 73, 8, 2180);
    			attr_dev(div0, "class", "color-white xs-inner-banner-content");
    			add_location(div0, file$3, 71, 6, 2093);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$3, 70, 4, 2062);
    			attr_dev(section0, "class", "xs-banner-inner-section parallax-window");
    			set_style(section0, "background-image", "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80')");
    			add_location(section0, file$3, 66, 2, 1795);
    			if (!src_url_equal(img.src, img_src_value = /*$crowdfunding*/ ctx[1].thumbnail)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-responsive");
    			attr_dev(img, "alt", "Family Images");
    			set_style(img, "border-radius", "25px");
    			add_location(img, file$3, 86, 14, 2580);
    			attr_dev(div2, "class", "xs-donation-form-images svelte-zm84ao");
    			add_location(div2, file$3, 85, 12, 2527);
    			attr_dev(div3, "class", "col-lg-6");
    			add_location(div3, file$3, 84, 10, 2491);
    			attr_dev(h21, "class", "xs-title");
    			add_location(h21, file$3, 92, 16, 2879);
    			attr_dev(p1, "class", "small");
    			add_location(p1, file$3, 93, 16, 2944);
    			add_location(strong, file$3, 99, 18, 3393);
    			add_location(h5, file$3, 97, 16, 3311);
    			attr_dev(span0, "class", "xs-separetor v2");
    			add_location(span0, file$3, 102, 16, 3511);
    			attr_dev(div4, "class", "xs-heading xs-mb-30");
    			add_location(div4, file$3, 91, 14, 2828);
    			attr_dev(span1, "class", "color-light-red");
    			add_location(span1, file$3, 109, 20, 3912);
    			attr_dev(label0, "for", "xs-donate-name");
    			add_location(label0, file$3, 107, 18, 3827);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "amount");
    			attr_dev(input0, "id", "xs-donate-amount");
    			attr_dev(input0, "class", "form-control");
    			input0.required = "true";
    			attr_dev(input0, "placeholder", "Rp. ");
    			add_location(input0, file$3, 111, 18, 3999);
    			attr_dev(div5, "class", "xs-input-group");
    			add_location(div5, file$3, 106, 16, 3779);
    			attr_dev(span2, "class", "color-light-red");
    			add_location(span2, file$3, 117, 20, 4349);
    			attr_dev(label1, "for", "xs-donate-name");
    			add_location(label1, file$3, 115, 18, 4268);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "name");
    			attr_dev(input1, "id", "xs-donate-name");
    			attr_dev(input1, "class", "form-control");
    			input1.required = "true";
    			attr_dev(input1, "placeholder", "Masukkan Nama Anda");
    			add_location(input1, file$3, 119, 18, 4436);
    			attr_dev(div6, "class", "xs-input-group");
    			add_location(div6, file$3, 114, 16, 4220);
    			attr_dev(span3, "class", "color-light-red");
    			add_location(span3, file$3, 124, 20, 4750);
    			attr_dev(label2, "for", "xs-donate-email");
    			add_location(label2, file$3, 122, 18, 4667);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "name", "email");
    			input2.required = "true";
    			attr_dev(input2, "id", "xs-donate-email");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "placeholder", "Masukkan Email Anda");
    			add_location(input2, file$3, 126, 18, 4837);
    			attr_dev(div7, "class", "xs-input-group");
    			add_location(div7, file$3, 121, 16, 4619);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "name", "agree");
    			attr_dev(input3, "id", "xs-donate-agree");
    			attr_dev(input3, "class", "svelte-zm84ao");
    			add_location(input3, file$3, 129, 18, 5096);
    			attr_dev(span4, "class", "color-light-red");
    			add_location(span4, file$3, 132, 20, 5325);
    			attr_dev(label3, "for", "xs-donate-agree");
    			attr_dev(label3, "class", "svelte-zm84ao");
    			add_location(label3, file$3, 130, 18, 5195);
    			attr_dev(div8, "class", "xs-input-group svelte-zm84ao");
    			attr_dev(div8, "id", "xs-input-checkbox");
    			add_location(div8, file$3, 128, 16, 5025);
    			attr_dev(i, "class", "fa fa-heart");
    			add_location(i, file$3, 138, 20, 5652);
    			attr_dev(span5, "class", "badge");
    			add_location(span5, file$3, 137, 18, 5610);
    			attr_dev(button, "type", "submit");
    			button.disabled = button_disabled_value = !/*agree*/ ctx[4];
    			attr_dev(button, "class", "btn btn-primary text-white");
    			set_style(button, "background-color", "#012C6D");
    			add_location(button, file$3, 136, 16, 5480);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "xs-donation-form");
    			attr_dev(form, "class", "xs-donation-form");
    			attr_dev(form, "name", "xs-donation-form");
    			add_location(form, file$3, 105, 14, 3621);
    			attr_dev(div9, "class", "xs-donation-form-wraper");
    			add_location(div9, file$3, 90, 12, 2775);
    			attr_dev(div10, "class", "col-lg-6");
    			add_location(div10, file$3, 89, 10, 2739);
    			attr_dev(div11, "class", "row");
    			add_location(div11, file$3, 83, 8, 2462);
    			attr_dev(div12, "class", "container");
    			add_location(div12, file$3, 82, 6, 2429);
    			attr_dev(section1, "class", "xs-section-padding bg-gray");
    			add_location(section1, file$3, 81, 4, 2377);
    			attr_dev(main, "class", "xs-main");
    			add_location(main, file$3, 79, 2, 2313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			append_dev(section1, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div4);
    			append_dev(div4, h21);
    			append_dev(h21, t5);
    			append_dev(div4, t6);
    			append_dev(div4, p1);
    			append_dev(div4, t8);
    			append_dev(div4, h5);
    			append_dev(h5, t9);
    			append_dev(h5, strong);
    			append_dev(strong, t10);
    			append_dev(strong, t11);
    			append_dev(h5, t12);
    			append_dev(div4, t13);
    			append_dev(div4, span0);
    			append_dev(div9, t14);
    			append_dev(div9, form);
    			append_dev(form, div5);
    			append_dev(div5, label0);
    			append_dev(label0, t15);
    			append_dev(label0, span1);
    			append_dev(div5, t17);
    			append_dev(div5, input0);
    			set_input_value(input0, /*amount*/ ctx[0]);
    			append_dev(form, t18);
    			append_dev(form, div6);
    			append_dev(div6, label1);
    			append_dev(label1, t19);
    			append_dev(label1, span2);
    			append_dev(div6, t21);
    			append_dev(div6, input1);
    			set_input_value(input1, /*name*/ ctx[2]);
    			append_dev(form, t22);
    			append_dev(form, div7);
    			append_dev(div7, label2);
    			append_dev(label2, t23);
    			append_dev(label2, span3);
    			append_dev(div7, t25);
    			append_dev(div7, input2);
    			set_input_value(input2, /*email*/ ctx[3]);
    			append_dev(form, t26);
    			append_dev(form, div8);
    			append_dev(div8, input3);
    			input3.checked = /*agree*/ ctx[4];
    			append_dev(div8, t27);
    			append_dev(div8, label3);
    			append_dev(label3, t28);
    			append_dev(label3, span4);
    			append_dev(form, t30);
    			append_dev(form, button);
    			append_dev(button, span5);
    			append_dev(span5, i);
    			append_dev(button, t31);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[10]),
    					listen_dev(form, "submit", prevent_default(/*handleForm*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$crowdfunding*/ 2 && t2_value !== (t2_value = /*$crowdfunding*/ ctx[1].title + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$crowdfunding*/ 2 && !src_url_equal(img.src, img_src_value = /*$crowdfunding*/ ctx[1].thumbnail)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$crowdfunding*/ 2 && t5_value !== (t5_value = /*$crowdfunding*/ ctx[1].title + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*contribute*/ 32) set_data_dev(t10, /*contribute*/ ctx[5]);

    			if (dirty & /*amount*/ 1 && input0.value !== /*amount*/ ctx[0]) {
    				set_input_value(input0, /*amount*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 4 && input1.value !== /*name*/ ctx[2]) {
    				set_input_value(input1, /*name*/ ctx[2]);
    			}

    			if (dirty & /*email*/ 8 && input2.value !== /*email*/ ctx[3]) {
    				set_input_value(input2, /*email*/ ctx[3]);
    			}

    			if (dirty & /*agree*/ 16) {
    				input3.checked = /*agree*/ ctx[4];
    			}

    			if (dirty & /*agree*/ 16 && button_disabled_value !== (button_disabled_value = !/*agree*/ ctx[4])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(66:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:0) {#if !$crowdfunding}
    function create_if_block(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(64:0) {#if !$crowdfunding}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let header;
    	let t0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$crowdfunding*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(t1.parentNode, t1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleButtonClick() {
    	console.log("Button click");
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $params;
    	let $crowdfunding;
    	validate_store(params, 'params');
    	component_subscribe($$self, params, $$value => $$invalidate(11, $params = $$value));
    	validate_store(crowdfunding, 'crowdfunding');
    	component_subscribe($$self, crowdfunding, $$value => $$invalidate(1, $crowdfunding = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Donation', slots, []);
    	let amount, name, email, agree = false, contribute = 0;
    	getCrowdfunding($params.id);

    	async function handleForm(event) {
    		$$invalidate(4, agree = false);
    		const newData = await getCrowdfunding($params.id);
    		newData.pledged = newData.pledged + parseInt(amount);

    		try {
    			const res = await fetch(`https://freeducation-api.herokuapp.com/crowdfundings/${$params.id}`, {
    				method: "PUT",
    				headers: { "content-type": "application/json" },
    				body: JSON.stringify(newData)
    			});

    			console.log(res);
    			page$1.redirect('/success');
    		} catch(err) {
    			console.log(err); // const resMid = await fetch(`/.netlify/functions/payment`, {
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Donation> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		amount = this.value;
    		$$invalidate(0, amount);
    	}

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate(2, name);
    	}

    	function input2_input_handler() {
    		email = this.value;
    		$$invalidate(3, email);
    	}

    	function input3_change_handler() {
    		agree = this.checked;
    		$$invalidate(4, agree);
    	}

    	$$self.$capture_state = () => ({
    		crowdfunding,
    		getCrowdfunding,
    		params,
    		router: page$1,
    		Header,
    		Footer,
    		Loader,
    		amount,
    		name,
    		email,
    		agree,
    		contribute,
    		handleButtonClick,
    		handleForm,
    		$params,
    		$crowdfunding
    	});

    	$$self.$inject_state = $$props => {
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('email' in $$props) $$invalidate(3, email = $$props.email);
    		if ('agree' in $$props) $$invalidate(4, agree = $$props.agree);
    		if ('contribute' in $$props) $$invalidate(5, contribute = $$props.contribute);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$crowdfunding, amount*/ 3) {
    			if ($crowdfunding) {
    				$$invalidate(5, contribute = Math.floor(parseInt(amount) / $crowdfunding.target * 100));
    			}
    		}
    	};

    	return [
    		amount,
    		$crowdfunding,
    		name,
    		email,
    		agree,
    		contribute,
    		handleForm,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_change_handler
    	];
    }

    class Donation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Donation",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\NotFound.svelte generated by Svelte v3.44.1 */

    const file$2 = "src\\pages\\NotFound.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let p;
    	let t4;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Oops!";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Ada sesuatu yang salah, kami tidak bisa menemukan halaman tersebut.";
    			t4 = space();
    			a = element("a");
    			a.textContent = "Kembali ke Beranda";
    			if (!src_url_equal(img.src, img_src_value = "/assets/images/page-not-found.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "300");
    			attr_dev(img, "height", "300");
    			add_location(img, file$2, 5, 10, 241);
    			attr_dev(h2, "class", "xs-title");
    			add_location(h2, file$2, 10, 10, 384);
    			add_location(p, file$2, 11, 10, 427);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-primary mt-4");
    			add_location(a, file$2, 12, 10, 513);
    			attr_dev(div0, "class", "col-md-6 col-xl-6");
    			add_location(div0, file$2, 4, 8, 198);
    			attr_dev(div1, "class", "xs-heading row xs-mb-60 justify-content-center text-center");
    			add_location(div1, file$2, 3, 6, 116);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$2, 2, 4, 85);
    			attr_dev(section, "class", "waypoint-tigger xs-section-padding svelte-1f37i6c");
    			add_location(section, file$2, 1, 0, 27);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(div0, t4);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\Success.svelte generated by Svelte v3.44.1 */

    const file$1 = "src\\pages\\Success.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let p;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let br2;
    	let t6;
    	let t7;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Wow! Anda Baik Sekali";
    			t2 = space();
    			p = element("p");
    			t3 = text("Donasi Anda telah berhasil ditransfer ke akun Freeducation dan kami akan segera menyalurkannya kepada yang terkait.\r\n                    ");
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = text("\r\n                    Anda akan mendapatkan email tentang detail donasi.\r\n                    ");
    			br2 = element("br");
    			t6 = text("\r\n                    Terima kasih.");
    			t7 = space();
    			a = element("a");
    			a.textContent = "Kembali ke Beranda";
    			if (!src_url_equal(img.src, img_src_value = "assets/images/success_donation.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "270");
    			attr_dev(img, "height", "270");
    			add_location(img, file$1, 10, 16, 296);
    			attr_dev(h2, "class", "xs-title");
    			add_location(h2, file$1, 11, 16, 392);
    			add_location(br0, file$1, 13, 20, 597);
    			add_location(br1, file$1, 14, 20, 623);
    			add_location(br2, file$1, 16, 20, 721);
    			add_location(p, file$1, 12, 16, 457);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-primary mt-4");
    			add_location(a, file$1, 19, 16, 800);
    			attr_dev(div0, "class", "col-md-6 col-xl-6");
    			add_location(div0, file$1, 9, 12, 247);
    			attr_dev(div1, "class", "xs-heading row xs-mb-60 justify-content-center text-center");
    			add_location(div1, file$1, 8, 8, 161);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$1, 7, 4, 128);
    			attr_dev(section, "id", "popularcause");
    			attr_dev(section, "class", "waypoint-tigger svelte-mcavus");
    			add_location(section, file$1, 6, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(p, br0);
    			append_dev(p, t4);
    			append_dev(p, br1);
    			append_dev(p, t5);
    			append_dev(p, br2);
    			append_dev(p, t6);
    			append_dev(div0, t7);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Success', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Success> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Success extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Success",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\Failure.svelte generated by Svelte v3.44.1 */

    const file = "src\\pages\\Failure.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let p;
    	let t4;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Oops!";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Ada yang salah dengan proses donasi, mohon coba sekali lagi";
    			t4 = space();
    			a = element("a");
    			a.textContent = "Coba Lagi";
    			if (!src_url_equal(img.src, img_src_value = "/assets/images/donation_error.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "300");
    			attr_dev(img, "height", "300");
    			add_location(img, file, 4, 8, 205);
    			attr_dev(h2, "class", "xs-title");
    			add_location(h2, file, 5, 8, 294);
    			add_location(p, file, 6, 8, 335);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-primary mt-4");
    			add_location(a, file, 7, 8, 411);
    			attr_dev(div0, "class", "col-md-6 col-xl-6");
    			add_location(div0, file, 3, 6, 164);
    			attr_dev(div1, "class", "xs-heading row xs-mb-60 justify-content-center text-center");
    			add_location(div1, file, 2, 4, 84);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file, 1, 2, 55);
    			attr_dev(section, "id", "popularcause");
    			attr_dev(section, "class", "waypoint-tigger svelte-178puis");
    			add_location(section, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(div0, t4);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Failure', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Failure> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Failure extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Failure",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */

    function create_fragment(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*$page*/ ctx[1];

    	function switch_props(ctx) {
    		return {
    			props: { ready: /*ready*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*ready*/ 1) switch_instance_changes.ready = /*ready*/ ctx[0];

    			if (switch_value !== (switch_value = /*$page*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $page;
    	let $params;
    	validate_store(page, 'page');
    	component_subscribe($$self, page, $$value => $$invalidate(1, $page = $$value));
    	validate_store(params, 'params');
    	component_subscribe($$self, params, $$value => $$invalidate(2, $params = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { ready } = $$props;
    	page$1("/", () => set_store_value(page, $page = Home, $page));
    	page$1("/about", () => set_store_value(page, $page = About, $page));
    	page$1("/contact", () => set_store_value(page, $page = Contact, $page));
    	page$1("/donation", () => set_store_value(page, $page = Donation, $page));
    	page$1("/success", () => set_store_value(page, $page = Success, $page));
    	page$1("/error", () => set_store_value(page, $page = Failure, $page));

    	page$1(
    		"/donation/:id",
    		(ctx, next) => {
    			set_store_value(params, $params = ctx.params, $params);
    			next();
    		},
    		() => set_store_value(page, $page = Donation, $page)
    	);

    	page$1("/*", () => set_store_value(page, $page = NotFound, $page));
    	page$1.start();
    	const writable_props = ['ready'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	$$self.$capture_state = () => ({
    		router: page$1,
    		page,
    		params,
    		Home,
    		About,
    		Contact,
    		Donation,
    		NotFound,
    		Success,
    		Failure,
    		ready,
    		$page,
    		$params
    	});

    	$$self.$inject_state = $$props => {
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ready, $page];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { ready: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ready*/ ctx[0] === undefined && !('ready' in props)) {
    			console.warn("<App> was created without expected prop 'ready'");
    		}
    	}

    	get ready() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ready(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.querySelector("#root")
    });

    window.initMap = function () {
    	app.$set({ ready: true });
    };

    return app;

})();
//# sourceMappingURL=bundle.js.map
