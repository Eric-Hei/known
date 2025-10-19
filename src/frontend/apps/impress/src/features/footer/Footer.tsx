import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Box, StyledLink, Text } from '@/components/';
import { useConfig } from '@/core/config';

import { Title } from '../header';

import IconLink from './assets/external-link.svg';
import { ContentType } from './types';

const BlueStripe = styled.div`
  position: absolute;
  height: 2px;
  width: 100%;
  background: var(--c--theme--colors--primary-600);
  top: 0;
`;

export const Footer = () => {
  const { t } = useTranslation();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Known';

  return (
    <Box
      $position="relative"
      as="footer"
      role="contentinfo"
      className="--docs--footer"
    >
      <BlueStripe />
      <Box $padding={{ top: 'small', horizontal: 'big', bottom: 'small' }}>
        <Box
          $direction="row"
          $gap="1.5rem"
          $align="center"
          $justify="space-between"
          $css="flex-wrap: wrap;"
        >
          <Box>
            <Text $size="m" $variation="600">
              {appName} - {t('Your personal workspace')}
            </Text>
          </Box>
          <Box $direction="row" $gap="1.5rem" $align="center">
            <StyledLink
              href="https://github.com/Eric-Hei/known"
              target="_blank"
              $css={css`
                gap: 0.2rem;
                transition: box-shadow 0.3s;
                &:hover {
                  box-shadow: 0px 2px 0 0 var(--c--theme--colors--greyscale-text);
                }
              `}
            >
              <Text $weight="bold">GitHub</Text>
              <IconLink width={18} />
            </StyledLink>
            <Text $size="m" $variation="600" $css="color: #787774;">
              v{version}
            </Text>
          </Box>
        </Box>
        <Box $margin={{ top: 'small' }}>
          <Text
            as="p"
            $size="s"
            $variation="600"
            $css="color: #787774;"
          >
            {t('Based on')} <StyledLink
              href="https://github.com/suitenumerique/docs"
              target="_blank"
              $css={css`
                display: inline-flex;
                box-shadow: 0px 1px 0 0 var(--c--theme--colors--greyscale-text);
                gap: 0.2rem;
              `}
            >
              <Text $variation="600">La Suite Docs</Text>
              <IconLink width={14} />
            </StyledLink> • {t('MIT License')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
