import React, { createContext, useContext, useCallback, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  XFeature,
  XFeatureContextType,
  QueryRequest,
  QueryResponse,
  ActionRequest,
  ActionResponse,
  Query,
  ActionQuery,
  Form,
  DataTable,
  FrontendElements,
  XFeatureBeforeFrontendHandler,
  XFeatureAfterFrontendHandler,
  MappingsResponse,
  Mapping,
} from '../types/xfeature';
import {
  getXFeature,
  executeXFeatureQuery,
  executeXFeatureAction,
  getXFeatureFrontendElements,
  resolveXFeatureMappings,
} from '../services/api';

// ============================================================================
// EVENT CALLBACK TYPES
// ============================================================================

/**
 * Event fired before executing a query
 * Can be used to mock responses or intercept requests
 */
export interface XFeatureBeforeQueryEvent {
  featureName: string;
  queryId: string;
  params: QueryRequest;
}

/**
 * Event fired after successfully executing a query
 */
export interface XFeatureAfterQueryEvent<T = Record<string, unknown>> {
  featureName: string;
  queryId: string;
  params: QueryRequest;
  result: QueryResponse<T>;
}

/**
 * Event fired before executing an action
 * Can be used to mock responses or intercept requests
 */
export interface XFeatureBeforeActionEvent {
  featureName: string;
  actionId: string;
  params: ActionRequest;
}

/**
 * Event fired after successfully executing an action
 */
export interface XFeatureAfterActionEvent {
  featureName: string;
  actionId: string;
  params: ActionRequest;
  result: ActionResponse;
}

/**
 * Event fired before loading mappings
 */
export interface XFeatureBeforeMappingsEvent {
  featureName?: string;
}

/**
 * Event fired after successfully loading mappings
 */
export interface XFeatureAfterMappingsEvent {
  featureName?: string;
  result: MappingsResponse;
}

/**
 * Event fired when an error occurs
 */
export interface XFeatureErrorEvent {
  error: Error;
  context: 'feature' | 'query' | 'action' | 'mappings';
  featureName?: string;
  queryId?: string;
  actionId?: string;
}

/**
 * Event handler that can return a modified response to short-circuit the API call
 */
export type XFeatureBeforeQueryHandler = (
  event: XFeatureBeforeQueryEvent
) => QueryResponse<Record<string, unknown>> | undefined | Promise<QueryResponse<Record<string, unknown>> | undefined>;

/**
 * Event handler called after a query completes
 */
export type XFeatureAfterQueryHandler = (
  event: XFeatureAfterQueryEvent
) => void | Promise<void>;

/**
 * Event handler that can return a modified response to short-circuit the API call
 */
export type XFeatureBeforeActionHandler = (
  event: XFeatureBeforeActionEvent
) => ActionResponse | undefined | Promise<ActionResponse | undefined>;

/**
 * Event handler called after an action completes
 */
export type XFeatureAfterActionHandler = (
  event: XFeatureAfterActionEvent
) => void | Promise<void>;

/**
 * Event handler that can return a modified response to short-circuit the API call
 */
export type XFeatureBeforeMappingsHandler = (
  event: XFeatureBeforeMappingsEvent
) => MappingsResponse | undefined | Promise<MappingsResponse | undefined>;

/**
 * Event handler called after mappings load successfully
 */
export type XFeatureAfterMappingsHandler = (
  event: XFeatureAfterMappingsEvent
) => void | Promise<void>;

/**
 * Event handler called when an error occurs
 */
export type XFeatureErrorHandler = (
  event: XFeatureErrorEvent
) => void | Promise<void>;

// ============================================================================
// CONTEXT STATE
// ============================================================================

interface XFeatureContextState {
  features: Map<string, XFeature>;
  loading: boolean;
  error?: Error;
}

type XFeatureContextAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | undefined }
  | { type: 'SET_FEATURE'; payload: { name: string; feature: XFeature } }
  | { type: 'RESET' };

function xfeatureReducer(
  state: XFeatureContextState,
  action: XFeatureContextAction
): XFeatureContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: undefined };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FEATURE': {
      const newFeatures = new Map(state.features);
      newFeatures.set(action.payload.name, action.payload.feature);
      return { ...state, features: newFeatures, loading: false, error: undefined };
    }
    case 'RESET':
      return { features: new Map(), loading: false, error: undefined };
    default:
      return state;
  }
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

