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
} from '../types/xfeature';
import {
  getXFeature,
  executeXFeatureQuery,
  executeXFeatureAction,
} from '../services/api';

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

interface XFeatureProviderProps {
  children: ReactNode;
}

export function XFeatureProvider({ children }: XFeatureProviderProps) {
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
        return undefined;
      }
    },
    [state.features]
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
        const result = await executeXFeatureQuery<T>(featureName, queryId, params);
        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        throw err;
      }
    },
    []
  );

  const executeActionFn = useCallback(
    async (
      featureName: string,
      actionId: string,
      params: ActionRequest
    ): Promise<ActionResponse> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await executeXFeatureAction(featureName, actionId, params);
        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'SET_ERROR', payload: err });
        throw err;
      }
    },
    []
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
  }, [autoLoad, refetch]);

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
