import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import { ListView } from '../../../../../store/actions/list.actions';
import { AppState } from '../../../../../store/app-state';
import { IMetricVectorResult } from '../../../../../store/types/base-metric.types';
import { IMetricApplication } from '../../../../../store/types/metric.types';
import { getIntegerFieldSortFunction } from '../../data-sources-controllers/local-filtering-sorting';
import {
  TableCellBooleanIndicatorComponent,
  TableCellBooleanIndicatorComponentConfig,
} from '../../list-table/table-cell-boolean-indicator/table-cell-boolean-indicator.component';
import { ITableColumn } from '../../list-table/table.types';
import { IListAction, ListViewTypes } from '../../list.component.types';
import { BaseCfListConfig } from '../base-cf/base-cf-list-config';
import { CfCellsDataSource } from './cf-cells-data-source';

@Injectable()
export class CfCellsListConfigService extends BaseCfListConfig<IMetricVectorResult<IMetricApplication>> {

  dataSource: CfCellsDataSource;
  defaultView = 'table' as ListView;
  viewType = ListViewTypes.TABLE_ONLY;
  enableTextFilter = true;
  text = {
    title: null,
    filter: 'Search by name',
    noEntries: 'There are no cells'
  };

  private boolIndicatorConfig: TableCellBooleanIndicatorComponentConfig<IMetricVectorResult<IMetricApplication>> = {
    // "0 signifies healthy, and 1 signifies unhealthy"
    isEnabled: (row: IMetricVectorResult<IMetricApplication>) => row ? row.value[1] === '0' : false,
    type: 'enabled-disabled',
    subtle: false,
    showText: false
  };

  columns: Array<ITableColumn<IMetricVectorResult<IMetricApplication>>> = [
    {
      columnId: 'id',
      headerCell: () => 'ID',
      cellDefinition: {
        valuePath: CfCellsDataSource.cellIdPath
      },
      class: 'table-column-select',
      cellFlex: '0 0 100px',
      sort: getIntegerFieldSortFunction(CfCellsDataSource.cellIdPath)
    },
    {
      columnId: 'name',
      headerCell: () => 'Name',
      cellDefinition: {
        valuePath: CfCellsDataSource.cellNamePath,
        getLink: (row: IMetricVectorResult<IMetricApplication>) =>
          `/cloud-foundry/${this.activeRouteCfOrgSpace.cfGuid}/cells/${row.metric.bosh_job_id}/summary`
      },
      cellFlex: '1',
      sort: {
        type: 'sort',
        orderKey: 'name',
        field: CfCellsDataSource.cellNamePath
      }
    },
    {
      columnId: 'deployment',
      headerCell: () => 'Deployment',
      cellDefinition: {
        valuePath: CfCellsDataSource.cellDeploymentPath
      },
      cellFlex: '1',
      sort: {
        type: 'sort',
        orderKey: 'deployment',
        field: CfCellsDataSource.cellDeploymentPath
      }
    },
    {
      columnId: 'healthy',
      headerCell: () => 'Healthy',
      cellComponent: TableCellBooleanIndicatorComponent,
      cellConfig: this.boolIndicatorConfig,
      cellFlex: '1',
      sort: {
        type: 'sort',
        orderKey: 'healthy',
        field: CfCellsDataSource.cellHealthyPath
      }
    },
  ];

  constructor(store: Store<AppState>, private activeRouteCfOrgSpace: ActiveRouteCfOrgSpace) {
    super();
    this.dataSource = new CfCellsDataSource(store, activeRouteCfOrgSpace.cfGuid, this);
  }

  getColumns = () => this.columns;
  getDataSource = () => this.dataSource;
}