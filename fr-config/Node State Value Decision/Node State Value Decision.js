var nodeOutcomes = {
    TRUE: "true",
    FALSE: "false"
};

function presenceCheck(key) {
    if (properties.keySource === "NODESTATE" && nodeState.isDefined(key)) {
        logger.debug("presenceCheck in nodeState");
        return true;
    } else if (properties.keySource === "OBJECTATTRIBUTES" && key in nodeState.getObject("objectAttributes")) {
        logger.debug("presenceCheck in objectAttributes");
        return true;
    }

    return false;
}

function resolveKeyValue(key) {
    if (properties.keySource === "NODESTATE") {
        return nodeState.get(key);
    } else {
        return nodeState.getObject("objectAttributes").get(key);
    }
}

(function() {
    logger.debug("node executing");

    if (properties.comparisonOperation === "PRESENT" && presenceCheck(properties.nodeStateKey)) {
        logger.debug(`Node state key ${properties.nodeStateKey} is present`);
        action.goTo(nodeOutcomes.TRUE);
        return;
    }
    var stateKey = resolveKeyValue(properties.nodeStateKey)
    if (stateKey === properties.comparisonValue) {
        logger.debug(`Node state key ${properties.nodeStateKey} value is equal to ${properties.comparisonValue}`);
        action.goTo(nodeOutcomes.TRUE);
        return;
    }
    logger.debug("Comparison was not successful.");
    action.goTo(nodeOutcomes.FALSE);
    return;
})();