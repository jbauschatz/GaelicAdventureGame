import {v4} from 'uuid';

/**
 * Generates a unique id for any game object
 */
export function genId() {
    return v4();
}