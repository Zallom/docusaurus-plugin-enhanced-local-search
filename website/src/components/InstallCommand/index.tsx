import React, {type ReactNode} from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const PACKAGE = 'docusaurus-plugin-enhanced-local-search';

const MANAGERS = [
  {value: 'npm', command: `npm install ${PACKAGE}`},
  {value: 'pnpm', command: `pnpm add ${PACKAGE}`},
  {value: 'yarn', command: `yarn add ${PACKAGE}`},
  {value: 'bun', command: `bun add ${PACKAGE}`},
];

// groupId: the chosen package manager is remembered and shared by every tab group of the site.
export default function InstallCommand(): ReactNode {
  return (
    <Tabs groupId="package-manager" queryString>
      {MANAGERS.map(({value, command}) => (
        <TabItem key={value} value={value} label={value}>
          <CodeBlock language="bash">{command}</CodeBlock>
        </TabItem>
      ))}
    </Tabs>
  );
}
