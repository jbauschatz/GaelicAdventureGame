import { isOfVariant, match } from 'variant';
import {
  EntityReference,
  StoryText,
} from '../../../model/bilingual-story/story';
import { GameEntityMetadata } from '../../../narrator/game-entity-metadata';
import { constant } from 'lodash';

interface TextViewProps {
  text: StoryText;
  isEnglish: boolean;
}

export function TextView({ text, isEnglish }: TextViewProps) {
  return (
    <>
      {typeof text === 'string' && text}
      {Array.isArray(text) &&
        text.map((t: string | EntityReference, index) => {
          if (typeof t === 'string') {
            return t;
          } else {
            let entityRef = t as EntityReference;
            let entityMetadata: any = entityRef.entity;
            let className: string;

            if (isOfVariant(entityMetadata, GameEntityMetadata)) {
              if (isEnglish) {
                className = match(entityMetadata, {
                  enemy: constant('entity-enemy-english'),
                  companion: constant('entity-companion-english'),
                  item: constant('entity-companion-english'),
                  direction: constant('entity-direction-english'),
                  other: constant('entity-other-english'),
                });
              } else {
                className = match(entityMetadata, {
                  enemy: constant('entity-enemy'),
                  companion: constant('entity-companion'),
                  item: constant('entity-companion'),
                  direction: constant('entity-direction'),
                  other: constant('entity-other'),
                });
              }


              return (
                <span key={index} className={className}>
                  {entityRef.text}
                </span>
              );
            } else {
              // Default formatting for any metadata
              return <span key={index} className='entity-other'></span>;
            }
          }
        })}
    </>
  );
}
