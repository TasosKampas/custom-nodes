# Identify Existing User by Attribute

![Journey](images/identify-user-by-attribute/journey.png)

 The Node allows you identify the user based on an identifier found in
- nodeState, or
- objectAttributes object in nodeState

Also, it allows you to store the unique ID into the nodeState

![Node](images/identify-user-by-attribute/config.png)

# Retrieve Attributes

Node that retrieves attribute(s) from IDM

![Journey](images/retrieve-attributes/journey.png)

The Node allows you to retrieves attribute(s) from IDM based on an identifier found in
- nodeState, or
- objectAttributes object in nodeState

Also, it allows you to store the attribute values into
- directly in nodeState
- objectAttributes object in nodeState
or both

The 'Is Identity Attribute the _id_' flag determines if the node should skip the search step. If enabled, the node treats the provided identifier as the user's unique system ID (_id / UUID) and retrieves attributes directly.

![Node](images/retrieve-attributes/config.png)

# Patch Attributes

![Journey](images/patch-attributes/journey.png)

This Node updates (patches) specified attributes on a user's profile based on the user identifier from either
- nodeState, or
- objectAttributes object in nodeState

The new values to be patches are also fetched by the nodeState or objectAttributes, according to the node config.

![Node](images/patch-attributes/config.png)


# Node State Value Decision

![Journey](images/node-state-value-decision/journey.png)

The Node allows compare a nodeState property based on the operation
- Present (checks if the value exists)
- Equals (checks if the value matches a specific expected value)

Also, it allows you to read the state key from 
- directly in nodeState
- objectAttributes object in nodeState

![Node](images/node-state-value-decision/config.png)

# ESV Boolean Check

![Journey](images/esv-boolean-check/journey.png)

The Node allows to check an ESV value whether it's true or false

![Node](images/esv-boolean-check/config.png)

# Display Debug Context

![Journey](images/display-debug-context/journey.png)

The Node displays debug information into a page. It allows you to fetch 
- nodeState
- objectAttributes object in nodeState
- request parameters
- request headers
- cookies

![Node](images/display-debug-context/config.png)

# Merge objectAttributes

![Journey](images/display-debug-context/journey.png)

The Node merges objectAttributes object into a single storage - useful when objectAttributes is present in both nodeState and transientState. Allows for removing null properties

![Node](images/merge-objectAttributes/config.png)

## How to use

Use fr-config-push to push the node into your own AIC tenant or use node importer

