

declare module "*.png" {
    const value: string;
    export = value;
}

declare module '*.jpg'
declare module '*.gif'
declare module '*.less'

/**
 * Environment VARS
 * 
 * @description vars configured in webpack.config using DefinePlugin
 */

declare var __ENV__: 'PROD' | 'STAGE' | 'DEV'

/**
 * @description enable / disable stats monitoring
 * @type {boolean}
 */

declare var __ENABLE_STATS__: boolean

/**
 * @description used to store root API URL endpoint
 * @type {string}
 */

declare var __API_SERVICE_URL__: string

/**
 * @description used to store Web socket endpoint
 * @type {string}
 */

declare var __WS_SERVICE_URL__: string

/**
 * @description the base path of API from domain endpoint
 * @type {string}
 */

declare var __API_BASE_PATH__: string


declare var __MAIN_FONT_URL__: string

declare var __INIT_SOUND_LOAD_URL__: stirng

/**
 * TESTING
 */
declare var __TWITTER_TEST_TWEET_ID__: string

declare var __TWITTER_TEST_TWEET_IDS__: string

declare var __TWITTER_TEST_TWEET_SEARCH_QUERY__: string

declare var __TWITTER_TEST_USERNAME_IDS__: string

declare var __TWITTER_DEFAULT_FILTERED_STREAM_SAMPLE_SIZE__: number

/**
 * Observer Info
 */

declare var __OBSERVER_GRAPH_LOADED_CHANNEL_ID__: string

declare var __OBSERVER_NODE_CLICKED_CHANNEL_ID__: string

declare var __OBSERVER_NODE_ACTIVE_CHANNEL_ID__: string

declare var __OBSERVER_NODES_ACTIVE_CHANNEL_ID__: string

declare var __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__: string

declare var __OBSERVER_NODE_FOCUSED_CHANNEL_ID__: string

declare var __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__: string

declare var __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__: string

declare var __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__: string

declare var __OBSERVER_ENTITY_HOVER_CHANNEL_ID__: string

declare var __OBSERVER_VRCONTROLS_CLICKED_CHANNEL_ID__: string

declare var __OBSERVER_COMMANDS_CHANNEL_ID__: string

declare var __OBSERVER_KEYS_CONTROLS_CHANNEL_ID__: string

declare var __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__: string

declare var __OBSERVER_ENTITIES_ON_STAGE_CHANNEL_ID__: string

declare var __OBSERVER_INTERACTIVE_ENTITY_ON_STAGE_CHANNEL_ID__: string

declare var __OBSERVER_INTERACTIVE_ENTITIES_ON_STAGE_CHANNEL_ID__: string

/**
 * NAV
 */

declare var __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__: string

declare var __OBSERVER_NAVIGATION_CHANNEL_ID__: string

/**
 * Three
 */

declare type Coords = { x: number; y: number; z: number; }

/**
 * 3d force graph
 */
interface GraphData {
  nodes: NodeObject[]
  links: LinkObject[]
}

type NodeObject = object & {
  id?: string | number
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
  fx?: number
  fy?: number
  fz?: number
};

type LinkObject = object & {
  source?: string | number | NodeObject
  target?: string | number | NodeObject
}

declare module 'three-mesh-ui'
