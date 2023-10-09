import { isOfVariant, match } from "variant";
import { EntityReference, StoryText } from "../../../model/bilingual-story/story";
import { GameEntityMetadata } from "../../../narrator/game-entity-metadata";
import { constant } from "lodash";

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
                    let entityMetadata: any = entityRef.entity;
                    console.log("Metadata: ", entityMetadata);
                    
                    if (isOfVariant(entityMetadata, GameEntityMetadata)) {
                        console.log("Is variant");
                        let className: string = match(entityMetadata, {
                            enemy: constant('entity-enemy'),
                            item: constant('entity-item'),
                            direction: constant('entity-direction'),
                            other: constant('entity-other')
                        });
                        return <span key={index} className={className}>{entityRef.text}</span>;
                    } else {
                        // Default formatting for any metadata
                        return <span key={index} className="entity-other">{entityRef.text}</span>;
                    }
                }
            })
        }
    </>
}