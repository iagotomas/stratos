import { Headers, RequestOptions, URLSearchParams } from '@angular/http';

import { IApp } from '../../../core/src/core/cf-api.types';
import { EntityInlineParentAction } from '../../../store/src/helpers/entity-relations/entity-relations.types';
import { pick } from '../../../store/src/helpers/reducer.helper';
import { ActionMergeFunction } from '../../../store/src/types/api.types';
import { PaginatedAction, PaginationParam } from '../../../store/src/types/pagination.types';
import { ICFAction } from '../../../store/src/types/request.types';
import { CF_ENDPOINT_TYPE } from '../../cf-types';
import { applicationEntityType, appStatsEntityType, cfEntityFactory } from '../cf-entity-factory';
import { AppMetadataTypes } from './app-metadata.actions';
import { CFStartAction } from './cf-action.types';

export const GET_ALL = '[Application] Get all';
export const GET_ALL_SUCCESS = '[Application] Get all success';
export const GET_ALL_FAILED = '[Application] Get all failed';

export const GET = '[Application] Get one';
export const GET_SUCCESS = '[Application] Get one success';
export const GET_FAILED = '[Application] Get one failed';

export const GET_SUMMARY = '[Application] Get summary';
export const GET_SUMMARY_SUCCESS = '[Application] Get summary success';
export const GET_SUMMARY_FAILED = '[Application] Get summary failed';

export const CREATE = '[Application] Create';
export const CREATE_SUCCESS = '[Application] Create success';
export const CREATE_FAILED = '[Application] Create failed';

export const UPDATE = '[Application] Update';
export const UPDATE_SUCCESS = '[Application] Update success';
export const UPDATE_FAILED = '[Application] Update failed';

export const DELETE = '[Application] Delete';
export const DELETE_SUCCESS = '[Application] Delete success';
export const DELETE_FAILED = '[Application] Delete failed';

export const DELETE_INSTANCE = '[Application Instance] Delete';
export const DELETE_INSTANCE_SUCCESS = '[Application Instance] Delete success';
export const DELETE_INSTANCE_FAILED = '[Application Instance] Delete failed';

export const RESTAGE = '[Application] Restage';
export const RESTAGE_SUCCESS = '[Application] Restage success';
export const RESTAGE_FAILED = '[Application] Restage failed';

const applicationEntitySchema = cfEntityFactory(applicationEntityType);

export class GetAllApplications extends CFStartAction implements PaginatedAction, EntityInlineParentAction {
  private static sortField = 'creation'; // This is the field that 'order-direction' is applied to. Cannot be changed

  constructor(public paginationKey: string, public endpointGuid: string, public includeRelations = [], public populateMissing = false) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'apps';
    this.options.method = 'get';
  }
  actions = [GET_ALL, GET_ALL_SUCCESS, GET_ALL_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  endpointType = CF_ENDPOINT_TYPE;
  options: RequestOptions;
  initialParams: PaginationParam = {
    'order-direction': 'asc',
    'order-direction-field': GetAllApplications.sortField,
    page: 1,
    'results-per-page': 100,
  };
  flattenPagination = true;
  flattenPaginationMax = 600;
}

export class GetApplication extends CFStartAction implements ICFAction, EntityInlineParentAction {
  constructor(public guid: string, public endpointGuid: string, public includeRelations = [], public populateMissing = true) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}`;
    this.options.method = 'get';
  }
  actions = [GET, GET_SUCCESS, GET_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
}

export class CreateNewApplication extends CFStartAction implements ICFAction {
  constructor(
    public guid: string,
    public endpointGuid: string,
    application: IApp
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps`;
    this.options.method = 'post';
    this.options.body = {
      name: application.name,
      space_guid: application.space_guid
    };
  }
  actions = [CREATE, CREATE_SUCCESS, CREATE_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
}

export interface UpdateApplication {
  name?: string;
  instances?: number;
  memory?: number;
  enable_ssh?: boolean;
  environment_json?: any;
  state?: string;
}

export class UpdateExistingApplication extends CFStartAction implements ICFAction {
  static updateKey = 'Updating-Existing-Application';

  /**
   * Creates an instance of UpdateExistingApplication.
   * @param newApplication Sparsely populated application containing updated settings
   * @param [existingApplication] Existing application. Used in a few specific cases
   * @param [updateEntities] List of metadata calls to make if we successfully update the application
   */
  constructor(
    public guid: string,
    public endpointGuid: string,
    public newApplication: UpdateApplication,
    public existingApplication?: IApp,
    public updateEntities?: AppMetadataTypes[]
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}`;
    this.options.method = 'put';
    this.options.body = newApplication;
  }
  actions = [UPDATE, UPDATE_SUCCESS, UPDATE_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
  updatingKey = UpdateExistingApplication.updateKey;
  entityMerge: ActionMergeFunction = (oldEntities, newEntities) => {
    const keepFromOld = pick(
      oldEntities[applicationEntityType][this.guid].entity,
      Object.keys(applicationEntitySchema.schema)
    );
    newEntities[applicationEntityType][this.guid].entity = {
      ...newEntities[applicationEntityType][this.guid].entity,
      ...keepFromOld
    };
    return newEntities;
  }
}

export class DeleteApplication extends CFStartAction implements ICFAction {
  static updateKey = 'Deleting-Existing-Application';

  constructor(public guid: string, public endpointGuid: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}`;
    this.options.method = 'delete';
    this.options.headers = new Headers();
    const endpointPassthroughHeader = 'x-cap-passthrough';
    this.options.headers.set(endpointPassthroughHeader, 'true');
    this.options.params = new URLSearchParams();
    // Delete the service instance and route bindings, but not the service instance and route themselves
    this.options.params.set('recursive', 'true');
  }
  actions = [DELETE, DELETE_SUCCESS, DELETE_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
}
export class DeleteApplicationInstance extends CFStartAction
  implements ICFAction {
  guid: string;
  constructor(
    public appGuid: string,
    index: number,
    public endpointGuid: string
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${appGuid}/instances/${index}`;
    this.options.method = 'delete';
    this.options.headers = new Headers();
    const endpointPassthroughHeader = 'x-cap-passthrough';
    this.options.headers.set(endpointPassthroughHeader, 'true');
    this.guid = `${appGuid}-${index}`;
  }
  actions = [DELETE_INSTANCE, DELETE_INSTANCE_SUCCESS, DELETE_INSTANCE_FAILED];
  entity = [cfEntityFactory(appStatsEntityType)];
  entityType = appStatsEntityType;
  removeEntityOnDelete = true;
  options: RequestOptions;
}

export class RestageApplication extends CFStartAction implements ICFAction {
  constructor(public guid: string, public endpointGuid: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}/restage`;
    this.options.method = 'post';
    this.options.headers = new Headers();
    const endpointPassthroughHeader = 'x-cap-passthrough';
    this.options.headers.set(endpointPassthroughHeader, 'true');
  }
  actions = [RESTAGE, RESTAGE_SUCCESS, RESTAGE_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
  updatingKey = 'restaging';
}
