var nodeOutcomes = {
    TRUE: "true",
    FALSE: "false"
};

function mapAttributes(inputAttributes, mappingConfig) {
    var finalMappedAttributes = {};

    var mappingKeys = Object.keys(mappingConfig);
    for (var i = 0; i < mappingKeys.length; i++) {
        var sourceKey = mappingKeys[i];
        var targetKey = mappingConfig[sourceKey]; // e.g., "givenName"

        // Check if the sourceKey exists in the input attributes
        if (inputAttributes.containsKey(sourceKey)) {
            var attributeValue = inputAttributes[sourceKey].get(0);
            // Map the value using the targetKey
            logger.debug("Mapping " + targetKey + " to " + attributeValue);
            finalMappedAttributes[targetKey] = attributeValue;
        }
    }
    if (Object.keys(finalMappedAttributes).length === 0) {
            return null;
    }

    return finalMappedAttributes;
}

(function() {
    logger.debug("node executing");
    var mappingConfig = properties.attributesMap;
    logger.debug("Mapping config: " + mappingConfig);

    if (properties.clearObjectAttributes) {
        if (nodeState.get("objectAttributes")) {
            nodeState.remove("objectAttributes");
        }
    }
    var userInfo = nodeState.getObject("userInfo");
    if (!userInfo) {
        logger.error("SAML userInfo not available in the node state");
        action.goTo(nodeOutcomes.FALSE);
    }
    if (!userInfo.attributes) {
        logger.error("SAML attributes not available in the node state");
        action.goTo(nodeOutcomes.FALSE);
    }
    
    var attributes = userInfo.attributes;
    logger.debug("IdP SAML attributes: " + attributes);
    try {
        var newAttributeObject = mapAttributes(attributes, mappingConfig);
        if (!newAttributeObject) {
            logger.error("No attributes mapped.");
            action.goTo(nodeOutcomes.FALSE);
            return;
        }
    
        logger.debug("initializing objectAttributes");
        nodeState.mergeShared({
            "objectAttributes": newAttributeObject
        });
        action.goTo(nodeOutcomes.TRUE);
    } catch (e) {
        logger.error("Error getting userInfo variable: " + e);
        action.goTo(nodeOutcomes.FALSE);
        return;
    }
})();