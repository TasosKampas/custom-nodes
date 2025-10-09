var nodeOutcomes = {
    TRUE: "true",
    ERROR: "error"
};

function getUserIdByAttribute(attributeName, attributeValue) {
    var queryFilter = `${attributeName} eq '${attributeValue}'`;
    var userQuery = openidm.query(properties.objectLookup, {
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

(function() {
    logger.debug("node starting");
    try {
        var userId;
        if (properties.keyInStateOrObjectAttributes == "NODESTATE") {
            userId = nodeState.get(properties.identifier);
            logger.debug(`Got identity attribute from nodeState key ${properties.identifier} and value ${userId}`);
        } else {
            var objectAttributes = nodeState.getObject("objectAttributes");
            var attributeValue = objectAttributes.get(properties.identifier);
            logger.debug(`Retrieving user profile from objectAttributes key ${properties.identifier} and value ${attributeValue}`);
            userId = getUserIdByAttribute(properties.identifier, attributeValue);
            if (!userId) {
                return action.goTo(nodeOutcomes.ERROR);
            }
            logger.debug(`Got identity attribute from objectAttributes key ${properties.identifier} and value ${userId}`);
        }


        var userProfile = openidm.read(properties.objectLookup + "/" + userId, null, properties.attributes);
        var oa = nodeState.get("objectAttributes"); // init, maybe not used though
        properties.attributes.forEach(function(attributeName) {

            logger.debug(`Retrieved Attribute name: ${attributeName} with value: ${userProfile[attributeName]}`);
            if (properties.updateNodeState) {
                logger.debug(`Updating nodeState with key ${attributeName} and value ${userProfile[attributeName]}`);
                nodeState.putShared(attributeName, userProfile[attributeName]);
            }
            if (properties.updateObjectAttributes) {
                if (oa) {
                    logger.debug(`Updating objectAttributes with key ${attributeName} and value ${userProfile[attributeName]}`);
                    oa[attributeName] = userProfile[attributeName];
                    nodeState.putShared("objectAttributes", oa);                    
                }
            }
        });
        return action.goTo(nodeOutcomes.TRUE);
    } catch (e) {
        logger.warn("Could not get user profile.");
        logger.error("Encountered an exception: " + e);
        return action.goTo(nodeOutcomes.ERROR);
    }
}());