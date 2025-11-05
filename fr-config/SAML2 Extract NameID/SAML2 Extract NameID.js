var config = {
    nameIdInfo: "sun-fm-saml2-nameid-info" // static
};

var nodeOutcomes = {
    TRUE: "true",
    FALSE: "false"
};

(function() {
    logger.debug("node executing");

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
    
    var nameIdInfo = attributes.get(config.nameIdInfo);
    if (nameIdInfo) {
        var nameId = nameIdInfo[0].split("|")[2];
        logger.debug("normalized nameId " + nameId);
        logger.debug("Setting nodeState key " + properties.samlNameIdStateVariable + " to " + nameId);
        nodeState.putShared(properties.samlNameIdStateVariable, nameId);
        var nameIdInfoFormat = nameIdInfo[0].split("|")[4];
        logger.debug("normalized nameIdInfoFormat " + nameIdInfoFormat);
        logger.debug("Setting nodeState key " + properties.samlNameIdFormatStateVariable + " to " + nameIdInfoFormat);
        nodeState.putShared(properties.samlNameIdFormatStateVariable, nameIdInfoFormat);
    } else {
        logger.error("No NameID in assertion");
        action.goTo(nodeOutcomes.FALSE);
        return;
    }
    action.goTo(nodeOutcomes.TRUE);
})();