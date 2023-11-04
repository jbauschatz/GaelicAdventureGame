import _ from "lodash";

export function capitalizeGaelic(input: string): string {
    // TODO This should abide by Gaelic orthography, like capitalizing the "s" in "'S mise"
    return _.capitalize(input);
}