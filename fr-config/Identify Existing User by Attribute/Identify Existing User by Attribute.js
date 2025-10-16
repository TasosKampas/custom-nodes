var nodeOutcomes = {
    TRUE: "true",
    FALSE: "false",
    ERROR: "error"
};

function getUserIdByAttribute(attributeName, attributeValue) {
    logger.debug(`managedObject: ${properties.managedObject}.`);
    var queryFilter = `${attributeName} eq '${attributeValue}'`;
    var userQuery = openidm.query(ensureTrailingSlash(properties.managedObject), {
        "_queryFilter": queryFilter
    });

    if (!userQuery || userQuery.resultCount === 0) {
        logger.error(`No user found for ${attributeName}='${attributeValue}'.`);
        return null;
    }

    if (userQuery.resultCount !== 1) {
        logger.error(`Ambiguous result: Found ${userQuery.resultCount} users for ${attributeName}='${attributeValue}'.`);
        return null;
    }

    logger.debug("User successfully found and retrieved.");

    var userId = userQuery.result[0]._id;
    return userId;
}

function ensureTrailingSlash(managedObject) {
  return managedObject.replace(/\/+$/, '') + '/';
}

(function() {
    logger.debug("node starting");
    try {
        // --- Part 1: Resolve Identifier ---
        var identifier;
        var identifierKey = properties.identifierStateKey;
        if (properties.identifierSource == "NODESTATE") {
            identifier = nodeState.get(identifierKey);
            logger.debug(`Got identity attribute from nodeState key ${identifierKey} and value ${identifier}`);
        } else {
            var objectAttributes = nodeState.getObject("objectAttributes");
            identifier = objectAttributes.get(identifierKey);
            logger.debug(`Got identity attribute from objectAttributes key ${identifierKey} and value ${identifier}`);
        }

        if (!identifier) {
            logger.error(`Identifier was not found. Aborting.`);
            return action.goTo(nodeOutcomes.FALSE);
        }

        // --- Part 2: Resolve User ID ---
        var userId = getUserIdByAttribute(properties.identityAttribute, identifier);
        if (!userId) {
            logger.warn(`User lookup failed for attribute value: ${identifier} and attribute key ${properties.identityAttribute}. Aborting.`);
            return action.goTo(nodeOutcomes.FALSE);
        }
        logger.debug(`User's _id resolved to ${userId}`);


        // --- Part 3: Store User ID in Node State ---
        if (properties.storeUserId) {
            logger.debug(`Updating nodeState with key ${properties.nodeStateUserIdPropertyName} and value ${userId}`);
            nodeState.putShared(properties.nodeStateUserIdPropertyName, userId);
        }

        action.goTo(nodeOutcomes.TRUE);
        return;
    } catch (e) {
        logger.error("Exception: " + e);
        logger.debug("Stack trace: " + e.stack);
        action.goTo(nodeOutcomes.ERROR);
    }
}());