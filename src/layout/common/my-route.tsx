// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { pathToRegexp } from 'path-to-regexp';
import { Location } from 'interface/common';
import i18n from '~/i18n';

interface IProps {
  location: Location;
  routeList: RouteItem[];
}
type Ele = () => JSX.Element;
interface RouteItem {
  exact: boolean;
  path: string;
  component: React.LazyExoticComponent<Ele>;
  title: string;
}

const MyRoute = (props: IProps) => {
  React.useEffect(() => {
    const findResult: RouteItem | undefined = props.routeList.find((item: any) => {
      if (item.path === '*') {
        return true;
      }
      const reg = pathToRegexp(item.path);
      return reg.test(props.location.pathname);
    });
    document.title = `${findResult?.title || 'Erda Cloud'} - ${i18n.t('one-stop enterprise digital platform')}`;
  }, [props.routeList, props.location.pathname]);
  return (
    <Switch>
      {
        props.routeList.map((item: any) => {
          return (
            <Route {...item} key={item.path} />
          );
        })
      }
    </Switch>
  );
};

export default withRouter(MyRoute);