const XFeatureContext = createContext<XFeatureContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface XFeatureProviderProps {
  children: ReactNode;
  /**
   * Called before executing a query
   * Return a QueryResponse to short-circuit the API call (useful for mocking)
   */
  onBeforeQuery?: XFeatureBeforeQueryHandler;
  /**
   * Called after a query completes successfully
   */
  onAfterQuery?: XFeatureAfterQueryHandler;
  /**
   * Called before executing an action
   * Return an ActionResponse to short-circuit the API call (useful for mocking)
   */
  onBeforeAction?: XFeatureBeforeActionHandler;
  /**
   * Called after an action completes successfully
   */
  onAfterAction?: XFeatureAfterActionHandler;
  /**
   * Called before loading frontend elements
   * Return a FrontendElements to short-circuit the API call (useful for mocking)
   */
  onBeforeFrontend?: XFeatureBeforeFrontendHandler;
  /**
   * Called after frontend elements load successfully
   */
  onAfterFrontend?: XFeatureAfterFrontendHandler;
  /**
   * Called before loading mappings
   * Return a MappingsResponse to short-circuit the API call (useful for mocking)
   */
  onBeforeMappings?: XFeatureBeforeMappingsHandler;
  /**
   * Called after mappings load successfully
   */
  onAfterMappings?: XFeatureAfterMappingsHandler;
  /**
   * Called when an error occurs during any operation
   */
  onError?: XFeatureErrorHandler;
}

export function XFeatureProvider({
  children,
  onBeforeQuery,
  onAfterQuery,
  onBeforeAction,
  onAfterAction,
  onBeforeFrontend,
  onAfterFrontend,
  onBeforeMappings: _onBeforeMappings,
  onAfterMappings: _onAfterMappings,
  onError,
}: XFeatureProviderProps) {
  const [state, dispatch] = useReducer(xfeatureReducer, {
    features: new Map(),
    loading: false,
    error: undefined,
  });

const getFeature = useCallback(
    async (name: string): Promise<XFeature | undefined> => {
      // Return cached feature if available
      if (state.features.has(name)) {
        return state.features.get(name);
      }
    
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const feature = await getXFeature(name);
        dispatch({ type: 'SET_FEATURE', payload: { name, feature } });
        return feature;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });

        // Call onError event
        if (onError) {
          await onError({
            error: err,
            context: 'feature',
            featureName: name,
          });
        }

        return undefined;
      }
    },
    [state.features, onError]
  );

  const getQuery = useCallback(
    (featureName: string, queryId: string): Query | undefined => {
      const feature = state.features.get(featureName);
      if (!feature) return undefined;
      return feature.backend.queries.find((q) => q.id === queryId);
    },
    [state.features]
  );

  const getAction = useCallback(
    (featureName: string, actionId: string): ActionQuery | undefined => {
      const feature = state.features.get(featureName);
      if (!feature) return undefined;
      return feature.backend.actionQueries.find((a) => a.id === actionId);
    },
    [state.features]
  );

  const getForm = useCallback(
    (featureName: string, formId: string): Form | undefined => {
      const feature = state.features.get(featureName);
      if (!feature) return undefined;
      return feature.frontend.forms.find((f) => f.id === formId);
    },
    [state.features]
  );

  const getDataTable = useCallback(
    (featureName: string, tableId: string): DataTable | undefined => {
      const feature = state.features.get(featureName);
      if (!feature) return undefined;
      return feature.frontend.dataTables.find((t) => t.id === tableId);
    },
    [state.features]
  );

  const executeQuery = useCallback(
    async <T = Record<string, unknown>>(
      featureName: string,
      queryId: string,
      params: QueryRequest
    ): Promise<QueryResponse<T>> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Call onBeforeQuery event - can return mocked response
        let result: QueryResponse<T> | undefined;
        if (onBeforeQuery) {
          const mockResult = await onBeforeQuery({
            featureName,
            queryId,
            params,
          });
          if (mockResult) {
            // Type assertion needed since mock returns generic Record<string, unknown>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result = mockResult as any as QueryResponse<T>;
          }
        }

        // If no mocked response, execute the actual query
        if (!result) {
          result = await executeXFeatureQuery<T>(featureName, queryId, params);
        }

        // Call onAfterQuery event
        if (onAfterQuery) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await onAfterQuery({
            featureName,
            queryId,
            params,
            result: result as any,
          });
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });

        // Call onError event
        if (onError) {
          await onError({
            error: err,
            context: 'query',
            featureName,
            queryId,
          });
        }

        throw err;
      }
    },
    [onBeforeQuery, onAfterQuery, onError]
  );

  const executeActionFn = useCallback(
    async (
      featureName: string,
      actionId: string,
      params: ActionRequest
    ): Promise<ActionResponse> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Call onBeforeAction event - can return mocked response
        let result: ActionResponse | undefined;
        if (onBeforeAction) {
          const mockResult = await onBeforeAction({
            featureName,
            actionId,
            params,
          });
          if (mockResult) {
            result = mockResult;
          }
        }

        // If no mocked response, execute the actual action
        if (!result) {
          result = await executeXFeatureAction(featureName, actionId, params);
        }

        // Call onAfterAction event
        if (onAfterAction) {
          await onAfterAction({
            featureName,
            actionId,
            params,
            result,
          });
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });

        // Call onError event
        if (onError) {
          await onError({
            error: err,
            context: 'action',
            featureName,
            actionId,
          });
        }

        throw err;
      }
    },
    [onBeforeAction, onAfterAction, onError]
  );

  const executeFrontendElements = useCallback(
    async (featureName: string): Promise<FrontendElements> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Call onBeforeFrontend event - can return mocked response
        let result: FrontendElements | undefined;
        if (onBeforeFrontend) {
          const mockResult = await onBeforeFrontend({
            featureName,
          });
          if (mockResult) {
            result = mockResult;
          }
        }

        // If no mocked response, execute the actual API call
        if (!result) {
          result = await getXFeatureFrontendElements(featureName);
        }

        // Call onAfterFrontend event
        if (onAfterFrontend) {
          await onAfterFrontend({
            featureName,
            result,
          });
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });

        // Call onError event
        if (onError) {
          await onError({
            error: err,
            context: 'feature',
            featureName,
          });
        }

        throw err;
      }
    },
    [onBeforeFrontend, onAfterFrontend, onError]
  );

  const value: XFeatureContextType = {
    features: state.features,
    loading: state.loading,
    error: state.error,
    getFeature,
    getQuery,
    getAction,
    getForm,
    getDataTable,
    executeQuery,
    executeAction: executeActionFn,
    executeFrontendElements,
  };

  return (
    <XFeatureContext.Provider value={value}>{children}</XFeatureContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export function useXFeature(): XFeatureContextType {
  const context = useContext(XFeatureContext);
  if (!context) {
    throw new Error('useXFeature must be used within XFeatureProvider');
  }
  return context;
}

export function useXFeatureDefinition(featureName: string) {
  const { getFeature, loading, error } = useXFeature();
  const [feature, setFeature] = React.useState<XFeature | undefined>();

  React.useEffect(() => {
    const loadFeature = async () => {
      const loadedFeature = await getFeature(featureName);
      setFeature(loadedFeature);
    };
    loadFeature();
  }, [featureName, getFeature]);

  return { feature, loading, error };
}

export function useXFeatureQuery<T = Record<string, unknown>>(
  featureName: string,
  queryId: string,
  params: QueryRequest = {},
  autoLoad = true
) {
  const { executeQuery } = useXFeature();
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const [total, setTotal] = React.useState(0);

  const refetch = React.useCallback(
    async (newParams: QueryRequest = params) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await executeQuery<T>(featureName, queryId, newParams);
        setData(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [featureName, queryId, executeQuery, params]
  );

  React.useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad]);

  return { data, loading, error, total, refetch };
}

