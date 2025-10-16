var nodeOutcomes = {
    TRUE: "true",
    ERROR: "error"
};

function getUserIdByAttribute(attributeName, attributeValue) {
    var queryFilter = `${attributeName} eq '${attributeValue}'`;
    var userQuery = openidm.query(properties.managedObject, {
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
        // --- Part 1: Resolve Identity Attribute ---
        var identityAttribute;
        var identifier = properties.identifierStateKey || properties.identifier;
        if (properties.identifierSource == "NODESTATE") {
            identityAttribute = nodeState.get(identifier);
            logger.debug(`Got identity attribute from nodeState key ${identifier} and value ${identityAttribute}`);
        } else {
            var objectAttributes = nodeState.getObject("objectAttributes");
            identityAttribute = objectAttributes.get(identifier);
            logger.debug(`Got identity attribute from objectAttributes key ${identifier} and value ${identityAttribute}`);
        }

        if (!identityAttribute) {
            logger.error(`Identity attribute was not found. Aborting.`);
            return action.goTo(nodeOutcomes.ERROR);
        }

        // --- Part 2: Resolve User ID ---
        var userId;
        if (properties.skipIdLookup) {
            userId = identityAttribute;
            logger.debug(`User's _id set to identity attribute value ${userId}`);
        } else {
            userId = getUserIdByAttribute(properties.identifier, identityAttribute);
            if (!userId) {
                logger.warn(`User lookup failed for attribute value: ${identityAttribute}. Aborting.`);
                return action.goTo(nodeOutcomes.ERROR);
            }
            logger.debug(`User's _id resolved to ${userId}`);
        }

        // --- Part 3: Fetch Profile and Prepare State Update ---
        var managedObject = ensureTrailingSlash(properties.managedObject);
        var userProfile = openidm.read(managedObject + userId, null, properties.attributes);

        // --- Part 4: Process Attributes and Update State ---
        var oa = nodeState.get("objectAttributes"); // init, maybe not used though
        var objectAttributesIsPresent = true;
        if (!oa) {
            var objectAttributesIsPresent = false;
        }
        properties.attributes.forEach(function(attributeName) {
            logger.debug(`Retrieved Attribute name: ${attributeName} with value: ${userProfile[attributeName]}`);
            if (properties.updateNodeState) {
                logger.debug(`Updating nodeState with key ${attributeName} and value ${userProfile[attributeName]}`);
                nodeState.putShared(attributeName, userProfile[attributeName]);
            }
            if (properties.updateObjectAttributes) {
                if (objectAttributesIsPresent) {
                    logger.debug(`Updating objectAttributes with key ${attributeName} and value ${userProfile[attributeName]}`);
                    oa[attributeName] = userProfile[attributeName];
                    nodeState.putShared("objectAttributes", oa);
                }
            }
        });
        action.goTo(nodeOutcomes.TRUE);
        return;
    } catch (e) {
        logger.error("Exception: " + e);
        logger.debug("Stack trace: " + e.stack);
        action.goTo(nodeOutcomes.ERROR);
    }
}());