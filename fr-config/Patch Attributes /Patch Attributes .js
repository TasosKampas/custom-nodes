var nodeOutcomes = {
    TRUE: "true",
    ERROR: "error"
};

function getUserIdByAttribute(attributeName, attributeValue) {
    var queryFilter = `${attributeName} eq '${attributeValue}'`;
    logger.debug(`Searching user with query filter ${queryFilter}`);
    var userQuery = openidm.query(properties.managedObject, {
        "_queryFilter": queryFilter
    });

    if (!userQuery || userQuery.resultCount === 0) {
        logger.debug(`No user found for ${attributeName}='${attributeValue}'.`);
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

function getAttributeBasedOnConfig(attributeName) {
    var attributeValue;
    if (properties.attributesSource == "NODESTATE") {
        attributeValue = nodeState.get(attributeName);
        logger.debug(`Retrieved attribute from nodeState key ${attributeName} and value ${attributeValue}`);
        return attributeValue;
    }
    var objectAttributes = nodeState.getObject("objectAttributes");
    attributeValue = objectAttributes.get(attributeName);
    logger.debug(`Retrieved attribute from objectAttributes key ${attributeName} and value ${attributeValue}`);
    return attributeValue;
}

function ensureTrailingSlash(managedObject) {
  return managedObject.replace(/\/+$/, '') + '/';
}

function prepareRequestBody(attributes) {

    var requestBody = [];

    attributes.forEach(function(attributeName) {
        var attributeValue = getAttributeBasedOnConfig(attributeName);
        requestBody.push({
            operation: "replace",
            field: "/" + attributeName,
            value: attributeValue
        })
        logger.debug(`Added ${attributeName} to request body`);
    });
    return requestBody;
}

/**
 * Node entry point
 */
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
            logger.warn(`Identity attribute was not found. Aborting.`);
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

        // --- Part 3: Update attributes in profile ---
        var requestBody = prepareRequestBody(properties.attributes);
        var managedObject = ensureTrailingSlash(properties.managedObject);

        openidm.patch(managedObject + userId, null, requestBody);
        logger.debug("Attributes successfully patched.");
        action.goTo(nodeOutcomes.TRUE);
    } catch (e) {
        logger.error("Exception: " + e);
        logger.debug("Stack trace: " + e.stack);
        action.goTo(nodeOutcomes.ERROR);
    }
})();