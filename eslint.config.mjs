import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',

        // Browser globals
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        WheelEvent: 'readonly',
        KeyboardEvent: 'readonly',
        AudioBuffer: 'readonly',
        requestAnimationFrame: 'readonly',
        WebGLRenderer: 'readonly',
        Event: 'readonly',
        fetch: 'readonly',

        // Vite define globals
        __ENV__: 'readonly',
        __ENABLE_STATS__: 'readonly',
        __API_SERVICE_URL__: 'readonly',
        __API_BASE_PATH__: 'readonly',
        __WS_SERVICE_URL__: 'readonly',
        __MAIN_FONT_URL__: 'readonly',
        __INIT_SOUND_LOAD_URL__: 'readonly',
        __TWITTER_TEST_TWEET_ID__: 'readonly',
        __TWITTER_TEST_TWEET_IDS__: 'readonly',
        __TWITTER_TEST_TWEET_SEARCH_QUERY__: 'readonly',
        __TWITTER_TEST_USERNAME_IDS__: 'readonly',
        __TWITTER_DEFAULT_FILTERED_STREAM_SAMPLE_SIZE__: 'readonly',
        __OBSERVER_GRAPH_LOADED_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITY_HOVER_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__: 'readonly',
        __OBSERVER_ENTITIES_ON_STAGE_CHANNEL_ID__: 'readonly',
        __OBSERVER_VRCONTROLS_CLICKED_CHANNEL_ID__: 'readonly',
        __OBSERVER_COMMANDS_CHANNEL_ID__: 'readonly',
        __OBSERVER_NODE_CLICKED_CHANNEL_ID__: 'readonly',
        __OBSERVER_NODE_FOCUSED_CHANNEL_ID__: 'readonly',
        __OBSERVER_NODE_ACTIVE_CHANNEL_ID__: 'readonly',
        __OBSERVER_NODES_ACTIVE_CHANNEL_ID__: 'readonly',
        __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__: 'readonly',
        __OBSERVER_KEYS_CONTROLS_CHANNEL_ID__: 'readonly',
        __OBSERVER_INTERACTIVE_ENTITY_ON_STAGE_CHANNEL_ID__: 'readonly',
        __OBSERVER_INTERACTIVE_ENTITIES_ON_STAGE_CHANNEL_ID__: 'readonly',
        __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__: 'readonly',
        __OBSERVER_NAVIGATION_CHANNEL_ID__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable rules that TypeScript handles
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this (namespaces, overloads)
      '@typescript-eslint/no-redeclare': 'off',

      // Relax rules for existing codebase patterns
      'no-empty': 'warn',
      'no-extra-semi': 'warn',
      'no-useless-escape': 'warn',
      'no-cond-assign': 'warn',
      'no-prototype-builtins': 'warn',
      'getter-return': 'warn',
      'no-func-assign': 'warn',
      'no-fallthrough': 'warn',
      'no-unsafe-finally': 'warn',
      'no-async-promise-executor': 'warn',
      'no-case-declarations': 'warn',
      'no-debugger': 'warn',
      'no-constant-condition': 'warn',
      'no-constant-binary-expression': 'warn',
    },
  },
  {
    ignores: [
      'dist/**',
      'server/**',
      'coverage/**',
      'node_modules/**',
      '*.js',
      'src/client/lib/tween/**',
      'src/client/assets/**',
      'src/**/*.d.ts',
    ],
  },
  prettier,
]
