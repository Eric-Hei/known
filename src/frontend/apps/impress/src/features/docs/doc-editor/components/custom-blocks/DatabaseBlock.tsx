/* eslint-disable react-hooks/rules-of-hooks */
import { BlockNoteEditor, BlockTypeSelectItem } from '@blocknote/react';
import { createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import React from 'react';
import styled from 'styled-components';

import { DatabaseView } from '@/features/database';
import { useDatabaseStore } from '@/features/database';

import { DocsBlockSchema, DocsInlineContentSchema, DocsStyleSchema } from '../../types';

export const DatabaseBlock = createReactBlockSpec(
  {
    type: 'database',
    propSchema: {
      databaseId: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const { createDatabase } = useDatabaseStore();
      const databaseId = block.props.databaseId as string;

      // If no database ID, create a new database
      React.useEffect(() => {
        if (!databaseId) {
          const newDatabase = createDatabase('Untitled Database');
          editor.updateBlock(block, {
            props: { databaseId: newDatabase.id },
          });
        }
      }, [databaseId, block, editor, createDatabase]);

      if (!databaseId) {
        return (
          <Container>
            <LoadingMessage>Creating database...</LoadingMessage>
          </Container>
        );
      }

      return (
        <Container contentEditable={false}>
          <DatabaseView databaseId={databaseId} />
        </Container>
      );
    },
  }
);

const Container = styled.div`
  width: 100%;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin: 8px 0;
  background: white;
`;

const LoadingMessage = styled.div`
  padding: 48px;
  text-align: center;
  color: #787774;
  font-size: 16px;
`;

export const getDatabaseReactSlashMenuItems = (
  editor: BlockNoteEditor<DocsBlockSchema, DocsInlineContentSchema, DocsStyleSchema>,
  t: TFunction,
  groupName: string,
): BlockTypeSelectItem<DocsBlockSchema, DocsInlineContentSchema, DocsStyleSchema>[] => [
  {
    name: t('Database'),
    type: 'database' as any,
    icon: '📊',
    hint: t('Insert a database with tables and views'),
    group: groupName,
  },
];

