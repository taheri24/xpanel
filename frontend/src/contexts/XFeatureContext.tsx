import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  XFeature,
  QueryRequest,
  QueryResponse,
  ActionQueryRequest,
  ActionQueryResponse,
  FrontendElements,
  MappingsResponse,
  Mapping,
  BackendInfo,
} from '../types/xfeature';
import {
  executeXFeatureQuery,
  executeXFeatureAction,
  getXFeatureFrontendElements,
  resolveXFeatureMappings,
  getXFeatureBackendInfo,
} from '../services/api';

// ============================================================================
// EVENT CALLBACK TYPES
// ============================================================================

/**
 * Event fired before executing a query
 * Can be used to mock responses or intercept requests
 */
export interface XFeatureBeforeQueryEvent {
  queryId: string;
  params: QueryRequest;
}

/**
 * Event fired after successfully executing a query
 */
export interface XFeatureAfterQueryEvent<T = Record<string, unknown>> {

  queryId: string;
  params: QueryRequest;
  result: QueryResponse<T>;
}

/**
 * Event fired before executing an action
 * Can be used to mock responses or intercept requests
 */
export interface XFeatureBeforeActionEvent {
  actionId: string;
  params: ActionQueryRequest;
}

/**
 * Event fired after successfully executing an action
 */
export interface XFeatureAfterActionEvent {
  actionId: string;
  params: ActionQueryRequest;
  result: ActionQueryResponse;
}

/**
 * Event fired before loading mappings
 */
export interface XFeatureBeforeMappingsEvent {

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
) => ActionQueryResponse | undefined | Promise<ActionQueryResponse | undefined>;

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

class XFeatureContextState {
  frontendElements: FrontendElements | undefined;
  backendInfo: BackendInfo | undefined;
  mappingMap: Map<string, Mapping> | undefined;
  props: XFeatureProviderProps;
  loadState: undefined | 'LOADING' | 'LOADED' | 'FAILED';
  revKey: number = 0;
  updateUI?: Function;
  /**
   *
   */
  constructor(props: XFeatureProviderProps) {
    this.props = props;
  }
  getFeature() {
    return this.feature;
  }
  getForm(formId: string) {
    return this.frontendElements?.forms.find(f => f.id == formId) || undefined


  }
  getMappingByName(name: string): Mapping | undefined {
    return this.mappingMap?.get(name);
  }


  getDataTable(tableId: string) {
    return this.frontendElements?.dataTables.find(d => d.id == tableId) || this.frontendElements?.dataTables[0];
  }
  async executeQuery<T>(queryId: string, params: QueryRequest): Promise<QueryResponse<T>> {
    const { featureName = '', mock } = this.props;
    if (mock) {
      if (!mock.queries) throw new Error(`!mock.queries`)
      return mock.queries[queryId]
    }
    try {
      return await executeXFeatureQuery<T>(featureName, queryId, params);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Call onError event
      if (this.props.onError) {
        await this.props.onError({
          error: err,
          context: 'query',
          queryId,
        });
      }

      throw err;
    }

  }

  async load() {
    this.loadState = 'LOADING';
    try {
      const { featureName, mock } = this.props;
      if (mock) {
        this.backendInfo = mock.backEnd;
        this.frontendElements = mock.frontEnd;
        this.setMappings(mock.mappings || []);
        return
      }
      if (!featureName) throw new Error(`!featureName`);
      this.backendInfo = await getXFeatureBackendInfo(featureName);
      this.frontendElements = await getXFeatureFrontendElements(featureName);
      const mappinps = await resolveXFeatureMappings(featureName);

      if (Array.isArray(mappinps?.mappings)) {
        this.setMappings(mappinps.mappings);
      }
      this.loadState = 'LOADED';
      this.revKey++;
      if (this.updateUI instanceof Function)
        this.updateUI();
    } catch (e) {
      this.loadState = 'FAILED';

    }

  }
  error?: Error;
  feature: XFeature | undefined;
  setMappings(items: Mapping[]) {
    const map = new Map();
    items.forEach(m => map.set(m.name, m));
    this.mappingMap = map;

  }
  async executeActionQuery(actionQueryId: string, params: ActionQueryRequest): Promise<ActionQueryResponse | undefined> {

    try {
      // Call onBeforeAction event - can return mocked response
      const { mock, featureName } = this.props;
      if (!featureName) throw new Error(`!featureName`);
      if (mock) {
        if (mock.actionQueries) return mock.actionQueries[actionQueryId];
      }
      return await executeXFeatureAction(featureName, actionQueryId, params);
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.props?.onError) {
        await this.props?.onError({
          error: err,
          context: 'action',
          actionId: actionQueryId,
        });
      }

      throw err;
    }
  }


}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

const XFeatureContext = createContext<XFeatureContextState | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================
export interface XFeatureMock {
  backEnd?: BackendInfo;
  frontEnd?: FrontendElements | undefined;
  mappings?: Mapping[];
  queries?: Record<string, QueryResponse<any>>;
  actionQueries?: Record<string, ActionQueryResponse>;

}
export interface XFeatureProviderProps {
  featureName?: string;
  children: ReactNode;
  mock?: XFeatureMock;
  onError?: XFeatureErrorHandler;
}

export function XFeatureProvider(p: XFeatureProviderProps) {
  const { children, featureName } = p;
  const [internKey, patch] = useReducer(n => n + 1, 0);

  const ctxVal = useMemo(() => new XFeatureContextState(p), [featureName]);
  ctxVal.updateUI = patch;

  useEffect(() => {
    ctxVal.load()
  }, [featureName])
  return (
    <XFeatureContext.Provider key={`D_${ctxVal.revKey}_${internKey}`} value={ctxVal}>{children}</XFeatureContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export function useXFeature(): XFeatureContextState {
  const context = useContext(XFeatureContext);
  if (!context) {
    throw new Error('useXFeature must be used within XFeatureProvider');
  }
  return context;
}

export function useXFeatureQuery<T = Record<string, unknown>>(
  queryId: string | undefined,
  params: QueryRequest = {},
  autoLoad = true
) {
  const x = useXFeature();
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const [total, setTotal] = React.useState(0);

  const refetch = React.useCallback(

    async (newParams: QueryRequest = params) => {
      if (!queryId) return;
      setLoading(true);
      setError(undefined);
      try {
        const result = await x.executeQuery<T>(queryId, newParams);
        setData(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [x?.feature, queryId]
  );

  React.useEffect(() => {

    if (autoLoad) {
      refetch();
    }
  }, [autoLoad]);

  return { data, loading, error, total, refetch };
}

export function useXFeatureActionQuery(actionId: string) {
  const x = useXFeature();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();
  const [success, setSuccess] = React.useState(false);
  const [response, setResponse] = React.useState<ActionQueryResponse | undefined>();

  const execute = React.useCallback(
    async (params: ActionQueryRequest = {}) => {
      setLoading(true);
      setError(undefined);
      setSuccess(false);
      try {
        const result = await x.executeActionQuery(actionId, params);
        setResponse(result);
        setSuccess(Boolean(result?.success));
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [actionId]
  );

  return { execute, loading, error, success, response };
}

export function useXFeatureFrontend() {
  const x = useXFeature();
  return x?.feature;
}

