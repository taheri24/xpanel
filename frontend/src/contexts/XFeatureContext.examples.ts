/**
 * XFeatureProvider Event Examples
 * Demonstrates how to use event callbacks for mocking and Storybook integration
 */

import type {   FrontendElements } from '../types/xfeature';
import type {
  XFeatureBeforeQueryHandler,
  XFeatureAfterQueryHandler,
  XFeatureBeforeActionHandler,
  XFeatureAfterActionHandler,
  XFeatureErrorHandler,
  XFeatureProviderProps,
} from './XFeatureContext';

// ============================================================================
// MOCKING EXAMPLE - Useful for unit tests and Storybook
// ============================================================================

/**
 * Example: Mock query responses for testing
 */
export const createMockQueryHandler = (
  mockData: Record<string, unknown>
): XFeatureBeforeQueryHandler => {
  return async (event) => {
    console.log(`[Mock] Query: ${event.featureName}/${event.queryId}`, event.params);

    // Return mocked data instead of calling the API
    return {
      data: [mockData],
      total: 1,
      page: 1,
      pageSize: 10,
    };
  };
};

/**
 * Example: Mock action responses for testing
 */
export const createMockActionHandler = (
  successMessage: string = 'Operation successful'
): XFeatureBeforeActionHandler => {
  return async (event) => {
    console.log(`[Mock] Action: ${event.featureName}/${event.actionId}`, event.params);

    // Return mocked action response
    return {
      success: true,
      message: successMessage,
      data: { id: 123, ...event.params },
    };
  };
};

// ============================================================================
// LOGGING EXAMPLE - Useful for debugging and monitoring
// ============================================================================

/**
 * Example: Log all query executions
 */
export const createLoggingQueryHandler = (): XFeatureAfterQueryHandler => {
  return async (event) => {
    console.group(`📊 Query: ${event.featureName}/${event.queryId}`);
    console.log('Parameters:', event.params);
    console.log('Results:', event.result.data);
    console.log('Total:', event.result.total);
    console.groupEnd();
  };
};

/**
 * Example: Log all action executions
 */
export const createLoggingActionHandler = (): XFeatureAfterActionHandler => {
  return async (event) => {
    console.group(`🔄 Action: ${event.featureName}/${event.actionId}`);
    console.log('Parameters:', event.params);
    console.log('Success:', event.result.success);
    console.log('Message:', event.result.message);
    console.groupEnd();
  };
};

/**
 * Example: Error logging and reporting
 */
export const createErrorLoggingHandler = (): XFeatureErrorHandler => {
  return async (event) => {
    console.error(`❌ Error in ${event.context}:`, {
      context: event.context,
      featureName: event.featureName,
      queryId: event.queryId,
      actionId: event.actionId,
      error: event.error.message,
      stack: event.error.stack,
    });

    // Could also send to error reporting service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(event.error);
    // }
  };
};

// ============================================================================
// CONDITIONAL MOCKING EXAMPLE - Mock specific operations
// ============================================================================

/**
 * Example: Mock only specific queries while other queries use the real API
 */
export const createConditionalMockQueryHandler = (
  mockQueries: Record<string, unknown>
): XFeatureBeforeQueryHandler => {
  return async (event) => {
    // Only mock specific queries
    if (event.queryId === 'ListUsers' && event.featureName === 'user-management') {
      return {
        data: [mockQueries],
        total: 1,
      };
    }

    // Return undefined to use the real API
    return undefined;
  };
};

/**
 * Example: Mock only specific actions while other actions use the real API
 */
export const createConditionalMockActionHandler = (
  _mockActions: Record<string, unknown>
): XFeatureBeforeActionHandler => {
  return async (event) => {
    // Only mock the CreateUser action
    if (event.actionId === 'CreateUser' && event.featureName === 'user-management') {
      return {
        success: true,
        message: 'User created successfully',
        data: { id: 999, ...event.params },
      };
    }

    // Return undefined to use the real API
    return undefined;
  };
};

// ============================================================================
// STORYBOOK EXAMPLE - Setup for stories
// ============================================================================

