import { NavExtensionRoutingModule } from './../../../../examples/custom-src/frontend/app/custom/nav-extension/nav-extension.routing';
import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { Customizations, CustomizationsMetadata } from '../core/customizations.types';
import { MDAppModule } from '../core/md.module';
import { SharedModule } from '../shared/shared.module';
import { AcmeLoginComponent } from './acme-login/acme-login.component';
import { StratosExtension } from '../core/extension/extension-service';
import { AppTabExtensionComponent } from './app-tab-extension/app-tab-extension.component';
import { AppActionExtensionComponent } from './app-action-extension/app-action-extension.component';
import { RouterModule, Routes } from '@angular/router';

const AcmeCustomizations: CustomizationsMetadata = {
  copyright: '&copy; 2018 ACME Corp',
  hasEula: true,
};

const customRoutes: Routes = [{
  path: 'example',
  loadChildren: 'app/custom/nav-extension/nav-extension.module#NavExtensionModule',
  data: {
    stratosNavigation: {
      text: 'Example',
      matIcon: 'extension'
    }
  }
}];

// CustomModule is bundled in to the main application bundle
@StratosExtension({
  routes: customRoutes
})
@NgModule({
  imports: [
    CoreModule,
    SharedModule,
    MDAppModule,
    RouterModule.forChild(customRoutes)
  ],
  declarations: [
    AcmeLoginComponent,
    AppTabExtensionComponent,
    AppActionExtensionComponent
  ],
  entryComponents: [
    AcmeLoginComponent,
    // You must specify the tab and action as an entry components
    AppTabExtensionComponent,
    AppActionExtensionComponent
  ],
  providers: [
    { provide: Customizations, useValue: AcmeCustomizations }
  ],
})
export class CustomModule {}
