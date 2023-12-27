import { useState } from 'react';
import classNames from 'classnames';
import { TextView } from './text-view';
import { ParagraphElement } from '../../../model/bilingual-story/story';

export function ToggleInlineTranslation({
  bilingual,
}: {
  bilingual: ParagraphElement<'bilingual'>;
}) {
  let [translate, setTranslate] = useState(false);

  const toggle = function () {
    setTranslate(!translate);
  };

  const l2ClassNames = classNames({
    'l2-text': true,
    'fade-in-text': true,
    'highlight-for-translation': translate,
  });

  return (
    <>
      <span className={`toggle-hover ${l2ClassNames}`} onClick={() => toggle()}>
        <TextView
          isEnglish={false}
          text={bilingual.l2}
          // text2={bilingual.l1}
        />
      </span>
      {translate && (
        <span
          className='l1-text highlight-for-translation fade-in-text toggle-hover'
          onClick={() => toggle()}
        >
          {' ('}
          <span>
            <TextView isEnglish={true} text={bilingual.l1} />
          </span>
          {')'}
        </span>
      )}
    </>
  );
}
