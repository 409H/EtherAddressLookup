// Native Javascript for Bootstrap 4 v2.0.19 | © dnp_theme | MIT-License
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD support:
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like:
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        var bsn = factory();
        root.ext_etheraddresslookup_Popover = bsn.ext_etheraddresslookup_Popover;
        root.ext_etheraddresslookup_Tab = bsn.ext_etheraddresslookup_Tab;
    }
}(this, function () {

    /* Native Javascript for Bootstrap 4 | Internal Utility Functions
     ----------------------------------------------------------------*/
    "use strict";

    // globals
    var globalObject = typeof global !== 'undefined' ? global : this||window,
        HTML = document.documentElement, DOC = document, body = 'body', // allow the library to be used in <head>

        // function toggle attributes
        dataToggle    = 'data-toggle',

        // components
        stringPopover   = 'ext_etheraddresslookup_Popover',
        stringTab       = 'ext_etheraddresslookup_Tab',

        // options DATA API
        dataHeight        = 'data-height',
        dataTitle         = 'data-title',
        dataDismissible   = 'data-dismissible',
        dataTrigger       = 'data-trigger',
        dataAnimation     = 'data-animation',
        dataContainer     = 'data-container',
        dataPlacement     = 'data-placement',
        dataDelay         = 'data-delay',

        // option keys
        backdrop = 'backdrop', keyboard = 'keyboard', delay = 'delay',
        content = 'content', target = 'target',
        interval = 'interval', pause = 'pause', animation = 'animation',
        placement = 'placement', container = 'container',

        // box model
        offsetTop    = 'offsetTop',      offsetBottom   = 'offsetBottom',
        offsetLeft   = 'offsetLeft',
        scrollTop    = 'scrollTop',      scrollLeft     = 'scrollLeft',
        clientWidth  = 'clientWidth',    clientHeight   = 'clientHeight',
        offsetWidth  = 'offsetWidth',    offsetHeight   = 'offsetHeight',
        innerWidth   = 'innerWidth',     innerHeight    = 'innerHeight',
        scrollHeight = 'scrollHeight',   height         = 'height',

        // event names
        clickEvent    = 'click',
        hoverEvent    = 'hover',
        resizeEvent   = 'resize',
        // originalEvents
        showEvent     = 'show',
        shownEvent    = 'shown',
        hideEvent     = 'hide',
        hiddenEvent   = 'hidden',

        // other
        getAttribute            = 'getAttribute',
        setAttribute            = 'setAttribute',
        hasAttribute            = 'hasAttribute',
        getElementsByTagName    = 'getElementsByTagName',
        preventDefault          = 'preventDefault',
        getBoundingClientRect   = 'getBoundingClientRect',
        querySelectorAll        = 'querySelectorAll',
        getElementsByCLASSNAME  = 'getElementsByClassName',

        indexOf      = 'indexOf',
        parentNode   = 'parentNode',
        length       = 'length',
        toLowerCase  = 'toLowerCase',
        Transition   = 'Transition',
        Webkit       = 'Webkit',
        style        = 'style',

        active     = 'active',
        showClass  = 'show',
        collapsing = 'collapsing',
        disabled   = 'disabled',
        loading    = 'loading',
        left       = 'left',
        right      = 'right',
        top        = 'top',
        bottom     = 'bottom',

        // tooltip / popover
        mouseHover = ('onmouseleave' in document) ? [ 'mouseenter', 'mouseleave'] : [ 'mouseover', 'mouseout' ],
        tipPositions = /\b(top|bottom|left|right)+/,

        // modal
        modalOverlay = 0,
        fixedTop = 'fixed-top',
        fixedBottom = 'fixed-bottom',

        // transitionEnd since 2.0.4
        supportTransitions = Webkit+Transition in HTML[style] || Transition[toLowerCase]() in HTML[style],
        transitionEndEvent = Webkit+Transition in HTML[style] ? Webkit[toLowerCase]()+Transition+'End' : Transition[toLowerCase]()+'end',

        // set new focus element since 2.0.3
        setFocus = function(element){
            element.focus ? element.focus() : element.setActive();
        },

        // class manipulation, since 2.0.0 requires polyfill.js
        addClass = function(element,classNAME) {
            element.classList.add(classNAME);
        },
        removeClass = function(element,classNAME) {
            element.classList.remove(classNAME);
        },
        hasClass = function(element,classNAME){ // since 2.0.0
            return element.classList.contains(classNAME);
        },

        // selection methods
        getElementsByClassName = function(element,classNAME) { // returns Array
            return [].slice.call(element[getElementsByCLASSNAME]( classNAME ));
        },
        queryElement = function (selector, parent) {
            var lookUp = parent ? parent : document;
            return typeof selector === 'object' ? selector : lookUp.querySelector(selector);
        },
        getClosest = function (element, selector) { //element is the element and selector is for the closest parent element to find
            // source http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
            var firstChar = selector.charAt(0);
            for ( ; element && element !== document; element = element[parentNode] ) {// Get closest match
                if ( firstChar === '.' ) {// If selector is a class
                    if ( queryElement(selector,element[parentNode]) !== null && hasClass(element,selector.replace('.','')) ) { return element; }
                } else if ( firstChar === '#' ) { // If selector is an ID
                    if ( element.id === selector.substr(1) ) { return element; }
                }
            }
            return false;
        },

        // event attach jQuery style / trigger  since 1.2.0
        on = function (element, event, handler) {
            element.addEventListener(event, handler, false);
        },
        off = function(element, event, handler) {
            element.removeEventListener(event, handler, false);
        },
        one = function (element, event, handler) { // one since 2.0.4
            on(element, event, function handlerWrapper(e){
                handler(e);
                off(element, event, handlerWrapper);
            });
        },
        emulateTransitionEnd = function(element,handler){ // emulateTransitionEnd since 2.0.4
            if (supportTransitions) { one(element, transitionEndEvent, function(e){ handler(e); }); }
            else { handler(); }
        },
        bootstrapCustomEvent = function (eventName, componentName, related) {
            var OriginalCustomEvent = new CustomEvent( eventName + '.bs.' + componentName);
            OriginalCustomEvent.relatedTarget = related;
            this.dispatchEvent(OriginalCustomEvent);
        },

        // Init DATA API
        initializeDataAPI = function( component, constructor, collection ){
            for (var i=0; i < collection[length]; i++) {
                new constructor(collection[i]);
            }
        },

        // tab / collapse stuff
        targetsReg = /^\#(.)+$/,

        // tooltip / popover stuff
        getScroll = function() { // also Affix and ScrollSpy uses it
            return {
                y : globalObject.pageYOffset || HTML[scrollTop],
                x : globalObject.pageXOffset || HTML[scrollLeft]
            }
        },
        styleTip = function(link,element,position,parent) { // both popovers and tooltips (target,tooltip,placement,elementToAppendTo)
            var elementDimensions = { w : element[offsetWidth], h: element[offsetHeight] },
                windowWidth = (HTML[clientWidth] || DOC[body][clientWidth]),
                windowHeight = (HTML[clientHeight] || DOC[body][clientHeight]),
                rect = link[getBoundingClientRect](),
                scroll = parent === DOC[body] ? getScroll() : { x: parent[offsetLeft] + parent[scrollLeft], y: parent[offsetTop] + parent[scrollTop] },
                linkDimensions = { w: rect[right] - rect[left], h: rect[bottom] - rect[top] },
                arrow = queryElement('.arrow',element),
                arrowWidth = arrow[offsetWidth], isPopover = hasClass(element,'popover'),
                topPosition, leftPosition, arrowTop, arrowLeft,

                halfTopExceed = rect[top] + linkDimensions.h/2 - elementDimensions.h/2 < 0,
                halfLeftExceed = rect[left] + linkDimensions.w/2 - elementDimensions.w/2 < 0,
                halfRightExceed = rect[left] + elementDimensions.w/2 + linkDimensions.w/2 >= windowWidth,
                halfBottomExceed = rect[top] + elementDimensions.h/2 + linkDimensions.h/2 >= windowHeight,
                topExceed = rect[top] - elementDimensions.h < 0,
                leftExceed = rect[left] - elementDimensions.w < 0,
                bottomExceed = rect[top] + elementDimensions.h + linkDimensions.h >= windowHeight,
                rightExceed = rect[left] + elementDimensions.w + linkDimensions.w >= windowWidth;

            // recompute position
            position = (position === left || position === right) && leftExceed && rightExceed ? top : position; // first, when both left and right limits are exceeded, we fall back to top|bottom
            position = position === top && topExceed ? bottom : position;
            position = position === bottom && bottomExceed ? top : position;
            position = position === left && leftExceed ? right : position;
            position = position === right && rightExceed ? left : position;

            // apply styling to tooltip or popover
            if ( position === left || position === right ) { // secondary|side positions
                if ( position === left ) { // LEFT
                    leftPosition = rect[left] + scroll.x - elementDimensions.w;
                } else if ( position === right ) { // RIGHT
                    leftPosition = rect[left] + scroll.x + linkDimensions.w;
                }

                // adjust top and arrow
                if (halfTopExceed) {
                    topPosition = rect[top] + scroll.y;
                    arrowTop = linkDimensions.h/2 - arrowWidth/2;
                } else if (halfBottomExceed) {
                    topPosition = rect[top] + scroll.y - elementDimensions.h + linkDimensions.h;
                    arrowTop = elementDimensions.h - linkDimensions.h/2 - arrowWidth/2;
                } else {
                    topPosition = rect[top] + scroll.y - elementDimensions.h/2 + linkDimensions.h/2;
                    arrowTop = elementDimensions.h/2 - arrowWidth/2;
                }
            } else if ( position === top || position === bottom ) { // primary|vertical positions
                if ( position === top) { // TOP
                    topPosition =  rect[top] + scroll.y - elementDimensions.h;
                } else if ( position === bottom ) { // BOTTOM
                    topPosition = rect[top] + scroll.y + linkDimensions.h;
                }
                // adjust left | right and also the arrow
                if (halfLeftExceed) {
                    leftPosition = 0;
                    arrowLeft = rect[left] + linkDimensions.w/2 - arrowWidth/2;
                } else if (halfRightExceed) {
                    leftPosition = windowWidth - elementDimensions.w*1.01;
                    arrowLeft = elementDimensions.w - ( windowWidth - rect[left] ) + linkDimensions.w/2 - arrowWidth/2;
                } else {
                    leftPosition = rect[left] + scroll.x - elementDimensions.w/2 + linkDimensions.w/2;
                    arrowLeft = elementDimensions.w/2 - arrowWidth/2;
                }
            }

            // fixing some CSS bug with Bootstrap 4 alpha
            topPosition = position === top && isPopover ? topPosition - arrowWidth : topPosition;
            leftPosition = position === left && isPopover ? leftPosition - arrowWidth : leftPosition;

            // apply style to tooltip/popover and it's arrow
            element[style][top] = topPosition + 'px';
            element[style][left] = leftPosition + 'px';

            arrowTop && (arrow[style][top] = arrowTop + 'px');
            arrowLeft && (arrow[style][left] = arrowLeft + 'px');

            element.className[indexOf](position) === -1 && (element.className = element.className.replace(tipPositions,position));
        };

    /* Native Javascript for Bootstrap 4 | Popover
     ----------------------------------------------*/

    // POPOVER DEFINITION
    // ==================
    var ext_etheraddresslookup_Popover = function( element, options ) {

        // initialization element
        element = queryElement(element);

        // DATA API
        var triggerData = element[getAttribute](dataTrigger), // click / hover / focus
            animationData = element[getAttribute](dataAnimation), // true / false
            placementData = element[getAttribute](dataPlacement),
            dismissibleData = element[getAttribute](dataDismissible),
            delayData = element[getAttribute](dataDelay),
            containerData = element[getAttribute](dataContainer),

            // internal strings
            component = 'ext-etheraddresslookup-popover',
            template = 'template',
            trigger = 'trigger',
            classString = 'class',
            div = 'div',
            fade = 'fade',
            content = 'content',
            dataContent = 'data-content',
            dismissible = 'dismissible',
            closeBtn = '<button type="button" class="close">×</button>',

            // maybe the element is inside a modal
            modal = getClosest(element,'.modal'),

            // maybe the element is inside a fixed navbar
            navbarFixedTop = getClosest(element,'.'+fixedTop),
            navbarFixedBottom = getClosest(element,'.'+fixedBottom);

        // set options
        options = options || {};
        this[template] = options[template] ? options[template] : null; // JavaScript only
        this[trigger] = options[trigger] ? options[trigger] : triggerData || hoverEvent;
        this[animation] = options[animation] && options[animation] !== fade ? options[animation] : animationData || fade;
        this[placement] = options[placement] ? options[placement] : placementData || top;
        this[delay] = parseInt(options[delay] || delayData) || 200;
        this[dismissible] = options[dismissible] || dismissibleData === 'true' ? true : false;
        this[container] = queryElement(options[container]) ? queryElement(options[container])
            : queryElement(containerData) ? queryElement(containerData)
            : navbarFixedTop ? navbarFixedTop
            : navbarFixedBottom ? navbarFixedBottom
            : modal ? modal : DOC[body];

        // bind, content
        var self = this,
            titleString = element[getAttribute](dataTitle) || null,
            contentString = element[getAttribute](dataContent) || null;

        if ( !contentString && !this[template] ) return; // invalidate

        // constants, vars
        var popover = null, timer = 0, placementSetting = this[placement],

            // handlers
            dismissibleHandler = function(e) {
                if (popover !== null && e[target] === queryElement('.close',popover)) {
                    self.hide();
                }
            },

            // private methods
            removePopover = function() {
                self[container].removeChild(popover);
                timer = null; popover = null;
            },
            createPopover = function() {
                titleString = element[getAttribute](dataTitle); // check content again
                contentString = element[getAttribute](dataContent);

                popover = document.createElement(div);

                // popover arrow
                var popoverArrow = document.createElement(div);
                popoverArrow[setAttribute](classString,'arrow');
                popover.appendChild(popoverArrow);

                if ( contentString !== null && self[template] === null ) { //create the popover from data attributes

                    popover[setAttribute]('role','tooltip');

                    if (titleString !== null) {
                        var popoverTitle = document.createElement('h3');
                        popoverTitle[setAttribute](classString,component+'-header');

                        popoverTitle.innerHTML = self[dismissible] ? titleString + closeBtn : titleString;
                        popover.appendChild(popoverTitle);
                    }

                    //set popover content
                    var popoverContent = document.createElement(div);
                    popoverContent[setAttribute](classString,component+'-body');
                    popoverContent.innerHTML = self[dismissible] && titleString === null ? contentString + closeBtn : contentString;
                    popover.appendChild(popoverContent);

                } else {  // or create the popover from template
                    var popoverTemplate = document.createElement(div);
                    popoverTemplate.innerHTML = self[template];
                    popover.innerHTML = popoverTemplate.firstChild.innerHTML;
                }

                //append to the container
                self[container].appendChild(popover);
                popover[style].display = 'block';
                popover[setAttribute](classString, component+ ' bs-' + component+'-'+placementSetting + ' ' + self[animation]);
            },
            showPopover = function () {
                !hasClass(popover,showClass) && ( addClass(popover,showClass) );
            },
            updatePopover = function() {
                styleTip(element,popover,placementSetting,self[container]);
            },

            // event toggle
            dismissHandlerToggle = function(type){
                if (/^(click|focus)$/.test(self[trigger])) {
                    !self[dismissible] && type( element, 'blur', self.hide );
                }
                self[dismissible] && type( document, clickEvent, dismissibleHandler );
                type( globalObject, resizeEvent, self.hide );
            },

            // triggers
            showTrigger = function() {
                dismissHandlerToggle(on);
                bootstrapCustomEvent.call(element, shownEvent, component);
            },
            hideTrigger = function() {
                dismissHandlerToggle(off);
                removePopover();
                bootstrapCustomEvent.call(element, hiddenEvent, component);
            };

        // public methods / handlers
        this.toggle = function() {
            if (popover === null) { self.show(); }
            else { self.hide(); }
        };
        this.show = function() {
            clearTimeout(timer);
            timer = setTimeout( function() {
                if (popover === null) {
                    placementSetting = self[placement]; // we reset placement in all cases
                    createPopover();
                    updatePopover();
                    showPopover();
                    bootstrapCustomEvent.call(element, showEvent, component);
                    !!self[animation] ? emulateTransitionEnd(popover, showTrigger) : showTrigger();
                }
            }, 20 );
        };
        this.hide = function() {
            clearTimeout(timer);
            timer = setTimeout( function() {
                if (popover && popover !== null && hasClass(popover,showClass)) {
                    bootstrapCustomEvent.call(element, hideEvent, component);
                    removeClass(popover,showClass);
                    !!self[animation] ? emulateTransitionEnd(popover, hideTrigger) : hideTrigger();
                }
            }, self[delay] );
        };

        // init
        if ( !(stringPopover in element) ) { // prevent adding event handlers twice
            if (self[trigger] === hoverEvent) {
                on( element, mouseHover[0], self.show );
                if (!self[dismissible]) { on( element, mouseHover[1], self.hide ); }
            } else if (/^(click|focus)$/.test(self[trigger])) {
                on( element, self[trigger], self.toggle );
            }
        }
        element[stringPopover] = self;
    };

    // POPOVER DATA API
    // ================
    initializeDataAPI(stringPopover, ext_etheraddresslookup_Popover, DOC[querySelectorAll]('['+dataToggle+'="ext-etheraddresslookup-popover"]'));


    /* Native Javascript for Bootstrap 4 | Tab
     -----------------------------------------*/

    // TAB DEFINITION
    // ==============
    var ext_etheraddresslookup_Tab = function( element, options ) {

        // initialization element
        element = queryElement(element);

        // DATA API
        var heightData = element[getAttribute](dataHeight),

            // strings
            component = 'ext-etheraddresslookup-tab',
            height = 'height', float = 'float', isAnimating = 'isAnimating';

        // set options
        options = options || {};
        this[height] = supportTransitions ? (options[height] || heightData === 'true') : false;

        // bind, event targets
        var self = this, next,
            tabs = getClosest(element,'.ext-etheraddresslookup-nav'),
            tabsContentContainer = false,
            dropdown = tabs && queryElement('.dropdown-toggle',tabs),
            activeTab, activeContent, nextContent, containerHeight, equalContents, nextHeight,

            // trigger
            triggerEnd = function(){
                tabsContentContainer[style][height] = '';
                removeClass(tabsContentContainer,collapsing);
                tabs[isAnimating] = false;
            },
            triggerShow = function() {
                if (tabsContentContainer) { // height animation
                    if ( equalContents ) {
                        triggerEnd();
                    } else {
                        setTimeout(function(){ // enables height animation
                            tabsContentContainer[style][height] = nextHeight + 'px'; // height animation
                            tabsContentContainer[offsetWidth];
                            emulateTransitionEnd(tabsContentContainer, triggerEnd);
                        },1);
                    }
                } else {
                    tabs[isAnimating] = false;
                }
                bootstrapCustomEvent.call(next, shownEvent, component, activeTab);
            },
            triggerHide = function() {
                if (tabsContentContainer) {
                    activeContent[style][float] = left;
                    nextContent[style][float] = left;
                    containerHeight = activeContent[scrollHeight];
                }

                addClass(nextContent,active);
                bootstrapCustomEvent.call(next, showEvent, component, activeTab);

                removeClass(activeContent,active);
                bootstrapCustomEvent.call(activeTab, hiddenEvent, component, next);

                if (tabsContentContainer) {
                    nextHeight = nextContent[scrollHeight];
                    equalContents = nextHeight === containerHeight;
                    addClass(tabsContentContainer,collapsing);
                    tabsContentContainer[style][height] = containerHeight + 'px'; // height animation
                    tabsContentContainer[offsetHeight];
                    activeContent[style][float] = '';
                    nextContent[style][float] = '';
                }

                if ( hasClass(nextContent, 'fade') ) {
                    setTimeout(function(){
                        addClass(nextContent,showClass);
                        emulateTransitionEnd(nextContent,triggerShow);
                    },20);
                } else { triggerShow(); }
            };

        if (!tabs) return; // invalidate

        // set default animation state
        tabs[isAnimating] = false;

        // private methods
        var getActiveTab = function() {
                var activeTabs = getElementsByClassName(tabs,active), activeTab;
                if ( activeTabs[length] === 1 && !hasClass(activeTabs[0][parentNode],'dropdown') ) {
                    activeTab = activeTabs[0];
                } else if ( activeTabs[length] > 1 ) {
                    activeTab = activeTabs[activeTabs[length]-1];
                }
                return activeTab;
            },
            getActiveContent = function() {
                return queryElement(getActiveTab()[getAttribute]('href'));
            },
            // handler
            clickHandler = function(e) {
                e[preventDefault]();
                next = e[target][getAttribute](dataToggle) === component || targetsReg.test(e[target][getAttribute]('href'))
                    ? e[target] : e[target][parentNode]; // allow for child elements like icons to use the handler
                !tabs[isAnimating] && !hasClass(next,active) && self.show();
            };

        // public method
        this.show = function() { // the tab we clicked is now the next tab
            next = next || element;
            nextContent = queryElement(next[getAttribute]('href')); //this is the actual object, the next tab content to activate
            activeTab = getActiveTab();
            activeContent = getActiveContent();

            tabs[isAnimating] = true;
            removeClass(activeTab,active);
            addClass(next,active);

            if ( dropdown ) {
                if ( !hasClass(element[parentNode],'dropdown-menu') ) {
                    if (hasClass(dropdown,active)) removeClass(dropdown,active);
                } else {
                    if (!hasClass(dropdown,active)) addClass(dropdown,active);
                }
            }

            bootstrapCustomEvent.call(activeTab, hideEvent, component, next);

            if (hasClass(activeContent, 'fade')) {
                removeClass(activeContent,showClass);
                emulateTransitionEnd(activeContent, triggerHide);
            } else { triggerHide(); }
        };

        // init
        if ( !(stringTab in element) ) { // prevent adding event handlers twice
            on(element, clickEvent, clickHandler);
        }
        if (this[height]) { tabsContentContainer = getActiveContent()[parentNode]; }
        element[stringTab] = this;
    };

    // TAB DATA API
    // ============
    initializeDataAPI(stringTab, ext_etheraddresslookup_Tab, DOC[querySelectorAll]('['+dataToggle+'="ext-etheraddresslookup-tab"]'));

    return {
        ext_etheraddresslookup_Popover: ext_etheraddresslookup_Popover,
        ext_etheraddresslookup_Tab: ext_etheraddresslookup_Tab
    };
}));
