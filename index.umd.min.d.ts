/*
* Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
*
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the documentation
*    and/or other materials provided with the distribution.
*
* 3. Neither the name of the copyright holder nor the names of its
*    contributors may be used to endorse or promote products derived from
*    this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import { CorePlugin, CommonEventProperties, SelfDescribingJson, TrackerCore, CorePluginConfiguration, clickElementEvent } from "@convivainc/tracker-core";
declare global {
    interface Document {
        attachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
        detachEvent: (type: string, fn: EventListenerOrEventListenerObject) => void;
    }
}
/**
 * A set of variables which are shared among all initialised trackers
 */
declare class SharedState {
    /* List of request queues - one per Tracker instance */
    outQueues: Array<unknown>;
    bufferFlushers: Array<(sync: boolean) => void>;
    /* DOM Ready */
    hasLoaded: boolean;
    registeredOnLoadHandlers: Array<() => void>;
    /* pageViewId, which can changed by other trackers on page;
    * initialized by tracker sent first event */
    pageViewId?: string;
}
declare function createSharedState(): SharedState;
/**
 * Interface which defines Core Plugins
 */
interface BrowserPlugin extends CorePlugin {
    /**
     * Called when the plugin is initialised during the Tracker construction
     *
     * @remarks
     * Use to capture the specific Tracker instance for each instance of a Browser Plugin
     */
    activateBrowserPlugin?: (tracker: BrowserTracker) => void;
}
type RequireAtLeastOne<T> = {
    [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];
// type valueof<T> = T[keyof T];
/* Available built-in contexts */
type BuiltInContexts = RequireAtLeastOne<{
    /* Toggles the web_page context */
    webPage: boolean;
    /* Toggles the session context */
    session: boolean;
    /* Toggles the performanceTiming context */
    performanceTiming: boolean;
}> | Record<string, never>;
/* Configuration for Anonymous Tracking */
type AnonymousTrackingOptions = boolean | {
    withSessionTracking?: boolean;
    withServerAnonymisation?: boolean;
};
/* Available configurations for different storage strategies */
type StateStorageStrategy = "cookieAndLocalStorage" | "cookie" | "localStorage" | "none";
/* The supported platform values */
type Platform = "web" | "mob" | "pc" | "srv" | "app" | "tv" | "cnsl" | "iot";
/* The supported Cookie SameSite values */
type CookieSameSite = "None" | "Lax" | "Strict";
/* The supported methods which events can be sent with */
type EventMethod = "post" | "get" | "beacon";
/* Conviva Configurations */
type TraceparentGenerationConfig = {
    enabled?: boolean | true;
    force?: boolean | false;
    targetUrl?: String[] | [
    ];
};
type metaTagsTrackingConfig = {
    enabled?: boolean | true;
    preference?: number;
    force?: boolean;
    tags: any;
};
type networkRequestTrackingConfig = {
    safelist?: String[] | [
    ];
};
type networkConfig = {
    mergeEndpoint?: boolean;
    encoding?: string;
};
type ConvivaTrackerConfiguration = {
    traceparentGeneration?: TraceparentGenerationConfig;
    metaTagsTracking?: metaTagsTrackingConfig;
    networkRequestTracking?: networkRequestTrackingConfig;
    network?: networkConfig;
    /**
     * Field value to control saving and using clId in cookies
     */
    enableClIdInCookies?: boolean;
};
/**
 * Possible types of Device Metadata.
 * @static
 * @constant
 * @memberOf Constants
 * @enum {string}
 */
declare enum DeviceMetadata {
    /**  Brand of the device. </br>
     * Ex: "iPhone", "Samsung SmartTV" */
    BRAND = "DeviceBrand",
    /**  Manufacturer of the device. </br>
     *Ex: "Samsung", "Apple" */
    MANUFACTURER = "DeviceManufacturer",
    /**  Model of the device. </br>
     * Ex: "iPhone 6 Plus", "HTC One", "Roku 3", "Samsung SmartTV 2015" */
    MODEL = "DeviceModel",
    /**  Brand of the device. </br>
     * Ex: "iPhone", "Samsung SmartTV" */
    TYPE = "DeviceType",
    /**  Type of the device. </br>
     * Only allows the {@link Constants.DeviceType} values and discards any other string values.</br>
     * Please get in touch with Conviva, if the Device Type you are looking for is not listed. */
    VERSION = "DeviceVersion",
    /**  Name of the operating system used by the device, in uppercase.</br>
     * Ex: "WINDOWS", "LINUX", "IOS", "MAC", ANDROID", "FIREOS", "ROKU", "PLAYSTATION", "CHROMEOS". */
    OS_NAME = "OperatingSystemName",
    /**  Version of the operating system used by the device.</br>
     * Ex: "10.10.1", "8.1", "T-INFOLINK2012-1012", "Fire OS 5" */
    OS_VERSION = "OperatingSystemVersion",
    /**  Device Category to which the used device belongs to. <br>
     * Only allows the {@link Constants.DeviceCategory} values and discards any other string values.<br>
     * Please get in touch with Conviva, if the Device Category you are looking for is not listed. */
    CATEGORY = "DeviceCategory",
    /** Application Frameowrk name */
    FRAMEWORK_NAME = "FrameworkName",
    /** Application Frameowrk Version */
    FRAMEWORK_VERSION = "FrameworkVersion"
}
declare const DeviceMetadataConstants: {
    readonly DeviceType: {
        readonly CONSOLE: "Console";
        readonly DESKTOP: "DESKTOP";
        readonly MOBILE: "Mobile";
        readonly SETTOP: "Settop";
        readonly SMARTTV: "SmartTV";
        readonly TABLET: "Tablet";
        readonly VEHICLE: "Vehicle";
        readonly OTHER: "Other";
    };
    readonly DeviceCategory: {
        readonly ANDROID_DEVICE: "AND";
        readonly APPLE_DEVICE: "APL";
        readonly CHROMECAST: "CHR";
        readonly DESKTOP_APP: "DSKAPP";
        readonly DEVICE_SIMULATOR: "SIMULATOR";
        readonly KAIOS_DEVICE: "KAIOS";
        readonly LG_TV: "LGTV";
        readonly LINUX: "LNX";
        readonly NINTENDO: "NINTENDO";
        readonly PLAYSTATION: "PS";
        readonly ROKU: "RK";
        readonly SAMSUNG_TV: "SAMSUNGTV";
        readonly VIDAA_DEVICE: "VIDAA";
        readonly VIZIO_TV: "VIZIOTV";
        readonly WEB: "WEB";
        readonly WINDOWS_DEVICE: "WIN";
        readonly XBOX: "XB";
    };
};
interface ConvivaDeviceMetadata {
    [DeviceMetadata.BRAND]?: string;
    [DeviceMetadata.MANUFACTURER]?: string;
    [DeviceMetadata.MODEL]?: string;
    [DeviceMetadata.TYPE]?: typeof DeviceMetadataConstants.DeviceType[keyof typeof DeviceMetadataConstants.DeviceType];
    [DeviceMetadata.VERSION]?: string;
    [DeviceMetadata.OS_NAME]?: string;
    [DeviceMetadata.OS_VERSION]?: string;
    [DeviceMetadata.CATEGORY]: typeof DeviceMetadataConstants.DeviceCategory[keyof typeof DeviceMetadataConstants.DeviceCategory];
    [DeviceMetadata.FRAMEWORK_NAME]?: string;
    [DeviceMetadata.FRAMEWORK_VERSION]?: string;
}
declare namespace ConvivaConstants {
    const TRACEPARENT_HEADER_KEY = "traceparent";
    const BAGGAGE_HEADER_KEY = "baggage";
    enum SAMPLING_MODES {
        NONE = "NONE",
        RCFG = "RCFG"
    }
    enum SAMPLING_STATUS {
        DERIVED = "DERIVED",
        DEFAULT = "DEFAULT"
    }
    enum SAMPLING_ACTION {
        SAMPLED = "sl",
        NON_SAMPLED = "nsl"
    }
    const DEFAULT_SAMPLING_ACTION: {
        sl: SAMPLING_MODES;
        nsl: SAMPLING_MODES;
    };
    enum CONFIG_SOURCE {
        DEFAULT = "def",
        CACHED = "cac",
        REMOTE = "rem"
    }
    enum CONFIG_PREFERENCES {
        APP = 0,
        REMOTE = 1,
        MERGE = 2
    }
    enum PERFORMANCE_CONTEXT {
        DISABLED = 0,
        PERFORMANCE_TIMING = 1,
        PERFORMANCE_NAVIGATION_TIMING = 2
    }
    enum RC_FETCH_MODE {
        DO_NOT_FETCH_UPDATE_TIMER = "updateTimer",
        IMMEDIATE_FETCH = "urgentFetch",
        UPDATE_TIMER_WITH_DIFF = "checkDiff"
    }
    const REMOTE_CONFIG_STORAGE_KEY = "ConvivaRemoteConfig";
    const END_POINT_STORAGE_KEY = "ConvivaEndpoint";
    const DEFAULT_END_POINT = "https://appgw.conviva.com";
    const REMOTE_CONFIG_URL_PREFIX = "https://rc.conviva.com/js/";
    const REMOTE_CONFIG_FILE_NAME = "/remote_config.json";
    const SAMPLING_STORAGE_RANDOM_NUMBER_KEY = "ConvivaSamplingRandomNumber";
    const VISUAL_LABELLING_CONFIG = "ConvivaVisualLabellingConfig";
    const SESSION_RECORDING_STARTED = "ConvivaSessionRecordingStarted";
    const DIAGNOSTIC_INFO_MAX_LENGTH: {
        MAX_MESSAGE_LENGTH: number;
        MAX_STACK_LENGTH: number;
        MAX_CLASSNAME_LENGTH: number;
        MAX_EXCEPTION_NAME_LENGTH: number;
    };
    const CLICK_KEY_MAX_LENGTH = 1024;
    const CLICK_DEBOUNCING_DELAY = 300;
    const CLICK_MAX_DEPTH = 16;
    const MAX_NATIVE_SCAN = 16;
    const MAX_NATIVE_SCAN_LEGACY = 8;
    const PAGE_URL_QUERY_PARAMS = "pgq";
    const V2A_CUSTOM_EVENTS: readonly [
        "c3.video.custom_event",
        "c3.sdk.custom_event",
        "c3.ad.custom_event"
    ];
}
/**
 * The configuration object for initialising the tracker
 * @example
 * ```
 * newTracker('sp1', 'collector.my-website.com', {
 *  appId: 'my-app-id',
 *  platform: 'web',
 *  plugins: [ PerformanceTimingPlugin(), AdTrackingPlugin() ],
 *  stateStorageStrategy: 'cookieAndLocalStorage'
 * });
 * ```
 */
type TrackerConfiguration = {
    /**
     * Should event properties be base64 encoded where supported
     * @defaultValue true
     */
    encodeBase64?: boolean;
    /**
     * The domain all cookies will be set on
     * @defaultValue The current domain
     */
    cookieDomain?: string;
    /**
     * The name of the _cnv_.id cookie, will rename the _cnv_ section
     * @defaultValue _cnv_
     */
    cookieName?: string;
    /**
     * The SameSite value for the cookie
     * {@link https://snowplowanalytics.com/blog/2020/09/07/pipeline-configuration-for-complete-and-accurate-data/}
     * @defaultValue None
     */
    cookieSameSite?: CookieSameSite;
    /**
     * Set the Secure flag on the cookie
     * @defaultValue true
     */
    cookieSecure?: boolean;
    /**
     * How long the cookie will be set for
     * @defaultValue 63072000 (2 years)
     */
    cookieLifetime?: number;
    /**
     * Sets the value of the withCredentials flag
     * on XMLHttpRequest (GET and POST) requests
     * @defaultValue true
     */
    withCredentials?: boolean;
    /**
     * How long until a session expires
     * @defaultValue 1800 (30 minutes)
     */
    sessionCookieTimeout?: number;
    /** The convivaCustomerKey to send with each event */
    convivaCustomerKey?: string;
    /** The app id to send with each event */
    appId?: string;
    /**
     * The platform the event is being sent from
     * @defaultValue web
     */
    platform?: Platform;
    /**
     * Whether the doNotTracK flag should be respected
     * @defaultValue false
     */
    respectDoNotTrack?: boolean;
    /**
     * The preferred technique to use to send events
     * @defaultValue post
     */
    eventMethod?: EventMethod;
    /**
     * The post path which events will be sent to
     * Ensure your collector is configured to accept events on this post path
     * @defaultValue '/com.snowplowanalytics.snowplow/tp2'
     */
    postPath?: string;
    /**
     * Should the Sent Timestamp be attached to events
     * @defaultValue true
     */
    useStm?: boolean;
    /**
     * The amount of events that should be buffered before sending
     * Recommended to leave as 1 to reduce change of losing events
     * No.of events to collect before sending POST request
     * @defaultValue 1
     */
    bufferSize?: number;
    /**
     * Configure the cross domain linker which will add user identifiers to
     * links on the callback
     */
    crossDomainLinker?: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean;
    /**
     * The max size a GET request (its complete URL) can be. Requests over this size will be tried as a POST request.
     * @defaultValue unlimited
     */
    maxGetBytes?: number;
    /**
     * Whether the tracker should attempt to figure out what the root
     * domain is to store cookies on
     *
     * This sets cookies to try to determine the root domain, and some cookies may
     * fail to save. This is expected behavior.
     * @defaultValue false
     */
    discoverRootDomain?: boolean;
    /**
     * The storage strategy which the tracker will use for storing user and session identifiers
     * and if local storage is allowed for buffering the events
     * @defaultValue cookieAndLocalStorage
     */
    stateStorageStrategy?: StateStorageStrategy;
    /**
     * The maximum amount of events that will be buffered in local storage
     *
     * This is useful to ensure the Tracker doesn't fill the 5MB or 10MB available to
     * each website should the collector be unavailable due to lost connectivity.
     * Will drop events once the limit is hit
     * @defaultValue 1000
     */
    maxLocalStorageQueueSize?: number;
    /**
     * Whether to reset the Activity Tracking counters on a new page view.
     * Disabling this leads to legacy behavior due to a "bug".
     * Recommended to leave enabled, particularly on SPAs.
     * @defaultValue true
     */
    resetActivityTrackingOnPageView?: boolean;
    /**
     * How long to wait before aborting requests to the collector
     * @defaultValue 5000 (milliseconds)
     */
    connectionTimeout?: number;
    /**
     * Configuration for Anonymous Tracking
     * @defaultValue false
     */
    anonymousTracking?: AnonymousTrackingOptions;
    /**
     * Use to configure built in contexts
     * @defaultValue `{ webPage: true, session: false }`
     */
    contexts?: BuiltInContexts;
    /**
     * Inject plugins which will be evaluated for each event
     * @defaultValue []
     */
    plugins?: Array<BrowserPlugin>;
    /**
     * An object of key value pairs which represent headers to
     * attach when sending a POST request, only works for POST
     * @defaultValue `{}`
     */
    customHeaders?: Record<string, string>;
    /**
     * Endpoint URL
     * @defaultValue - https://appgw.conviva.com
     */
    gatewayUrl?: string;
    /**
     * Conviva configuration URL
     * @defaultValue - TBD
     */
    convivaConfigUrl?: string;
    linkClickTracking?: boolean;
    buttonClickTracking?: boolean;
    lifecycleAutotracking?: boolean;
    customEvent?: boolean;
    exceptionAutotracking?: boolean;
    trackerConfigUrl?: string;
    configs?: ConvivaTrackerConfiguration;
    appVersion?: string;
    /**
     * Possible types of Device Metadata.
     */
    deviceMetadata?: ConvivaDeviceMetadata;
    trackerVersionSuffix?: string;
    /**
     * Only for rerouting the traffic to a specific url
     */
    proxyGatewayUrl?: string;
    /**
     * Field value to control the common events for shopify pixel
     */
    enableCommonEvents?: boolean;
};
/**
 * The data which is passed to the Activity Tracking callback
 */
type ActivityCallbackData = {
    /**
     * All context for the activity tracking
     * Often generated by the page view events context callback
     */
    context: Array<SelfDescribingJson>;
    /** The current page view id */
    pageViewId: string;
    /** The minimum X scroll position for the current page view */
    minXOffset: number;
    /** The maximum X scroll position for the current page view */
    minYOffset: number;
    /** The minimum Y scroll position for the current page view */
    maxXOffset: number;
    /** The maximum Y scroll position for the current page view */
    maxYOffset: number;
};
/** The callback for enableActivityTrackingCallback */
type ActivityCallback = (data: ActivityCallbackData) => void;
/**
 * The base configuration for activity tracking
 */
interface ActivityTrackingConfiguration {
    /** The minimum time that must have elapsed before first heartbeat */
    minimumVisitLength: number;
    /** The interval at which the callback will be fired */
    heartbeatDelay: number;
}
/**
 * The callback for enableActivityTrackingCallback
 */
interface ActivityTrackingConfigurationCallback {
    /** The callback to fire based on heart beat */
    callback: ActivityCallback;
}
/**
 * A Page View event
 * Used for tracking a page view
 */
interface PageViewEvent {
    /** Override the page title */
    title?: string | null;
    /** A callback which will fire on the page view and each subsequent activity tracking event for this page view */
    contextCallback?: (() => Array<SelfDescribingJson>) | null;
}
/**
 * A Custom event
 * Used for tracking a custom event
 */
interface CustomEvent {
    /** Override the page title */
    name: string | null;
    /** The custom event data */
    data: any;
    /** A callback which will fire on the page view and each subsequent activity tracking event for this page view */
    contextCallback?: (() => Array<SelfDescribingJson>) | null;
}
/**
 * The configuration that can be changed when disabling anonymous tracking
 */
interface DisableAnonymousTrackingConfiguration {
    /* Available configurations for different storage strategies */
    stateStorageStrategy?: StateStorageStrategy;
}
/**
 * The configuration that can be changed when enabling anonymous tracking
 */
interface EnableAnonymousTrackingConfiguration {
    /* Configuration for Anonymous Tracking */
    options?: AnonymousTrackingOptions;
    /* Available configurations for different storage strategies */
    stateStorageStrategy?: StateStorageStrategy;
}
/**
 * The configuration that can be changed when enabling anonymous tracking
 */
interface ClearUserDataConfiguration {
    /* Store session information in memory for subsequent events */
    preserveSession: boolean;
    /* Store user information in memory for subsequent events */
    preserveUser: boolean;
}
/**
 * The configuration that can be changed when flushing the buffer
 */
interface FlushBufferConfiguration {
    /* The size of the buffer after this flush */
    newBufferSize?: number;
}
/**
 * The configuration of the plugin to add
 */
interface BrowserPluginConfiguration extends CorePluginConfiguration {
    /* The plugin to add */
    plugin: BrowserPlugin;
}
/**
 * Event for tracking an error
 */
interface ErrorEventProperties {
    /** The error message */
    message: string;
    /** The filename where the error occurred */
    filename?: string;
    /** The line number which the error occurred on */
    lineno?: number;
    /** The column number which the error occurred on */
    colno?: number;
    /** The error object */
    error?: Error;
}
/**
 * The Browser Tracker
 */
interface BrowserTracker {
    /** The unique identifier of this tracker */
    id: string;
    /** The tracker namespace */
    namespace: string;
    /** The instance of the core library which this tracker has initialised */
    core: TrackerCore;
    /** The instance of shared state this tracker is using */
    sharedState: SharedState;
    /**
     * Get the domain session index also known as current memorized visit count.
     *
     * @returns Domain session index
     */
    getDomainSessionIndex: () => void;
    /**
     * Get the current page view ID
     *
     * @returns Page view ID
     */
    getPageViewId: () => void;
    /**
     * Get the cookie name as cookieNamePrefix + basename + . + domain.
     *
     * @returns Cookie name
     */
    getCookieName: (basename: string) => void;
    /**
     * Get the current user ID (as set previously with setUserId()).
     *
     * @returns Business-defined user ID
     */
    getUserId: () => void;
    /**
     * Get visitor ID (from first party cookie)
     *
     * @returns Visitor ID (or null, if not yet known)
     */
    getDomainUserId: () => void;
    /**
     * Get the visitor information (from first party cookie)
     *
     * @returns The domain user information array
     */
    getDomainUserInfo: () => void;
    /**
     * Override referrer
     *
     * @param url - the custom referrer
     */
    setReferrerUrl: (url: string) => void;
    /**
     * Override url
     *
     * @param url - The custom url
     */
    setCustomUrl: (url: string) => void;
    /**
     * Override document.title
     *
     * @param title - The document title
     */
    setDocumentTitle: (title: string) => void;
    /**
     * Strip hash tag (or anchor) from URL
     *
     * @param enableFilter - whether to enable this feature
     */
    discardHashTag: (enableFilter: boolean) => void;
    /**
     * Strip braces from URL
     *
     * @param enableFilter - whether to enable this feature
     */
    discardBrace: (enableFilter: boolean) => void;
    /**
     * Set first-party cookie path
     *
     * @param path - The path for cookies
     */
    setCookiePath: (path: string) => void;
    /**
     * Set visitor cookie timeout (in seconds)
     *
     * @param timeout - The timeout for the user identifier cookie
     */
    setVisitorCookieTimeout: (timeout: number) => void;
    /**
     * Expires current session and starts a new session.
     */
    newSession: () => void;
    /**
     * Enable querystring decoration for links passing a filter
     *
     * @param crossDomainLinkerCriterion - Function used to determine which links to decorate
     */
    crossDomainLinker: (crossDomainLinkerCriterion: (elt: HTMLAnchorElement | HTMLAreaElement) => boolean) => void;
    /**
     * Enables page activity tracking (sends page
     * pings to the Collector regularly).
     *
     * @param configuration - The activity tracking configuration
     */
    enableActivityTracking: (configuration: ActivityTrackingConfiguration) => void;
    /**
     * Enables page activity tracking (replaces collector ping with callback).
     *
     * @param configuration - The activity tracking configuration
     */
    enableActivityTrackingCallback: (configuration: ActivityTrackingConfiguration & ActivityTrackingConfigurationCallback) => void;
    /**
     * Triggers the activityHandler manually to allow external user defined
     * activity. i.e. While watching a video
     */
    updatePageActivity: () => void;
    /**
     * Sets the opt out cookie.
     *
     * @param name - of the opt out cookie
     */
    setOptOutCookie: (name?: string | null) => void;
    /**
     * Set the business-defined user ID for this user.
     *
     * @param userId - The business-defined user ID
     */
    setUserId: (userId?: string | null) => void;
    /**
     * Set conversation ID for baggage headers.
     *
     * @param conversationId - The conversation ID string
     */
    setConversationId: (conversationId: string) => void;
    /**
     * Set the business-defined user ID for this user using the location querystring.
     *
     * @param querystringField - Name of a querystring name-value pair
     */
    setUserIdFromLocation: (querystringField: string) => void;
    /**
     * Set the business-defined user ID for this user using the referrer querystring.
     *
     * @param querystringField - Name of a querystring name-value pair
     */
    setUserIdFromReferrer: (querystringField: string) => void;
    /**
     * Set the business-defined user ID for this user to the value of a cookie.
     *
     * @param cookieName - Name of the cookie whose value will be assigned to businessUserId
     */
    setUserIdFromCookie: (cookieName: string) => void;
    /**
     * Specify the Conviva collector URL. Specific http or https to force it
     * or leave it off to match the website protocol.
     *
     * @param collectorUrl - The collector URL, with or without protocol
     */
    setCollectorUrl: (collectorUrl: string) => void;
    /**
     * Alter buffer size
     * Can be useful if you want to stop batching requests to ensure events start
     * sending closer to event creation
     *
     * @param newBufferSize - The new buffer size that will be used for all future tracking
     */
    setBufferSize: (newBufferSize: number) => void;
    /**
     * Send all events in the outQueue
     * Only need to use this when sending events with a bufferSize of at least 2
     *
     * @param configuration - The configuration to use following flushing the buffer
     */
    flushBuffer: (configuration?: FlushBufferConfiguration) => void;
    /**
     * Stop regenerating `pageViewId` (available from `web_page` context)
     */
    preservePageViewId: () => void;
    /**
     * Log visit to this page
     *
     * @param event - The Page View Event properties
     */
    trackPageView: (event?: PageViewEvent & CommonEventProperties) => void;
    /**
     * Start page ping
     *
     * @param event - The Page Ping Event properties
     */
    trackPagePing: (event?: PageViewEvent & CommonEventProperties) => void;
    /**
     * Set page meta tags as custom tags
     */
    setPageMetaTagsAsCustomTags: () => void;
    /**
     * Set Custom Tags context
     *
     * @param event - CustomTags as JSON object
     */
    setCustomTags: (event?: any) => void;
    unsetCustomTags: (event?: any) => void;
    trackVideoEvent: (event?: any) => void;
    /**
     * Log custom event
     *
     * @param event - The Custom Event properties
     */
    trackCustomEvent: (event?: CustomEvent & CommonEventProperties) => void;
    /**
     * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
     * For stateStorageStrategy override, uses supplied value first,
     * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
     *
     * @param configuration - The configuration to use following disabling anonymous tracking
     */
    disableAnonymousTracking: (configuration?: DisableAnonymousTrackingConfiguration) => void;
    /**
     * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
     *
     * @param configuration - The configuration to use following activating anonymous tracking
     */
    enableAnonymousTracking: (configuration?: EnableAnonymousTrackingConfiguration) => void;
    /**
     * Clears all cookies and local storage containing user and session identifiers
     */
    clearUserData: (configuration?: ClearUserDataConfiguration) => void;
    /**
     * Add a plugin into the plugin collection after Tracker has already been initialised
     * @param configuration - The plugin to add
     */
    addPlugin: (configuration: BrowserPluginConfiguration) => void;
    /**
     * set if app has to keepAlive in Background
     *
     * @param isAlive - boolena to keep session active in background
     * @param trackers - The tracker identifiers which the plugin will be added to
     */
    setKeepAliveInBG: (isAlive: boolean) => void;
    /**
     * Clear All outstanding timers as part of cleanup process
     *
     */
    clearTimers: () => void;
    /**
     * Returns Sampling mode
     *
     */
    getSamplingMode: () => string;
    trackButtonClick: (event: clickElementEvent & CommonEventProperties) => void;
    trackLinkClick: (event: clickElementEvent & CommonEventProperties) => void;
    trackErrorEvent: (event: ErrorEventProperties & CommonEventProperties) => void;
    getPageViewSent: () => boolean;
}
/**
 * Rich content inference condition for pattern matching in SSE data
 */
interface RichContentInferenceCondition {
    /** The type of content to detect (e.g., 'TEXT', 'IMG', 'URL') */
    type: string;
    /** The key in the data to search (e.g., 'query', 'responseText') */
    key: string;
    /** The operation to perform (e.g., 'contains') */
    op: string;
    /** Array of values to match against */
    val: string[];
}
/**
 * Rich content inference configuration
 */
interface RichContentInferenceConfig {
    /** Array of conditions for pattern matching */
    cond: RichContentInferenceCondition[];
}
/**
 * Rich content inference results - maps content type to detected patterns
 */
interface RichContentInferenceResults {
    [contentType: string]: {
        [pattern: string]: boolean;
    };
}
/**
 * Dispatch function to all specified trackers
 *
 * @param trackers - An optional list of trackers to send the event to, or will send to all trackers
 * @param fn - The function which will run against each tracker
 */
declare function dispatchToTrackers(trackers: Array<string> | undefined, fn: (t: BrowserTracker) => void): void;
/**
 * Dispatch function to all specified trackers from the supplied collection
 *
 * @param trackers - An optional list of trackers to send the event to, or will send to all trackers
 * @param trackerCollection - The collection which the trackers will be selected from
 * @param fn - The function which will run against each tracker
 */
declare function dispatchToTrackersInCollection(trackers: Array<string> | undefined, trackerCollection: Record<string, BrowserTracker>, fn: (t: BrowserTracker) => void): void;
/**
 * Checks if a tracker has been created for a particular identifier
 * @param trackerId - The unique identifier of the tracker
 */
declare function trackerExists(trackerId: string): boolean;
/**
 * Creates a Tracker and adds it to the internal collection
 * @param trackerId - The unique identifier of the tracker
 * @param namespace - The namespace of the tracker, tracked with each event as `tna`
 * @param version - The current version of the tracker library
 * @param endpoint - The endpoint to send events to
 * @param sharedState - The instance of shared state to use for this tracker
 * @param configuration - The configuration to use for this tracker instance
 */
declare function addTracker(trackerId: string, namespace: string, version: string, sharedState: SharedState, configuration?: TrackerConfiguration): BrowserTracker | null;
/**
 * Gets a single instance of the internal tracker object
 * @param trackerId - The unique identifier of the tracker
 * @returns The tracker instance, or null if not found
 */
declare function getTracker(trackerId: string): BrowserTracker | null;
/**
 * Gets an array of tracker instances based on the list of identifiers
 * @param trackerIds - An array of unique identifiers of the trackers
 * @returns The tracker instances, or empty list if none found
 */
declare function getTrackers(trackerIds: Array<string>): Array<BrowserTracker>;
/**
 * Gets all the trackers as a object, keyed by their unique identifiers
 */
declare function allTrackers(): Record<string, BrowserTracker>;
/**
 * Returns all the unique tracker identifiers
 */
declare function allTrackerNames(): string[];
declare function removeTrackers(trackerIds: Array<string> | undefined): void;
declare global {
    interface EventTarget {
        attachEvent?: (type: string, fn: EventListenerOrEventListenerObject) => void;
    }
}
/**
 * The criteria which will be used to filter results to specific classes or elements
 */
interface FilterCriterion<T> {
    /** A collection of class names to include */
    allowlist?: string[];
    /** A collector of class names to exclude */
    denylist?: string[];
    /** A callback which returns a boolean as to whether the element should be included */
    filter?: (elt: T) => boolean;
}
/**
 * Checks if an object is a string
 * @param str - The object to check
 */
declare function isString(str: Object): str is string;
/**
 * Checks if an object is an integer
 * @param int - The object to check
 */
declare function isInteger(int: Object): int is number;
/**
 * Checks if the input parameter is a function
 * @param func - The object to check
 */
declare function isFunction(func: unknown): boolean;
/**
 * Cleans up the page title
 */
declare function fixupTitle(title: string | {
    text: string;
}): string;
/**
 * Extract hostname from URL
 */
declare function getHostName(url: string): string;
/**
 * Fix-up domain
 */
declare function fixupDomain(domain: string): string;
/**
 * Get page referrer. In the case of a single-page app,
 * if the URL changes without the page reloading, pass
 * in the old URL. It will be returned unless overriden
 * by a "refer(r)er" parameter in the querystring.
 *
 * @param string - oldLocation Optional.
 * @returns string The referrer
 */
declare function getReferrer(oldLocation?: string): string;
/**
 * Cross-browser helper function to add event handler
 */
declare function addEventListener(element: HTMLElement | EventTarget, eventType: string, eventHandler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): boolean | void;
/**
 * Return value from name-value pair in querystring
 */
declare function fromQuerystring(field: string, url: string): string | null;
/**
 * Add a name-value pair to the querystring of a URL
 *
 * @param string - url URL to decorate
 * @param string - name Name of the querystring pair
 * @param string - value Value of the querystring pair
 */
declare function decorateQuerystring(url: string, name: string, value: string): string;
/**
 * Attempt to get a value from localStorage
 *
 * @param string - key
 * @returns string The value obtained from localStorage, or
 *                undefined if localStorage is inaccessible
 */
declare function attemptGetLocalStorage(key: string): string | null | undefined;
/**
 * Attempt to write a value to localStorage
 *
 * @param string - key
 * @param string - value
 * @param number - ttl Time to live in seconds, defaults to 2 years from Date.now()
 * @returns boolean Whether the operation succeeded
 */
declare function attemptWriteLocalStorage(key: string, value: string, ttl?: number): boolean;
/**
 * Attempt to delete a value from localStorage
 *
 * @param string - key
 * @returns boolean Whether the operation succeeded
 */
declare function attemptDeleteLocalStorage(key: string): boolean;
/**
 * Attempt to get a value from sessionStorage
 *
 * @param string - key
 * @returns string The value obtained from sessionStorage, or
 *                undefined if sessionStorage is inaccessible
 */
declare function attemptGetSessionStorage(key: string): string | null | undefined;
/**
 * Attempt to write a value to sessionStorage
 *
 * @param string - key
 * @param string - value
 * @returns boolean Whether the operation succeeded
 */
declare function attemptWriteSessionStorage(key: string, value: string): boolean;
/**
 * Finds the root domain
 */
declare function findRootDomain(sameSite: string, secure: boolean): string;
/**
 * Checks whether a value is present within an array
 *
 * @param val - The value to check for
 * @param array - The array to check within
 * @returns boolean Whether it exists
 */
declare function isValueInArray<T>(val: T, array: T[]): boolean;
/**
 * Deletes an arbitrary cookie by setting the expiration date to the past
 *
 * @param cookieName - The name of the cookie to delete
 * @param domainName - The domain the cookie is in
 */
declare function deleteCookie(cookieName: string, domainName?: string, sameSite?: string, secure?: boolean): string;
/**
 * Fetches the name of all cookies beginning with a certain prefix
 *
 * @param cookiePrefix - The prefix to check for
 * @returns array The cookies that begin with the prefix
 */
declare function getCookiesWithPrefix(cookiePrefix: string): string[];
/**
 * Get and set the cookies associated with the current document in browser
 * This implementation always returns a string, returns the cookie value if only name is specified
 *
 * @param name - The cookie name (required)
 * @param value - The cookie value
 * @param ttl - The cookie Time To Live (seconds)
 * @param path - The cookies path
 * @param domain - The cookies domain
 * @param samesite - The cookies samesite attribute
 * @param secure - Boolean to specify if cookie should be secure
 * @returns string The cookies value
 */
declare function cookie(name: string, value?: string, ttl?: number, path?: string, domain?: string, samesite?: string, secure?: boolean): string;
/**
 * Parses an object and returns either the
 * integer or undefined.
 *
 * @param obj - The object to parse
 * @returns the result of the parse operation
 */
declare function parseAndValidateInt(obj: unknown): number | undefined;
/**
 * Parses an object and returns either the
 * number or undefined.
 *
 * @param obj - The object to parse
 * @returns the result of the parse operation
 */
declare function parseAndValidateFloat(obj: unknown): number | undefined;
/**
 * Convert a criterion object to a filter function
 *
 * @param object - criterion Either {allowlist: [array of allowable strings]}
 *                             or {denylist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 * @param boolean - byClass Whether to allowlist/denylist based on an element's classes (for forms)
 *                        or name attribute (for fields)
 */
declare function getFilterByClass(criterion?: FilterCriterion<HTMLElement> | null): (elt: HTMLElement) => boolean;
/**
 * Convert a criterion object to a filter function
 *
 * @param object - criterion Either {allowlist: [array of allowable strings]}
 *                             or {denylist: [array of allowable strings]}
 *                             or {filter: function (elt) {return whether to track the element}
 */
declare function getFilterByName<T extends {
    name: string;
}>(criterion?: FilterCriterion<T>): (elt: T) => boolean;
/**
 * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
 */
declare function getCssClasses(elt: Element): RegExpMatchArray;
/**
 * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
 */
declare function getCssClassesAsString(elt: Element): string;
/**
 * Attempt to delete a value to localStorage
 *
 * @param string - key
 */
declare function deleteKeysFromLocalStorage(key: string): boolean;
declare function mergeConfigs(config1: any, config2: any): any;
declare function computeSamplingMode(controlIngestConfig: any): string;
declare function removeCachedRandomNumber(): void;
/**
 * @method truncateString
 * Truncate a string to a specified length and add an ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the truncated string
 * @returns The truncated string
 */
declare function truncateString(str: string, maxLength: number): string;
/**
 * Returns an integer when:
 *   • input is already an integer number, OR
 *   • input is a base-10 integer string (optional ± sign).
 * Otherwise returns undefined.
 */
declare function intOrUndefined(value: number | string): number | undefined;
declare const getAbortController: () => AbortController | undefined;
declare const getAbortControllerSignal: () => AbortSignal | undefined;
declare const createAbortSignalAndController: () => void;
declare const resetAbortSignalAndController: () => void;
declare function isPerformanceNavigationTiming(e: PerformanceEntry): e is PerformanceNavigationTiming;
/*
* Checks whether sessionStorage is available, in a way that
* does not throw a SecurityError in Firefox if "always ask"
* is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
*/
declare function hasSessionStorage(): boolean;
/*
* Checks whether localStorage is available, in a way that
* does not throw a SecurityError in Firefox if "always ask"
* is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
*/
declare function hasLocalStorage(): boolean;
/*
* Checks whether localStorage is accessible
* sets and removes an item to handle private IOS5 browsing
* (http://git.io/jFB2Xw)
*/
declare function localStorageAccessible(): boolean;
/**
 * Gets the current viewport.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 * - http://responsejs.com/labs/dimensions/
 */
declare function detectViewport(): string | null;
/**
 * Gets the dimensions of the current
 * document.
 *
 * Code based on:
 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
 */
declare function detectDocumentSize(): string;
/*
* Fix-up URL when page rendered from search engine cache or translated page.
*/
declare function fixupUrl(hostName: string, href: string, referrer: string): string[];
export { dispatchToTrackers, dispatchToTrackersInCollection, trackerExists, addTracker, getTracker, getTrackers, allTrackers, allTrackerNames, removeTrackers, BuiltInContexts, AnonymousTrackingOptions, StateStorageStrategy, Platform, CookieSameSite, EventMethod, TraceparentGenerationConfig, metaTagsTrackingConfig, networkRequestTrackingConfig, networkConfig, ConvivaTrackerConfiguration, DeviceMetadata, DeviceMetadataConstants, ConvivaDeviceMetadata, ConvivaConstants, TrackerConfiguration, ActivityCallbackData, ActivityCallback, ActivityTrackingConfiguration, ActivityTrackingConfigurationCallback, PageViewEvent, CustomEvent, DisableAnonymousTrackingConfiguration, EnableAnonymousTrackingConfiguration, ClearUserDataConfiguration, FlushBufferConfiguration, BrowserPluginConfiguration, ErrorEventProperties, BrowserTracker, RichContentInferenceCondition, RichContentInferenceConfig, RichContentInferenceResults, FilterCriterion, isString, isInteger, isFunction, fixupTitle, getHostName, fixupDomain, getReferrer, addEventListener, fromQuerystring, decorateQuerystring, attemptGetLocalStorage, attemptWriteLocalStorage, attemptDeleteLocalStorage, attemptGetSessionStorage, attemptWriteSessionStorage, findRootDomain, isValueInArray, deleteCookie, getCookiesWithPrefix, cookie, parseAndValidateInt, parseAndValidateFloat, getFilterByClass, getFilterByName, getCssClasses, getCssClassesAsString, deleteKeysFromLocalStorage, mergeConfigs, computeSamplingMode, removeCachedRandomNumber, truncateString, intOrUndefined, getAbortController, getAbortControllerSignal, createAbortSignalAndController, resetAbortSignalAndController, isPerformanceNavigationTiming, hasSessionStorage, hasLocalStorage, localStorageAccessible, detectViewport, detectDocumentSize, fixupUrl, BrowserPlugin, SharedState, createSharedState };
