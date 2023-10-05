import { EntityReference, StoryText } from "../../../model/bilingual-story/story";

export function TextView({text}: {text: StoryText}) {
    return <>
        {typeof text === 'string' &&
            text
        }
        {Array.isArray(text) && 
            text.map((t: string | EntityReference, index) => {
                if (typeof t === 'string') {
                    return t;
                } else {
                    let entityRef = t as EntityReference;
                    return <strong key={index}>{entityRef.text}</strong>;
                }
            })
        }
    </>
}