import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, 'src/server'), '')

  return {
    plugins: [react()],
    root: 'src/client',
    publicDir: resolve(__dirname, 'public'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8050',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:8050',
          ws: true,
        },
      },
    },
    define: {
      // Environment variables from .env (replicate webpack DefinePlugin)
      __ENV__: JSON.stringify(env.ENV || 'DEV'),
      __ENABLE_STATS__: env.ENABLE_STATS === 'true',
      __API_SERVICE_URL__: JSON.stringify(env.CLIENT_BASE_URL || ''),
      __API_BASE_PATH__: JSON.stringify(env.BASE_API_ENDPOINT_PATH || ''),
      __WS_SERVICE_URL__: JSON.stringify(env.WS_URL || ''),
      __MAIN_FONT_URL__: JSON.stringify(env.MAIN_FONT_URL || ''),
      __INIT_SOUND_LOAD_URL__: JSON.stringify(env.INIT_GRAPH_LOAD_SOUND_URL || ''),

      // Twitter test values
      __TWITTER_TEST_TWEET_ID__: JSON.stringify(env.TWITTER_TEST_TWEET_ID || ''),
      __TWITTER_TEST_TWEET_IDS__: JSON.stringify(env.TWITTER_TEST_TWEET_IDS || ''),
      __TWITTER_TEST_TWEET_SEARCH_QUERY__: JSON.stringify(env.TWITTER_TEST_TWEET_SEARCH_QUERY || ''),
      __TWITTER_TEST_USERNAME_IDS__: JSON.stringify(env.TWITTER_TEST_USERNAME_IDS || ''),
      __TWITTER_DEFAULT_FILTERED_STREAM_SAMPLE_SIZE__: JSON.stringify(env.DEFAULT_VALUE_TWEET_STREAM_BATCH_COUNT || '10'),

      // Observer channel IDs (static strings)
      __OBSERVER_GRAPH_LOADED_CHANNEL_ID__: JSON.stringify('graphLoaded'),
      __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__: JSON.stringify('entityClicked'),
      __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__: JSON.stringify('entityActive'),
      __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__: JSON.stringify('entityFocused'),
      __OBSERVER_ENTITY_HOVER_CHANNEL_ID__: JSON.stringify('entityHover'),
      __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__: JSON.stringify('entityOnStage'),
      __OBSERVER_ENTITIES_ON_STAGE_CHANNEL_ID__: JSON.stringify('entitiesOnStage'),
      __OBSERVER_VRCONTROLS_CLICKED_CHANNEL_ID__: JSON.stringify('vrClickedControls'),
      __OBSERVER_COMMANDS_CHANNEL_ID__: JSON.stringify('commands'),
      __OBSERVER_NODE_CLICKED_CHANNEL_ID__: JSON.stringify('nodeClicked'),
      __OBSERVER_NODE_FOCUSED_CHANNEL_ID__: JSON.stringify('nodeFocused'),
      __OBSERVER_NODE_ACTIVE_CHANNEL_ID__: JSON.stringify('nodeActive'),
      __OBSERVER_NODES_ACTIVE_CHANNEL_ID__: JSON.stringify('nodesActive'),
      __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__: JSON.stringify('nodesOnStage'),
      __OBSERVER_KEYS_CONTROLS_CHANNEL_ID__: JSON.stringify('keysControls'),
      __OBSERVER_INTERACTIVE_ENTITY_ON_STAGE_CHANNEL_ID__: JSON.stringify('interactiveEntityOnStage'),
      __OBSERVER_INTERACTIVE_ENTITIES_ON_STAGE_CHANNEL_ID__: JSON.stringify('interactiveEntitiesOnStage'),
      __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__: JSON.stringify('navSelectedTypes'),
      __OBSERVER_NAVIGATION_CHANNEL_ID__: JSON.stringify('nav'),
    },
  }
})
