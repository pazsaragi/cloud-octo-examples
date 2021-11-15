class MissingInputError(Exception):
    pass

class DBPutItemError(Exception):
    pass

class GenericWorkflowError(Exception):
    """
    Generic errors as part of a workflow.
    """

    def __init__(self, message: str = "Generic Workflow Error") -> None:
        super().__init__(message)