/* eslint-disable react-hooks/rules-of-hooks */
import { insertOrUpdateBlock } from '@blocknote/core';
import { BlockNoteEditor, BlockTypeSelectItem } from '@blocknote/react';
import { createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import React from 'react';
import styled from 'styled-components';

import { Icon } from '@/components';
import { DatabaseView } from '@/features/database';
import { useDatabaseStore } from '@/features/database';

import { DocsBlockNoteEditor, DocsBlockSchema, DocsInlineContentSchema, DocsStyleSchema } from '../../types';

const DatabaseSelector: React.FC<{
  onSelect: (databaseId: string) => void;
  onCreateNew: () => void;
}> = ({ onSelect, onCreateNew }) => {
  const databases = useDatabaseStore((state) => state.databases);
  const databaseList = Object.values(databases);

  return (
    <SelectorContainer>
      <SelectorTitle>Choose a database</SelectorTitle>

      <CreateNewButton onClick={onCreateNew}>
        <Icon iconName="add" $size="16px" />
        Create new database
      </CreateNewButton>

      {databaseList.length > 0 && (
        <>
          <Divider>or link existing</Divider>
          <DatabaseList>
            {databaseList.map((db) => (
              <DatabaseItem key={db.id} onClick={() => onSelect(db.id)}>
                <Icon iconName="table_chart" $size="16px" />
                <span>{db.title || 'Untitled Database'}</span>
                <DatabaseMeta>
                  {db.rows.length} rows · {db.properties.length} properties
                </DatabaseMeta>
              </DatabaseItem>
            ))}
          </DatabaseList>
        </>
      )}
    </SelectorContainer>
  );
};

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
      const [showSelector, setShowSelector] = React.useState(!databaseId);

      const handleCreateNew = () => {
        const newDatabase = createDatabase('Untitled Database');
        queueMicrotask(() => {
          editor.updateBlock(block, {
            props: { databaseId: newDatabase.id },
          });
        });
        setShowSelector(false);
      };

      const handleSelectExisting = (selectedId: string) => {
        queueMicrotask(() => {
          editor.updateBlock(block, {
            props: { databaseId: selectedId },
          });
        });
        setShowSelector(false);
      };

      if (showSelector) {
        return (
          <Container>
            <DatabaseSelector
              onSelect={handleSelectExisting}
              onCreateNew={handleCreateNew}
            />
          </Container>
        );
      }

      if (!databaseId) {
        return (
          <Container>
            <LoadingMessage>Loading database...</LoadingMessage>
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

const SelectorContainer = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SelectorTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #37352f;
`;

const CreateNewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #2383e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a6ec7;
  }

  svg {
    flex-shrink: 0;
  }
`;

const Divider = styled.div`
  text-align: center;
  color: #9b9a97;
  font-size: 13px;
  position: relative;
  margin: 8px 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #e0e0e0;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

const DatabaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const DatabaseItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 14px;
  color: #37352f;

  &:hover {
    background: #efefef;
    border-color: #2383e2;
  }

  svg {
    flex-shrink: 0;
    color: #787774;
  }

  span {
    flex: 1;
    font-weight: 500;
  }
`;

const DatabaseMeta = styled.div`
  font-size: 12px;
  color: #9b9a97;
  margin-left: auto;
`;

export const getDatabaseReactSlashMenuItems = (
  editor: DocsBlockNoteEditor,
  t: TFunction<'translation', undefined>,
  group: string,
) => [
  {
    title: t('Database'),
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;

      // Insert the database block
      insertOrUpdateBlock(editor, {
        type: 'database',
      });

      // Insert a new paragraph after to avoid cursor issues
      queueMicrotask(() => {
        try {
          editor.insertBlocks(
            [{ type: 'paragraph' }],
            currentBlock,
            'after'
          );
        } catch (e) {
          // Ignore errors - this is just to improve UX
        }
      });
    },
    aliases: ['database', 'table', 'db', 'data', 'collection'],
    group,
    icon: <Icon iconName="table_chart" $size="18px" />,
    subtext: t('Insert a database with tables and views'),
  },
];

