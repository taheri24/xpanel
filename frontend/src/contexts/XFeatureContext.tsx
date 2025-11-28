import React, { createContext, useContext,   useMemo } from 'react';
import type {   ReactNode } from 'react';
import type {
  XFeature,
  QueryRequest,
  QueryResponse,
  ActionRequest,
  ActionResponse,
  FrontendElements,
  XFeatureBeforeFrontendHandler,
  XFeatureAfterFrontendHandler,
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
  params: ActionRequest;
}

/**
 * Event fired after successfully executing an action
 */
export interface XFeatureAfterActionEvent {
  actionId: string;
  params: ActionRequest;
  result: ActionResponse;
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

class XFeatureContextState {
  frontendElements: FrontendElements | undefined;
  backendInfo: BackendInfo | undefined;
  mappingMap:Map<string,Mapping> | undefined;
  props:XFeatureProviderProps;
  /**
   *
   */
  constructor(  props:XFeatureProviderProps) {
    this.props=props;
  }
  getFeature () {
    return this.feature;
  }
  getForm(formId: string){
    return this.frontendElements?.forms.find(f=>f.id==formId) || undefined

    
  } 
  getMappingByName(name:string):Mapping | undefined{
    return this.mappingMap?.get(name);
  }
  
   
  getDataTable(tableId: string){
    return this.frontendElements?.dataTables.find(d=>d.id==tableId) || this.frontendElements?.dataTables[0];
  }
  async executeQuery<T>(queryId: string, params: QueryRequest):Promise<QueryResponse<T>>{
    try {
      // Call onBeforeQuery event - can return mocked response
      let result: QueryResponse<T> | undefined;
      if (this.props.onBeforeQuery) {
        const mockResult = await this.props.onBeforeQuery({
           
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
        result = await executeXFeatureQuery<T>(this.props.featureName, queryId, params);
      }

      // Call onAfterQuery event
      if (this.props.onAfterQuery) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.props.onAfterQuery({queryId,
          params,
          result: result as any,
        });
      }

      return result;
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

  async  load()  {
    const {featureName}=this.props;
    this.backendInfo = await getXFeatureBackendInfo(featureName );
    this.frontendElements = await getXFeatureFrontendElements(featureName);
    const mappinps=await   resolveXFeatureMappings(featureName);
    if(Array.isArray(  mappinps?.mappings)){
      const map=new Map();

      this.mappingMap?.forEach(m=>map.set(m.name,m ));
      this.mappingMap=map;
    }
    
     
  }
  loading: boolean=false;
  error?: Error;
  feature:XFeature | undefined;

  async executeAction(  actionId: string, params: ActionRequest):Promise< ActionResponse | undefined>{
      try {
        // Call onBeforeAction event - can return mocked response
        if (this.props.onBeforeAction) {
          return  await this.props.onBeforeAction({ 
            actionId,
            params,
          });
        }

        // If no mocked response, execute the actual action
           return await executeXFeatureAction(this.props.featureName,  actionId, params);
        }
        catch(error){  
        const err = error instanceof Error ? error : new Error(String(error));
         
        // Call onError event
        if (this.props?.onError) {
          await this.props?.onError({
            error: err,
            context: 'action',
            actionId,
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

export interface XFeatureProviderProps {
  featureName:string;
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

export function XFeatureProvider(p: XFeatureProviderProps) {
const {
  children,
  onBeforeMappings: _onBeforeMappings,
  onAfterMappings: _onAfterMappings,
  featureName
}=p;
   const ctxVal=useMemo( ()=>new XFeatureContextState(p),[featureName]);
  return (
    <XFeatureContext.Provider value={ctxVal}>{children}</XFeatureContext.Provider>
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
  const x  = useXFeature();
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
        const result = await x.executeQuery<T>(  queryId, newParams);
        setData(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [  x?.feature,queryId]
  );

  React.useEffect(() => {
  
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad]);

  return { data, loading, error, total, refetch };
}

export function useXFeatureActionQuery( actionId: string) {
  const x = useXFeature();
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
        const result = await x.executeAction(  actionId, params);
        setResponse(result);
        setSuccess(Boolean( result?.success));
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [  actionId]
  );

  return { execute, loading, error, success, response };
}

export function useXFeatureFrontend() {
  const x= useXFeature();
  return x?.feature;
}

