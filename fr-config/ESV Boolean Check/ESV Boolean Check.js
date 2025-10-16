var nodeOutcomes = {
    TRUE: "true",
    FALSE: "false",
    ERROR: "error"
};

(function() {
    logger.debug("node starting");
    try {

        var esvValue = systemEnv.getProperty(properties.esvName);

        if (esvValue === null || esvValue === undefined) {
            logger.error(`ESV property '${properties.esvName}' was not found.`);
            return action.goTo(nodeOutcomes.ERROR);
        }

        logger.debug(`Retrieved ESV value for '${properties.esvName}': ${esvValue}`);
        
        if (esvValue === "true") {
            return action.goTo(nodeOutcomes.TRUE);
        } else if (esvValue === "false") {
            return action.goTo(nodeOutcomes.FALSE);
        }
        logger.error(`ESV property '${properties.esvName}' has an unexpected value: ${esvValue}. Expected "true" or "false".`);
        return action.goTo(nodeOutcomes.ERROR).build();
    } catch (e) {
        logger.warn("Could not retrieve ESV.");
        logger.error("Encountered an exception: " + e);
        return action.goTo(nodeOutcomes.ERROR);
    }
}());