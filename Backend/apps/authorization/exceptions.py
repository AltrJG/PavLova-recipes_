class AuthorizationError(Exception):
    pass

class SelfModificationError(AuthorizationError):
    pass

class AuthorizationPermissionError(AuthorizationError):
    pass

class GroupAlreadyAssignedError(AuthorizationError):
    pass

class GroupNotAssignedError(AuthorizationError):
    pass

class InvalidGroupError(AuthorizationError):
    pass

class PermissionAlreadyAssignedError(Exception):
    pass

class PermissionNotAssignedError(Exception):
    pass