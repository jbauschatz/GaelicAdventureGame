import { EntityReference, StoryText } from "../../../model/bilingual-story/story";

export function TextView({text}: {text: StoryText}) {
    return <>
        {typeof text === 'string' &&
            text
        }
        {Array.isArray(text) && 
            text.map((t: string | EntityReference) => {
                if (typeof t === 'string') {
                    return t;
                } else {
                    let entityRef = t as EntityReference;
                    return <strong>{entityRef.text}</strong>;
                }
            })
        }
    </>
}