const mockFrontendElements: FrontendElements = {
  feature: 'user-management',
  version: '1.0.0',
  dataTables: [
    {
      id: 'users-table',
      queryRef: 'ListUsers',
      title: 'Users',
      columns: [
        { name: 'id', label: 'ID', type: 'Number' },
        { name: 'username', label: 'Username', type: 'Text' },
        { name: 'email', label: 'Email', type: 'Email' },
      ],
    },
  ],
  forms: [
    {
      id: 'create-user',
      mode: 'Create',
      title: 'Create User',
      actionRef: 'CreateUser',
      fields: [
        { name: 'username', label: 'Username', type: 'Text', required: true },
        { name: 'email', label: 'Email', type: 'Email', required: true },
      ],
      buttons: [
        { type: 'Submit', label: 'Create' },
        { type: 'Cancel', label: 'Cancel' },
      ],
    },
  ],
};

/**
 * Example: Storybook decorator that provides mocked data
 */
export const createStorybookMockProvider = () => {
  const usersMockData = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-15',
  };

  return {
    onBeforeFrontend:()=>mockFrontendElements ,
    onBeforeQuery: async (event: any) => {
      if (event.featureName === 'user-management' && event.queryId === 'ListUsers') {
        return {
          data: [
            usersMockData,
            { ...usersMockData, id: 2, username: 'jane_doe', email: 'jane@example.com' },
          ],
          total: 2,
          page: 1,
          pageSize: 10,
        };
      }
      return undefined;
    },

    onBeforeAction: async (event: any) => {
      if (event.featureName === 'user-management' && event.actionId === 'CreateUser') {
        return {
          success: true,
          message: 'User created successfully',
          data: { id: 3, ...event.params },
        };
      }
      return undefined;
    },
  } as Partial< XFeatureProviderProps>;
};

// ============================================================================
// COMPOSITION EXAMPLE - Combine multiple handlers
// ============================================================================

/**
 * Example: Combine multiple event handlers
 */
export const combineEventHandlers = (handlers: {
  onBeforeQuery?: XFeatureBeforeQueryHandler;
  onAfterQuery?: XFeatureAfterQueryHandler;
  onBeforeAction?: XFeatureBeforeActionHandler;
  onAfterAction?: XFeatureAfterActionHandler;
  onError?: XFeatureErrorHandler;
}) => {
  return {
    onBeforeQuery: handlers.onBeforeQuery,
    onAfterQuery: handlers.onAfterQuery,
    onBeforeAction: handlers.onBeforeAction,
    onAfterAction: handlers.onAfterAction,
    onError: handlers.onError,
  };
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example usage in a React component:
 *
 * ```tsx
 * import { XFeatureProvider } from '@/contexts/XFeatureContext';
 * import {
 *   createMockQueryHandler,
 *   createLoggingActionHandler,
 *   createErrorLoggingHandler,
 * } from '@/contexts/XFeatureContext.examples';
 *
 * function App() {
 *   const mockUser = {
 *     id: 1,
 *     username: 'john_doe',
 *     email: 'john@example.com',
 *   };
 *
 *   return (
 *     <XFeatureProvider
 *       onBeforeQuery={createMockQueryHandler(mockUser)}
 *       onAfterAction={createLoggingActionHandler()}
 *       onError={createErrorLoggingHandler()}
 *     >
 *       <YourComponent />
 *     </XFeatureProvider>
 *   );
 * }
 * ```
 */

/**
 * Example Storybook setup:
 *
 * ```tsx
 * import type { Meta, StoryObj } from '@storybook/react';
 * import { XFeatureProvider } from '@/contexts/XFeatureContext';
 * import { createStorybookMockProvider } from '@/contexts/XFeatureContext.examples';
 * import { XFeaturePageBuilder } from '@/components/xfeature';
 *
 * const meta = {
 *   title: 'XFeature/UserManagement',
 *   component: XFeaturePageBuilder,
 *   decorators: [
 *     (Story) => {
 *       const mockConfig = createStorybookMockProvider();
 *       return (
 *         <XFeatureProvider {...mockConfig}>
 *           <Story />
 *         </XFeatureProvider>
 *       );
 *     },
 *   ],
 * } satisfies Meta<typeof XFeaturePageBuilder>;
 *
 * export default meta;
 * type Story = StoryObj<typeof meta>;
 *
 * export const Default: Story = {
 *   args: {
 *     featureName: 'user-management',
 *   },
 * };
 * ```
 */