export function useXFeatureAction(featureName: string, actionId: string) {
  const { executeAction } = useXFeature();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const [success, setSuccess] = React.useState(false);
  const [response, setResponse] = React.useState<ActionResponse | undefined>();

  const execute = React.useCallback(
    async (params: ActionRequest = {}) => {
      setLoading(true);
      setError(undefined);
      setSuccess(false);
      try {
        const result = await executeAction(featureName, actionId, params);
        setResponse(result);
        setSuccess(result.success);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [featureName, actionId, executeAction]
  );

  return { execute, loading, error, success, response };
}

export function useXFeatureFrontend(featureName: string, autoLoad = true) {
  const { executeFrontendElements } = useXFeature();
  const [frontendElements, setFrontendElements] = React.useState<FrontendElements | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const load = React.useCallback(
    async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await executeFrontendElements(featureName);
        setFrontendElements(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [featureName, executeFrontendElements]
  );

  React.useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return { frontendElements, loading, error, load };
}

/**
 * Hook to fetch mappings for a specific feature
 * @param featureName - Required feature name
 * @param autoLoad - Whether to automatically load mappings on mount
 * @param onBeforeMappings - Optional handler to mock mappings response
 * @param onAfterMappings - Optional handler called after mappings load
 */
export function useXFeatureMappings(
  featureName: string,
  autoLoad = true,
  onBeforeMappings?: XFeatureBeforeMappingsHandler,
  onAfterMappings?: XFeatureAfterMappingsHandler
) {
  const [mappings, setMappings] = React.useState<Mapping[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const [mappingsMap, setMappingsMap] = React.useState<Map<string, Mapping>>(new Map());

  const load = React.useCallback(
    async () => {
      setLoading(true);
      setError(undefined);
      try {
        // Call onBeforeMappings event - can return mocked response
        let result: MappingsResponse | undefined;
        if (onBeforeMappings) {
          const mockResult = await onBeforeMappings({ featureName });
          if (mockResult) {
            result = mockResult;
          }
        }

        // If no mocked response, fetch from API
        if (!result) {
          result = await resolveXFeatureMappings(featureName);
        }

        setMappings(result.mappings || []);

        // Create a map for easy lookup by name
        const map = new Map<string, Mapping>();
        (result.mappings || []).forEach((mapping) => {
          map.set(mapping.name, mapping);
        });
        setMappingsMap(map);

        // Call onAfterMappings event
        if (onAfterMappings) {
          await onAfterMappings({ featureName, result });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [featureName, onBeforeMappings, onAfterMappings]
  );

  React.useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  // Helper function to get mapping by name
  const getMappingByName = React.useCallback(
    (name: string): Mapping | undefined => {
      return mappingsMap.get(name);
    },
    [mappingsMap]
  );

  return { mappings, mappingsMap, loading, error, load, getMappingByName };
}
