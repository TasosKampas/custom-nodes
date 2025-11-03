var nodeOutcomes = {
    NEXT: "next",
    ERROR: "error"
};

(function() {
    logger.debug("node starting");
    try {
        // --- Part 1 - Merge to a single objectAttributes object
        var existingObjectAttributes = nodeState.getObject("objectAttributes");
        var newAttributeObject = {};
        if (!!existingObjectAttributes) {
                    Object.keys(existingObjectAttributes).forEach(
                        function(key) {
                            var value = existingObjectAttributes.get(key);
                            if (!!value) {
                                newAttributeObject[key] = value;
                            } else { // Value is empty/null: Handle removal based on config
                                if (properties.removeEmptyProperties) {
                                    logger.debug(`Property key ${key} is empty and will be discarded.`);
                                } else {
                                     newAttributeObject[key] = value;
                                }
                            }
                        }
                    );
                }
      
		// --- Part 2 - Delete objectAttributes from all states
        nodeState.remove("objectAttributes");

      	// --- Part 3 - Initialize objectAttributes in the final state location
        if (properties.mergeLocation === "NODESTATE") {
            nodeState.mergeShared({
              "objectAttributes": newAttributeObject
            })
        } else {
            nodeState.mergeTransient({
              "objectAttributes": newAttributeObject
            })
        }

        action.goTo(nodeOutcomes.NEXT);
    } catch (e) {
        logger.error("Exception " + e);
        logger.debug("Stack trace " + e.stack);
        action.goTo(nodeOutcomes.ERROR);
    }
})();