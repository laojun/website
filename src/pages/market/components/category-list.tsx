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

import * as React from 'react';
import './category-list.scss';

interface IProps {
  list: string[];
  activeKey?: string;
  className?: string;
  onClick: (name: string, e: any) => any;
}

export const CategoryList = ({
  list,
  activeKey,
  onClick,
  className = '',
}: IProps) => {
  return (
    <div className={`service-category-list ${className}`}>
      {list.map((category, i) => {
        const cls = activeKey === category ? 'active' : '';
        return (
          <div
            key={i}
            className={`category-item ${cls}`}
            onClick={(e) => onClick(category, e)}
          >
            <span>{category}</span>
          </div>
        );
      })}
    </div>
  );
};
