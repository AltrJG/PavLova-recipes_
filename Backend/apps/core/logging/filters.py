import logging
import re

class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = re.sub(r'Bearer [A-Za-z0-9\-\._~\+\/]+=*', 'Bearer [CENSURADO]', record.msg)
            record.msg = re.sub(r'\'password\': \'.*?\'', '\'password\': \'[CENSURADO]\'', record.msg)
        return True